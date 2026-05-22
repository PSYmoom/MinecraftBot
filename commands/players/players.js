import { SlashCommandBuilder } from 'discord.js';

import { getServer } from '../../utility/server-registry.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('players')
        .setDescription('Check who is playing currently on a Minecraft server')
        .setDefaultMemberPermissions(requiredMemberPermissions)
        .addStringOption((option) =>
            option.setName('server')
                .setDescription('Which Minecraft server to query')
                .setRequired(true)
                .setAutocomplete(true));
}

// Function executed by listener
export async function execute(interaction) {
    const name = interaction.options.getString('server');
    const server = getServer(name);

    if (!server) {
        await interaction.reply(`Unknown server: \`${name}\`.`);
        return;
    }

    if (!server.isRunning()) {
        await interaction.reply(`Server **${name}** is not on!`);
        return;
    }

    await server.execute(interaction, 'list');
}
