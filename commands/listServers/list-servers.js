import { SlashCommandBuilder } from 'discord.js';

import { listServers } from '../../utility/server-registry.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('list-servers')
        .setDescription('Show all configured Minecraft servers and their current state')
        .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
export async function execute(interaction) {
    const servers = listServers();

    if (servers.length === 0) {
        await interaction.reply('No servers are currently configured. Check `MC_SERVERS_ROOT` and try `/reload-servers`.');
        return;
    }

    const nameWidth = Math.max(...servers.map(s => s.name.length));
    const typeWidth = Math.max(...servers.map(s => s.type.length));

    const lines = servers.map(s =>
        `${s.name.padEnd(nameWidth)}  [${s.type.padEnd(typeWidth)}]  port ${s.port}  —  ${s.state}`
    );

    await interaction.reply('```\n' + lines.join('\n') + '\n```');
}
