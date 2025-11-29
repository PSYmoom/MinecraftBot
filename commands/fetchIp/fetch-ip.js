import { SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';

// Command definition
export const data = new SlashCommandBuilder()
    .setName('fetch-ip')
    .setDescription('Fetches the public IP of the server');

export async function execute(interaction) {
    // Use ipify.org to get the machine's public IP
    const res = await fetch('https://api.ipify.org/');
    const body = await res.text();

    console.log(`IP requested by ${interaction.user.tag}`);

    // Reply to slash command
    await interaction.reply(`The IP of the Minecraft server is ${body}`);
}