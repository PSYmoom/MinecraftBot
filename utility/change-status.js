export const ServerState = Object.freeze({
    RUNNING: "Server is ONLINE! 🟢",
    STARTING: "Server is STARTING 🟡",
    STOPPING: "Server is SHUTTING DOWN 🟡",
    STOPPED: "Server is OFFLINE 🔴"
})

/**
 * Updates the bot's presence.
 * @param user - The Discord Bot's user instance
 * @param status - An element from ServerState
 */
export async function setPresence(user, status) {
  await user.setPresence({
    activities: [{name: status, type: 0}],
  });
}
 