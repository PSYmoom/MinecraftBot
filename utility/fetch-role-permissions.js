
/**
 * Finds a role object in a guild by its name.
 *
 * @param {import('discord.js').Client} client - The Discord client instance.
 * @returns {bigint | null} - The role's permission bitfield, or null if not found.
 */
export async function fetchRolePermissions(client) {
    // Fetch all roles from Discord server
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    await guild.roles.fetch();

    // Find permission from name
    const role = guild.roles.cache.find(r => r.name == process.env.ADMIN_ROLE_NAME);
    return role ? role.permissions.bitfield : null;
}
