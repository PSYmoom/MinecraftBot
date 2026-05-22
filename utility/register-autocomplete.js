import { Events } from 'discord.js';

import { serverNames } from './server-registry.js';

/**
 * Wires the autocomplete handler for the `server` option used across multiple
 * slash commands. Discord caps autocomplete responses at 25 choices.
 */
export function registerAutocomplete(client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isAutocomplete()) return;
        if (interaction.options.getFocused(true).name !== 'server') return;

        const focused = interaction.options.getFocused().toLowerCase();
        const choices = serverNames()
            .filter(n => n.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(name => ({ name, value: name }));

        try {
            await interaction.respond(choices);
        } catch (err) {
            console.error('[autocomplete] respond failed:', err);
        }
    });
}
