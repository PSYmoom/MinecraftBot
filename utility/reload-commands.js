import { fetchRolePermissions } from './fetch-role-permissions.js';
import { loadCommands } from './load-commands.js';
import { deployCommands } from './deploy-commands.js';
import { registerExecuteCommands } from './register-execute-commands.js';

export async function reloadCommands(client) {
    const adminRoleBitfield = await fetchRolePermissions(client)
    // Dynamically loads all commands from the ./commands directory.
    const slashCommands = loadCommands(client, adminRoleBitfield);
    // Deploys slash commands to specific guild
    await deployCommands(slashCommands);
    // Handles execution of dynamically created slash commands
    registerExecuteCommands(client);
}