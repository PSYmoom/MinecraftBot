# MinecraftBot for Discord Servers
A Discord bot developed using [Discord.js](https://discord.js.org/#/) to seamlessly manage one or more Minecraft servers remotely from Discord. Runs on Windows, Linux, and macOS. Server members can request the host's IP and server population. Admin privileges can be set up using Discord roles.

## Usage
* `/start-server <server>` : Remotely start a Minecraft server.
* `/stop-server <server>` : Remotely stop a Minecraft server.
* `/execute <server> <command>` : Remotely send a command to a server (admin privileges required).
* `/players <server>` : Check who is playing currently on a server.
* `/fetch-ip` : Request the public IP of the host.
* `/list-servers` : Show all configured servers with their type, port, and state.
* `/reload-servers` : Re-scan `MC_SERVERS_ROOT` for new/removed folders (admin privileges required).

The `<server>` argument is auto-completed in Discord.

## Server layout
Point `MC_SERVERS_ROOT` at a parent folder containing one subfolder per Minecraft server. The bot names each server after its folder and inspects the contents to figure out the rest.

```
MC_SERVERS_ROOT/
  vanilla_world/
    server_start.bat   (or server_start.sh on Linux/macOS)
    server.properties
    server.jar
  modded_world/
    server_start.bat
    server.properties
    forge-1.20.1-47.4.0.jar
    mods/
```

* **Type**: `modded` if the folder contains a `forge-*.jar`, `fabric-server-launch.jar`, or a non-empty `mods/`; otherwise `vanilla`. Modded servers use looser boot-output checks (Forge emits non-fatal errors during startup).
* **Port**: read from `server-port=` in `server.properties` (default `25565`). Duplicate ports across folders log a warning at startup.
* **Skip**: folders missing the platform's start script are ignored.

Add a server by creating a folder and calling `/reload-servers`.

## Prerequisites
1. [Install Node.js and discord.js](https://discordjs.guide/preparations/)

1. [Set up a Discord bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

1. [Add the bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)

## Installation guide
1. Clone this repository.

1. For each Minecraft server you want the bot to manage, create a subfolder under your `MC_SERVERS_ROOT` and copy the appropriate start script into it:
    1. On Windows, copy `server_start.bat`.
    1. On Linux/macOS, copy `server_start.sh` and run `chmod +x server_start.sh`.
    1. (Optional) Change the [minimum and maximum RAM allocated](https://minecraft.gamepedia.com/Tutorials/Setting_up_a_server#Java_options) in the script to a value of your choice.
    1. Make sure each server's `server.properties` has a unique `server-port=` so they don't collide.

1. Change `ADMIN_ROLE_NAME` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L1) to match the role of admins in your server.

1. Change `DISCORD_TOKEN` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L2) to match your Discord Bot's secret token.

1. Change `DISCORD_CLIENT_ID` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L3) to match your Discord Bot's client ID.

1. Change `DISCORD_GUILD_ID` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L4) to match your Discord server's guild ID.

1. Change `MC_SERVERS_ROOT` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L12) to the absolute path of the parent folder containing your Minecraft server subdirectories.

1. Rename `.env_sample` to `.env`.

1. Setup is complete. Use `npm install` and `npm run start` from the Discord Bot's location to start the bot.

1. (Optional) Set up the bot to automatically start when your host machine boots:

    **Windows:**
    1. Open Run and enter `shell:startup`.
    1. Move [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBotStartUp.bat) to the folder that opens up.
    1. Change the location in [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBotStartUp.bat) to match the location of your Discord Bot.

    **Linux:**
    1. Recommended: create a `systemd` user/service unit that runs `npm run start` from the bot directory.
    1. Alternative: launch the bot inside a `tmux` or `screen` session so it survives logging out of SSH.
