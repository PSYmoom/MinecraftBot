import { SlashCommandBuilder } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Command definition
export const data = new SlashCommandBuilder()
    .setName('players')
    .setDescription('Check who are playing currently on the Minecraft server');

export async function execute(interaction) {
    if (!minecraftServer.isRunning()) {
        // Ensures the server is running
        await interaction.reply("Server is not on!");
        return;
    }

    await minecraftServer.execute(interaction, 'list');
}