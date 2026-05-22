import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'process';

import { MinecraftServer } from './minecraft-server.js';
import { setAggregatePresence } from './change-status.js';

const registry = new Map();
let botUser = null;

/**
 * Scans MC_SERVERS_ROOT and returns an array of config objects, one per
 * eligible subdirectory. Subdirectories without a platform-appropriate start
 * script are skipped.
 * @returns {Array<{name: string, location: string, scriptName: string, port: number, type: 'vanilla'|'modded'}>}
 */
export function discoverServers() {
    const root = process.env.MC_SERVERS_ROOT;
    if (!root || !existsSync(root)) {
        console.warn(`[registry] MC_SERVERS_ROOT is not set or does not exist (got "${root}"). No servers discovered.`);
        return [];
    }

    const isWindows = process.platform === 'win32';
    const scriptFile = isWindows ? 'server_start.bat' : 'server_start.sh';
    const scriptInvocation = isWindows ? 'server_start.bat' : './server_start.sh';

    const configs = [];
    const portsSeen = new Map();

    for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        const location = join(root, entry.name);
        if (!existsSync(join(location, scriptFile))) {
            console.warn(`[registry] Skipping "${entry.name}": no ${scriptFile} found.`);
            continue;
        }

        const port = readServerPort(location);
        const type = detectServerType(location);

        if (portsSeen.has(port)) {
            console.warn(`[registry] Port ${port} is shared between "${portsSeen.get(port)}" and "${entry.name}". Make sure only one runs at a time.`);
        } else {
            portsSeen.set(port, entry.name);
        }

        configs.push({
            name: entry.name,
            location,
            scriptName: scriptInvocation,
            port,
            type,
        });
    }

    return configs;
}

function readServerPort(serverDir) {
    const propsPath = join(serverDir, 'server.properties');
    if (!existsSync(propsPath)) return 25565;

    try {
        const contents = readFileSync(propsPath, 'utf8');
        for (const rawLine of contents.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) continue;
            const match = line.match(/^server-port\s*=\s*(\d+)$/);
            if (match) return Number(match[1]);
        }
    } catch (err) {
        console.warn(`[registry] Could not read ${propsPath}:`, err.message);
    }
    return 25565;
}

function detectServerType(serverDir) {
    const entries = readdirSync(serverDir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isFile()) {
            if (/^forge-.*\.jar$/i.test(entry.name)) return 'modded';
            if (entry.name === 'fabric-server-launch.jar') return 'modded';
        }
        if (entry.isDirectory() && entry.name === 'mods') {
            const modsDir = join(serverDir, 'mods');
            try {
                const hasMods = readdirSync(modsDir).some(f => /\.(jar|jar\.disabled)$/i.test(f));
                if (hasMods) return 'modded';
            } catch { /* ignore */ }
        }
    }
    return 'vanilla';
}

/**
 * Builds the registry from discovery output. Wires a state-change callback so
 * presence updates whenever any server transitions.
 */
export function initServerRegistry(client) {
    if (!client?.user) {
        throw new Error('Client is not ready. Server registry cannot initialize.');
    }
    botUser = client.user;

    registry.clear();
    for (const config of discoverServers()) {
        registry.set(config.name, new MinecraftServer(config, refreshPresence));
        console.log(`[registry] Loaded server "${config.name}" (${config.type}, port ${config.port}).`);
    }

    refreshPresence();
}

/**
 * Re-runs discovery. Adds new folders, removes vanished ones (only if their
 * server is not currently running). Existing entries are left untouched.
 * @returns {{added: string[], removed: string[], orphaned: string[]}}
 */
export function reloadRegistry() {
    const discovered = new Map(discoverServers().map(c => [c.name, c]));
    const added = [];
    const removed = [];
    const orphaned = [];

    for (const [name, config] of discovered) {
        if (!registry.has(name)) {
            registry.set(name, new MinecraftServer(config, refreshPresence));
            added.push(name);
        }
    }

    for (const name of [...registry.keys()]) {
        if (discovered.has(name)) continue;
        const server = registry.get(name);
        if (server.isStopped()) {
            registry.delete(name);
            removed.push(name);
        } else {
            orphaned.push(name);
        }
    }

    refreshPresence();
    return { added, removed, orphaned };
}

export function getServer(name) {
    return registry.get(name);
}

export function serverNames() {
    return [...registry.keys()];
}

export function listServers() {
    return [...registry.values()].map(s => {
        const cfg = s.getConfig();
        return { name: cfg.name, type: cfg.type, port: cfg.port, state: s.getState() };
    });
}

function refreshPresence() {
    if (!botUser) return;
    setAggregatePresence(botUser, [...registry.values()]).catch(err => {
        console.error('[registry] Failed to update presence:', err);
    });
}
