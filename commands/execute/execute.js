import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { minecraftServer } from '../../utility/minecraft-server.js';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = true;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('execute')
        .setDescription('Remotely send a command for the server to execute')
        .setDefaultMemberPermissions(requiredMemberPermissions)
        .addStringOption((option) => option.setName('command').setDescription('Command to be executed').setRequired(true));
}

// Function executed by listener
export async function execute(interaction) {
    if (!minecraftServer.isRunning()) {
        // Ensures the server is running
        await interaction.reply("Server is not on!");
        return;
    }

    const command = interaction.options.getString('command').trim();
    await minecraftServer.execute(interaction, command);
}
