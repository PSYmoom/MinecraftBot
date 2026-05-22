import { SlashCommandBuilder } from 'discord.js';

import { reloadRegistry } from '../../utility/server-registry.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = true;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('reload-servers')
        .setDescription('Re-scan MC_SERVERS_ROOT for new or removed server folders')
        .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
export async function execute(interaction) {
    const { added, removed, orphaned } = reloadRegistry();

    const parts = ['Registry reloaded.'];
    parts.push(added.length ? `Added: ${added.join(', ')}` : 'Added: (none)');
    parts.push(removed.length ? `Removed: ${removed.join(', ')}` : 'Removed: (none)');
    if (orphaned.length) {
        parts.push(`Orphaned (still running but folder missing): ${orphaned.join(', ')}`);
    }

    await interaction.reply(parts.join('\n'));
}
