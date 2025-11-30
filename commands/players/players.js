import { SlashCommandBuilder } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('players')
        .setDescription('Check who are playing currently on the Minecraft server')
        .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
export async function execute(interaction) {
    if (!minecraftServer.isRunning()) {
        // Ensures the server is running
        await interaction.reply("Server is not on!");
        return;
    }

    await minecraftServer.execute(interaction, 'list');
}