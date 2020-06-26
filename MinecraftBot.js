const {Client, MessageEmbed} = require('discord.js');
const spawn = require('child_process').spawn;
const fetch = require('node-fetch');
const commands = require('./help.json');

const client = new Client();
const bot_secret_token = "YOUR_BOT_SECRET_TOCKEN";
const MC_SERVER_START_SCRIPT = "LOCATION OF BAT FILE; Note: The .bat file has to cd to the server's location for the bot to work";
var mcserver;
var inProcess = false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!mcstart') {
    if (inProcess) {
      msg.channel.send("Please wait for the process to finish executing");
    } else if (mcserver == null) {
      inProcess = true;
      msg.channel.send("Starting server...");
      mcserver = spawn(MC_SERVER_START_SCRIPT);

      let promise = new Promise((resolve, reject) => {
        mcserver.stdout.on('data', (data) => {
          data = data.slice(0, data.length - 2);
          console.log("stdout: " + data);
          if (data.slice(data.length - 6, data.length) == "\"help\"") { //might close abruptly when someone types "help"
            resolve("Server open!");
          }
        });

        mcserver.stderr.on('data', (data) => {
          reject("stderr: " + data);
        });
      });

      promise.then((message) => {
        console.log(message);
        msg.channel.send(message);
      }).catch((error) => {
        mcserver = null;
        console.log(error);
        msg.channel.send(error);
      }).finally(() => {
        inProcess = false;
      });
    } else {
      msg.channel.send("Server is already on!");
    }
  } else if (msg.content === '!mcstop') {
    if (inProcess) {
      msg.channel.send("Please wait for the process to finish executing");
    } else if (mcserver != null) {
      inProcess = true;
      msg.channel.send("Stopping server...");
      mcserver.stdin.write('stop\n');

      mcserver.on('exit', (code) => {
        console.log("Minecraft Server exited with code " + code);
        msg.channel.send("Minecraft Server exited with code " + code);
        mcserver = null;
        inProcess = false;
      });
    } else {
      msg.channel.send("Server is not on!");
    }
  } else if (msg.content === '!mcip') {
    fetch("https://api.ipify.org/").then(res => res.text()).then((body) => {
      console.log("IP requested by " + msg.member.user.tag);
      msg.channel.send("The IP of the Minecraft server is " + body);
    });
  } else if (msg.content === "!mchelp") {
    console.log("Help requested by " + msg.member.user.tag);
    let embededHelp = new MessageEmbed()
      .setColor("#FFFFFF")
      .setTitle("MinecraftBot Help");

    for (let command in commands) {
      if (commands.hasOwnProperty(command)) {
        embededHelp.addField(command, commands[command]);
      }
    }

    msg.channel.send(embededHelp);
  }
});

client.login(bot_secret_token)
