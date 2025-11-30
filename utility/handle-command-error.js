import { MessageFlags } from 'discord.js';

/**
 * Handles errors during command execution.
 * Logs the error and replies/followUps to the interaction.
 *
 * @param {Error} error - The error object
 * @param {import('discord.js').Interaction} interaction - The interaction that failed
 */
export async function handleCommandError(error, interaction) {
    console.error(error);

    const response = {
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
    }

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
    } else {
        await interaction.reply(response);
    }
}