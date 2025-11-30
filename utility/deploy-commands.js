import { REST, Routes } from 'discord.js';

/**
 * Deploys slash commands to a specific guild.
 * @param {Array} slashCommands - Array of command JSON objects.
 * @param {string} clientId - Discord application client ID.
 * @param {string} guildId - Discord guild ID.
 * @param {string} token - Discord bot token.

 */
export async function deployCommands(slashCommands) {
    // Construct and prepare an instance of the REST module and deploy the slash commands
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: slashCommands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
}