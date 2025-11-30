import { SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';

// Toggle to enforce ADMIN_ROLE_NAME checking
export const requireAdminRole = false;

// Command definition
export function createData(requiredMemberPermissions = null) {
    return new SlashCommandBuilder()
        .setName('fetch-ip')
        .setDescription('Fetches the public IP of the server')
        .setDefaultMemberPermissions(requiredMemberPermissions);
}

// Function executed by listener
export async function execute(interaction) {
    // Use ipify.org to get the machine's public IP
    const res = await fetch('https://api.ipify.org/');
    const body = await res.text();

    console.log(`IP requested by ${interaction.user.tag}`);

    // Reply to slash command
    await interaction.reply(`The IP of the Minecraft server is ${body}`);
}