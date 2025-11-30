import { Events } from 'discord.js';

import { handleCommandError } from './handle-command-error.js';

export function registerExecuteCommands(client) {
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
}