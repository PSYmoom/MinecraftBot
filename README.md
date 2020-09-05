# MinecraftBot for Discord Servers
A Discord bot developed using [Discord.js](https://discord.js.org/#/) to help seamlessly open and close a Minecraft server remotely using Discord servers. Server members can request for the host's IP and server population. Admin privileges can be set up using Discord roles.

## Usage
* `!mcstart` : Remotely start the Minecraft server.
* `!mcstop` : Remotely stop the Minecraft server.
* `!mcip` : Request the public IP of the host of Minecraft server.
* `!mccommand <command>` : Remotely send a command to the server.
* `!mcstatus` : Check the status of the Minecraft server.
* `!mconline` : Check who are playing currently on the Minecraft server.
* `!mchelp` : Display all possible commands.

## Installation guide
1. [Install Node.js and discord.js](https://discordjs.guide/preparations/)

1. [Set up a Discord bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

1. [Add the bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)

1. Download all of the files in this repository and extract them in the Discord Bot folder.

1. Move `server_start.bat` to the folder containing the Minecraft server.

1. Change `bot_secret_token` in [MinecraftBot.js](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBot.js#L7) to match your Discord Bot's secret token.

1. Change `MC_SERVER_START_SCRIPT` in [MinecraftBot.js](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBot.js#L8) to match the location of your Minecraft server.

1. Change `admin` in [MinecraftBot.js](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBot.js#L8) to match the role of admins in your server.

1. Change the location in [server_start.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/server_start.bat#L2) to match the location of your Minecraft server.

1. (Optional) Change the [minimum and maximum RAM allocated](https://minecraft.gamepedia.com/Tutorials/Setting_up_a_server#Java_options) in [server_start.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/server_start.bat#L3) to a value of your choice.

1. The set up is complete! Use `node MinecraftBot.js` from the Discord Bot's location to start the bot.

1. (Optional) Alternatively, you can set up the server to turn on during startup.
    1. Open Run and enter `shell:startup`.
  
    1. Move [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/MinecraftBotStartUp.bat) to the folder that opens up.
  
    1. Change the location in [MinecraftBotStartUp.bat](https://github.com/PSYmoom/MinecraftBot/blob/master/server_start.bat#L2) to match the location of your Discord Bot. 
