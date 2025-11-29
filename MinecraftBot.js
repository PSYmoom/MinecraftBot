import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { handleCommandError } from './utility/handle-command-error.js';
import { initMinecraftServer } from './utility/minecraft-server.js';

// Leverage the CommonJS require function to load JSON files
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import env variables
dotenv.config();

// Set up Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});
client.commands = new Collection();

// Dynamically load slash commands from the commands directory
const slash_commands = [];
const foldersPath = join(process.cwd(), 'commands');
const commandFolders = readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
            slash_commands.push(command.data.toJSON());
            // Save the commnads in client object locally for parity
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module and deploy the slash commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log(`Started refreshing ${slash_commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: slash_commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

// Handles execution of dynamically created slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        handleCommandError(error, interaction);
    }
});

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Initialize minecraftServer instance once bot is ready
    initMinecraftServer(client);
});


client.login(process.env.DISCORD_TOKEN);
