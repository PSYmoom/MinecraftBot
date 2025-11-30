import { SlashCommandBuilder } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('start-server')
        .setDescription('Remotely start the Minecraft server')
        .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
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