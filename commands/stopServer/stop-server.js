import { SlashCommandBuilder } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command 
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('stop-server')
        .setDescription('Remotely stop the Minecraft server')
            .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
export async function execute(interaction) {
    if (minecraftServer.isBusy()) {
        // Ensures that no operation is currently being ran on the server
        await interaction.reply('Server is busy right now! Please wait for the current process to finish executing.');
        return;
    } 

    if (!minecraftServer.isRunning()) {
        // Ensures the server is running
        await interaction.reply("Server is not on!");
        return;
    }

    await minecraftServer.stop(interaction);
}