
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

// Leverage the CommonJS require function to load JSON files
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Dynamically loads all commands from the ./commands directory.
 * @param {import('discord.js').Client} client - The Discord client instance.
 * @param {bigint|null} adminRoleBitfield - Permission bitfield for admin role, or null.
 * @returns {Array<object>} slashCommands - Array of command JSON for deployment.
 */
export function loadCommands(client, adminRoleBitfield) {
    const slashCommands = [];

    const foldersPath = join(process.cwd(), 'commands');
    const commandFolders = readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const command = require(filePath);

            if ('requireAdminRole' in command && 'createData' in command && 'execute' in command) {
                const requiredMemberPermissions = command.requireAdminRole ? adminRoleBitfield : null;
                const commandData = command.createData(requiredMemberPermissions);

                slashCommands.push(commandData.toJSON());
                // Save the commnads in client object locally for parity
                client.commands.set(commandData.name, {data: commandData, execute: command.execute});
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "requireAdminRole", "createData" or "execute" property.`);
            }
        }
    }

    return slashCommands;
}
