import { SlashCommandBuilder } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Command definition
export const data = new SlashCommandBuilder()
    .setName('start-server')
    .setDescription('Remotely start the Minecraft server');

export async function execute(interaction) {
    if (minecraftServer.isBusy()) {
        // Ensures that no operation is currently being ran on the server
        await interaction.reply('Server is bust right now! Please wait for the current process to finish executing.');
        return;
    } 

    if (!minecraftServer.isStopped()) {
        // Ensures the server is stopped
        await interaction.reply('Server is already on!');
        return;
    }

    await minecraftServer.start(interaction);
}