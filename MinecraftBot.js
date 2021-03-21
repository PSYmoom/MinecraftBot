const {Client, MessageEmbed} = require('discord.js');
const spawn = require('child_process').spawn;
const fetch = require('node-fetch');
const commands = require('./help.json');

const client = new Client();
const bot_secret_token = "YOUR_BOT_SECRET_TOCKEN";
const MC_SERVER_START_SCRIPT = ["LOCATION OF MINECRAFT BAT FILE", "LOCATION OF MODDEDMINECRAFT BAT FILE"]; //Note: The .bat file has to cd to the server's location for the bot to work";
const admin = "NAME OF THE ROLE OF ADMINS IN DISCORD; USED FOR MINECRAFT SERVER COMMANDS";
const helpTitle = ["Vanilla Help (Port 25565)", "Modded Help (Port 25566)"];
var mcserver = [null, null];

//Flag to provide mutual exclusionfor the server thread
var inProcess = [false, false];
//Flag used to allow server to send message to discord channel (Prevents sending unnecessary messages)
var sendServerMsg = [false, false];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!mcstart') {
      startSequence(msg, 0);
      return;
  }

  if (msg.content === '!moddedmcstart') {
      startSequence(msg, 1);
      return;
  }

  if (msg.content === '!mcstop') {
      stopSequence(msg, 0);
      return;
  }

  if (msg.content === '!moddedmcstop') {
      stopSequence(msg, 1);
      return;
  }

  if (msg.content === '!mcip') {
      ipSequence(msg);
      return;
  }

  if (msg.content.split(" ")[0] === "!mccommand") {
      commandSequence(msg, null, 0);
      return;
  }

  if (msg.content.split(" ")[0] === "!moddedmccommand") {
      commandSequence(msg, null, 1);
      return;
  }

  if (msg.content === "!mchelp") {
      helpSequence(msg, 0);
      return;
  }

  if (msg.content === "!moddedmchelp") {
      helpSequence(msg, 1);
      return;
  }

  if (msg.content === "!mcstatus") {
      statusSequence(msg, 0);
      return;
  }

  if (msg.content === "!moddedmcstatus") {
      statusSequence(msg, 1);
      return;
  }

  if (msg.content === "!mconline") {
      onlineSequence(msg, 0);
      return;
  }

  if (msg.content === "!moddedmconline") {
      onlineSequence(msg, 1);
      return;
  }
});

//Command: !mcstart & !moddedmcstart
function startSequence(msg) {
  if (inProcess[server]) {
      //Check if the server is currently running an operation or not
      msg.channel.send("Please wait for the process to finish executing");
  } else if (mcserver[server] != null) {
      //Check if the server is on or not
      msg.channel.send("Server is already on!");
  } else {
      //Create a child process and wait until it finishes initializing
      inProcess[server] = true;
      msg.channel.send("Starting server...");
      mcserver[server] = spawn(MC_SERVER_START_SCRIPT[server]);

      let promise = new Promise((resolve, reject) => {

        mcserver[server].stdout.on('data', (data) => {
          data = data.slice(0, data.length - 2);
          console.log("stdout: " + data);

          if (sendServerMsg[server]) {
              let temp = data.toString().split(" ");
              msg.channel.send(temp.splice(3, temp.length).join(" "));
          }

          console.log(data.slice(data.length - 21, data.length).toString());

          if (data.slice(data.length - 6, data.length) == "\"help\"" && server == 0 || data.slice(data.length - 21, data.length) == "Unloading dimension 1" && server == 1)
              resolve("Server open!");
        });

        mcserver[server].stderr.on('data', (data) => {
            reject("stderr: " + data);
        });

      });

      promise.then((message) => {
          console.log(message);
          msg.channel.send(message);
      }).catch((error) => {
          mcserver[server] = null;
          console.log(error);
          msg.channel.send(error);
      }).finally(() => {
          inProcess[server] = false;
      });
  }
}

//Command: !mcstop & !moddedmcstop
function stopSequence(msg, server) {
    if (inProcess[server]) {
        //Check if the server is currently running an operation or not
        msg.channel.send("Please wait for the process to finish executing");
    } else if (mcserver[server] == null) {
        //Check if the server is off or not
        msg.channel.send("Server is not on!");
    } else {
        //Send the stop signal to the child process
        inProcess[server] = true;
        msg.channel.send("Stopping server...");
        mcserver[server].stdin.write('stop\n');

        mcserver[server].on('exit', (code) => {
            console.log("Minecraft Server exited with code " + code);
            msg.channel.send("Minecraft Server exited with code " + code);
            mcserver[server] = null;
            inProcess[server] = false;
        });
    }
}

//Command: !mcip
function ipSequence(msg) {
    //use ipify.org to get the machine's public ip
    fetch("https://api.ipify.org/").then(res => res.text()).then((body) => {
        console.log("IP requested by " + msg.member.user.tag);
        msg.channel.send("The IP of the Minecraft server is " + body);
    });
}

//Command: !mccommand
//TODO?: Find a better way to print on discord server
//Currently a guessing game; Waits for 0.5s before stopping the server sending
//Tested on most commands and various senarios without running into issues
function commandSequence(msg, msgContent, server) {
    let tempCommandArray = msg.content.split(" ");
    let tempCommand = "";

    if (mcserver[server] === null) {
        //Check if the server is on or not
        msg.channel.send("Server is not on!");
        return;
    }

    if (msgContent === null) {
        if (msg.member.roles.cache.find(role => role.name === admin) === undefined){
            //Check if the member has permission to run the server commands or not
            msg.channel.send("You do not have permission to send admin commands");
            return;
        } else if (msgContent === null && tempCommandArray.length === 1){
            //Check if the format is vaild or not
            msg.channel.send("Invalid use of !mccommand. Usage: !mccommand <command>");
            return;
        } else {
            //Prep the command
            for (var i = 1; i < tempCommandArray.length; i++) {
              tempCommand += tempCommandArray[i] + " ";
            }

            tempCommand = tempCommand.trim() + "\n";
        }
    } else {
        //Command comes from !mclist; No prep required
        tempCommand = msgContent;
    }

    //Send the command to child process using write
    sendServerMsg[server] = true;
    mcserver[server].stdin.write(tempCommand);

    setTimeout( () => {sendServerMsg[server] = false} , 500);
}

//Command: !mchelp
function helpSequence(msg, server) {
    //Sends help msg as an embeded msg
    console.log("Help requested by " + msg.member.user.tag);
    let embededHelp = new MessageEmbed()
      .setColor("#FFFFFF")
      .setTitle(helpTitle[server]);
    let temp = commands[server];
    for (let command in temp) {
      if (temp.hasOwnProperty(command)) {
        embededHelp.addField(command, temp[command]);
      }
    }

    msg.channel.send(embededHelp);
}

//Command: !mcstatus & !moddedmcstatus
function statusSequence(msg, server) {
    if (mcserver[server] === null) {
        msg.channel.send("Server Status: Offline");
        return;
    }

    msg.channel.send("Server Status: Online");
}

//Command: !mconline & !moddedmconline
function onlineSequence(msg, server) {
    commandSequence(msg, "list\n", server);
}

client.login(bot_secret_token);
