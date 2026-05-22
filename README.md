# MinecraftBot for Discord Servers
A Discord bot developed using [Discord.js](https://discord.js.org/#/) to seamlessly interact with a Minecraft server remotely using Discord servers. Runs on Windows, Linux, and macOS. Server members can request the host's IP and server population. Admin privileges can be set up using Discord roles.

## Usage
* `/start-server` : Remotely start the Minecraft server.
* `/server-stop` : Remotely stop the Minecraft server.
* `/fetch-ip` : Request the public IP of the host of Minecraft server.
* `/execute <command>` : Remotely send a command to the server (Admin privileges required).
* `/players` : Check who are playing currently on the Minecraft server.

## Prerequisites
1. [Install Node.js and discord.js](https://discordjs.guide/preparations/)

1. [Set up a Discord bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

1. [Add the bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)

## Installation guide
1. Clone this repository.

1. Move the start script to the folder containing the Minecraft server:
    1. On Windows, copy `server_start.bat`.
    1. On Linux/macOS, copy `server_start.sh` and run `chmod +x server_start.sh` so it can execute.
    1. (Optional) Change the [minimum and maximum RAM allocated](https://minecraft.gamepedia.com/Tutorials/Setting_up_a_server#Java_options) in the script to a value of your choice.
    1. (Note) You can reuse your own start script. Please remove any pause commands if this is the case. If you renamed the script, set `MC_SERVER_SCRIPT_NAME` in `.env` to match.

1. Change `ADMIN_ROLE_NAME` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L1) to match the role of admins in your server.

1. Change `DISCORD_TOKEN` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L2) to match your Discord Bot's secret token.

1. Change `DISCORD_CLIENT_ID` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L3) to match your Discord Bot's client ID.

1. Change `DISCORD_GUILD_ID` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L4) to match your Discord server's guild ID.

1. Change `MC_SERVER_SCRIPT_LOCATION` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample#L5) to match the directory of your start script.

1. (Optional) Set `MC_SERVER_SCRIPT_NAME` in [.env_sample](https://github.com/PSYmoom/MinecraftBot/blob/master/.env_sample) only if you renamed your start script. The bot defaults to `server_start.bat` on Windows and `./server_start.sh` on Linux/macOS.

1. Rename `.env_sample` file to `.env`.

1. The set up is complete! Use `npm install` and `npm run start` from the Discord Bot's location to start the bot.

1. (Optional) Alternatively, you can set up the bot to automatically start when your host machine is booted up.

    **Windows:**
    1. Open Run and enter `shell:startup`.
    1. Move [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBotStartUp.bat) to the folder that opens up.
    1. Change the location in [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBotStartUp.bat) to match the location of your Discord Bot.

    **Linux:**
    1. Recommended: create a `systemd` user/service unit that runs `npm run start` from the bot directory.
    1. Alternative: launch the bot inside a `tmux` or `screen` session so it survives logging out of SSH.
