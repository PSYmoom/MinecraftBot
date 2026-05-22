import { once } from 'events';
import { MessageFlags } from 'discord.js';
import { spawn } from 'child_process';

import { ServerState } from './change-status.js';

// --- Class ---
export class MinecraftServer {
    // --- Attributes ---
    #proc;
    #state;
    #config;
    #onStateChange;

    // --- Constructor ---
    /**
     * @param {object} config - { name, location, scriptName, port, type }
     * @param {(server: MinecraftServer) => void} [onStateChange] - Invoked after every state transition.
     */
    constructor(config, onStateChange) {
        this.#proc = null;
        this.#config = config;
        this.#onStateChange = onStateChange;
        this.#updateStatus(ServerState.STOPPED);
    }

    // --- Public methods ---
    getName() { return this.#config.name; }
    getState() { return this.#state; }
    getConfig() { return this.#config; }

    /**
     * Starts the Minecraft server process.
     * - Spawns the per-server start script as a child process.
     * - Wires up stdout/stderr logging and unexpected exit/error handlers.
     * - Sets internal state to either RUNNING or STOPPED based on outcome of start up.
     *
     * Notes:
     * - Notifies the Discord interaction of progress in various steps of the way
     * - Startup race ensures either success ("Server open!") or failure is reported.
     */
    async start(interaction) {
        this.#updateStatus(ServerState.STARTING);

        // Create a child process
        await interaction.reply(`Starting server **${this.#config.name}**...`);

        this.#proc = spawn(this.#config.scriptName, {
            cwd: this.#config.location,
            shell: true
        });

        // Set up logging to console
        this.#attachLogging();

        // Set up recovery from unexpected shutdown or error
        this.#onUnexpectedExit();
        this.#onUnexpectedError();

        // Wait until the child process finishes initializing
        await this.#monitorStartup(interaction);
    }

    /**
     * Stops the Minecraft server process gracefully.
     * - Sends "stop" command to the server's stdin.
     * - Logs and reports exit code/signal.
     * - Cleans up internal attributes
     *
     * Notes:
     * - Ensures Discord interaction is updated with exit reason.
     * - Unexpected exit handler distinguishes STOPPING vs crash.
     */
    async stop(interaction) {
        this.#updateStatus(ServerState.STOPPING);

        // Set up listener to catch the process exit event 
        this.#proc.once('exit', async (code, signal) => {
            console.log(`[${this.#config.name}] ${this.#errorStatement(code, signal)}`);
            await interaction.followUp(this.#errorStatement(code, signal));
            this.#cleanup();
        });

        // Send the stop signal to the child process
        await interaction.reply(`Stopping server **${this.#config.name}**...`);
        this.#proc.stdin.write('stop\n');
    }

    /**
     * Executes a command on the running Minecraft server.
     *
     * Notes:
     * - Currently uses a fixed 0.5s log forwarding window (durationMs = 500),
     *   which works reliably for most commands
     */
    async execute(interaction, command) {
        console.log(`[${this.#config.name}] ${command} command executed by ${interaction.user.username}`);
        this.#forwardLogs(interaction);
        this.#proc.stdin.write(command.trim() + '\n');
    }

    /**
     * Indicates whether the server is currently processing a request.
     *
     * Note:
     * - Prevents overlapping start/stop commands to ensure that operations are mutually exclusive
     */
    isBusy() {
        return this.#state == ServerState.STARTING || this.#state == ServerState.STOPPING;
    }

    /**
     * Indicates whether the server is currently running.
     */
    isRunning() {
        return this.#state == ServerState.RUNNING;
    }

    /**
     * Indicates whether the server is currently stopped.
     */
    isStopped() {
        return this.#state == ServerState.STOPPED;
    }

