import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Command definition
export const data = new SlashCommandBuilder()
    .setName('execute')
    .setDescription('Remotely send a command for the server to execute')
    // TODO: Figure out how to extract permissions from roles and figure out which one djman69 has dynamically
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) => option.setName('command').setDescription('Command to be executed').setRequired(true));

export async function execute(interaction) {
    if (!minecraftServer.isRunning()) {
        // Ensures the server is running
        await interaction.reply("Server is not on!");
        return;
    }

    const command = interaction.options.getString('command').trim();
    await minecraftServer.execute(interaction, command);
}