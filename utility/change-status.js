export const ServerState = Object.freeze({
    RUNNING: "Server is ONLINE! 🟢",
    STARTING: "Server is STARTING 🟡",
    STOPPING: "Server is SHUTTING DOWN 🟡",
    STOPPED: "Server is OFFLINE 🔴"
});

/**
 * Updates the bot's presence based on the aggregate state of every server in the registry.
 * @param user - The Discord Bot's user instance.
 * @param servers - Array of MinecraftServer instances.
 */
export async function setAggregatePresence(user, servers) {
    if (!user) return;

    const total = servers.length;

    if (total === 0) {
        await user.setPresence({ activities: [{ name: '🔴 No servers configured', type: 0 }] });
        return;
    }

    const running = servers.filter(s => s.isRunning()).length;
    const transitioning = servers.some(s => s.isBusy());

    let name;
    if (transitioning) {
        name = `🟡 ${running}/${total} running (transitioning)`;
    } else if (running > 0) {
        name = `🟢 ${running}/${total} server${total > 1 ? 's' : ''} running`;
    } else {
        name = `🔴 All servers offline (0/${total})`;
    }

    await user.setPresence({ activities: [{ name, type: 0 }] });
}