    // --- Private methods ---
    #isVanilla() {
        return this.#config.type === 'vanilla';
    }

    #updateStatus(serverState) {
        this.#state = serverState;
        if (this.#onStateChange) this.#onStateChange(this);
    }

    #attachLogging() {
        if (!this.#proc) return;

        this.#proc.stdout.on('data', line => {
            console.log(`[${this.#config.name}] stdout: ${line.toString().trim()}`);
        });

        this.#proc.stderr.on('data', line => {
            console.error(`[${this.#config.name}] stderr: ${line.toString().trim()}`);
        });
    }

    #onUnexpectedExit() {
        this.#proc.once('exit', (code, signal) => {
            if (this.#state != ServerState.STOPPING) {
                console.log(`[${this.#config.name}] ${this.#errorStatement(code, signal)}`);
                // TODO: Send unexpected message to appropriate channel
                this.#cleanup();
            }
        });
    }

    #onUnexpectedError() {
        this.#proc.once('error', (err) => {
            console.log(`[${this.#config.name}]`, err);
            // TODO: Send unexpected message to appropriate channel
            this.#cleanup();
        });
    }

    #cleanup() {
        if (!this.#proc) return;

        this.#proc.stdout.removeAllListeners('data');
        this.#proc.stderr.removeAllListeners('data');
        this.#proc.removeAllListeners('exit');
        this.#proc.removeAllListeners('error');

        this.#proc = null;
        this.#updateStatus(ServerState.STOPPED);
    }

    #errorStatement(code, signal) {
        let suffix = code != null ? `${code}` : `signal ${signal}`;
        return `Minecraft Server **${this.#config.name}** exited with code ${suffix}`;
    }

    // Wait for either "help" on stdout (vanilla) / "Server Backup done!" (modded) OR first stderr event
    async #monitorStartup(interaction) {
        const response = {
            content: '',
            flags: MessageFlags.Ephemeral,
        };

        try {
            response.content = await this.#startRace();
            this.#updateStatus(ServerState.RUNNING);
            await interaction.followUp(`**${this.#config.name}**: ${response.content}`);
        } catch (error) {
            this.#proc = null;
            this.#updateStatus(ServerState.STOPPED);
            await interaction.followUp(error.message);
            throw error;
        }
    }

    async #startRace() {
        return Promise.race([
            this.#monitorStartupStdout(),
            this.#monitorStartupStderr()
        ]);
    }

    async #monitorStartupStdout() {
        // Modded (Forge) servers log differently and emit non-fatal errors during boot.
        // Vanilla finishes boot when the help banner prints; Forge prints "Server Backup done!".
        const completionMarker = this.#isVanilla() ? '"help"' : 'Server Backup done!';

        while (this.#state == ServerState.STARTING) {
            let line = await once(this.#proc.stdout, 'data');
            line = line.toString().trim();
            if (line.endsWith(completionMarker)) {
                return 'Server open!';
            } else if (this.#isVanilla() && line.includes('ERROR')) {
                throw new Error('Error encountered during startup! Please check console for more details');
            }
        }
    }

    async #monitorStartupStderr() {
        while (this.#state == ServerState.STARTING) {
            let line = await once(this.#proc.stderr, 'data');
            line = line.toString().trim();
            // Vanilla treats any non-WARNING stderr line as fatal. Modded servers
            // emit lots of harmless stderr chatter during boot, so we ignore it.
            if (this.#isVanilla() && !line.includes('WARNING')) {
                throw new Error('stderr: ' + line);
            }
        }
    }

    // Forwards all logs collected to Discord during durationMs
    async #forwardLogs(interaction, durationMs = 500) {
        const end = Date.now() + durationMs;
        let log = 'Command executed successfully! Here is the relevant log output:\n';

        while (Date.now() < end) {
            const timeout = end - Date.now();
            let line = await Promise.race([
                once(this.#proc.stdout, 'data'),
                new Promise(resolve => setTimeout(resolve, timeout))]);

            if (!line) break;

            log += line.toString().trim() + '\n';
        }

        // Limit is 2k characters. Need to account for statements manually added
        if (log.length > 2000) {
            const suffix = '...\nMessage Limit reached! Please check console for the rest of the logs.';
            log = log.slice(0, 2000 - suffix.length) + suffix;
        }

        await interaction.reply(log);
    }
}
