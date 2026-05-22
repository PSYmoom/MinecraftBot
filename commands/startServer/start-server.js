import { SlashCommandBuilder } from 'discord.js';

import { getServer } from '../../utility/server-registry.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('start-server')
        .setDescription('Remotely start a Minecraft server')
        .setDefaultMemberPermissions(requiredMemberPermissions)
        .addStringOption((option) =>
            option.setName('server')
                .setDescription('Which Minecraft server to start')
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

    if (server.isBusy()) {
        await interaction.reply(`Server **${name}** is busy right now! Please wait for the current process to finish executing.`);
        return;
    }

    if (!server.isStopped()) {
        await interaction.reply(`Server **${name}** is already on!`);
        return;
    }

    await server.start(interaction);
}
