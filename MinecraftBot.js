import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

import { initServerRegistry } from './utility/server-registry.js';
import { reloadCommands } from './utility/reload-commands.js';
import { registerAutocomplete } from './utility/register-autocomplete.js';

// Import env variables
dotenv.config();

// Set up Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});
client.commands = new Collection();

client.once(Events.ClientReady, async (readyClient) => {
    await reloadCommands(client);
    initServerRegistry(client);
    registerAutocomplete(client);

    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Register event listener to detect role changes
// This is because commands needs to be updated with new role permissions
client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
    if (newRole.name === process.env.ADMIN_ROLE_NAME && oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        console.log('Role changes detected in ADMIN_ROLE_NAME. Command permissions are being updated as a result...')
        await reloadCommands(client);
    }
});

client.login(process.env.DISCORD_TOKEN);
