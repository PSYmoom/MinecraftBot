import { SlashCommandBuilder } from 'discord.js';

import { getServer } from '../../utility/server-registry.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = true;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('execute')
        .setDescription('Remotely send a command for a Minecraft server to execute')
        .setDefaultMemberPermissions(requiredMemberPermissions)
        .addStringOption((option) =>
            option.setName('server')
                .setDescription('Which Minecraft server to send the command to')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption((option) =>
            option.setName('command')
                .setDescription('Command to be executed')
                .setRequired(true));
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

    const command = interaction.options.getString('command').trim();
    await server.execute(interaction, command);
}
