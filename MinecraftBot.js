const {Client, MessageEmbed} = require('discord.js');
const spawn = require('child_process').spawn;
const fetch = require('node-fetch');
const commands = require('./help.json');

const client = new Client();
const bot_secret_token = "YOUR_BOT_SECRET_TOCKEN";
const MC_SERVER_START_SCRIPT = "LOCATION OF BAT FILE; Note: The .bat file has to cd to the server's location for the bot to work";
const admin = "NAME OF THE ROLE OF ADMINS IN DISCORD; USED FOR MINECRAFT SERVER COMMANDS";
var mcserver = null;

//Flag to provide mutual exclusionfor the server thread
var inProcess = false;
//Flag used to allow server to send message to discord channel (Prevents sending unnecessary messages)
var sendServerMsg = false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!mcstart') {
      startSequence(msg);
      return;
  }

  if (msg.content === '!mcstop') {
      stopSequence(msg);
      return;
  }

  if (msg.content === '!mcip') {
      ipSequence(msg);
      return;
  }

  if (msg.content.split(" ")[0] === "!mccommand") {
      commandSequence(msg, null);
      return;
  }

  if (msg.content === "!mchelp") {
      helpSequence(msg);
      return;
  }

  if (msg.content === "!mcstatus") {
      statusSequence(msg);
      return;
  }

  if (msg.content === "!mconline") {
      onlineSequence(msg);
      return;
  }
});

//Command: !mcstart
function startSequence(msg) {
    if (inProcess) {
        //Check if the server is currently running an operation or not
        msg.channel.send("Please wait for the process to finish executing");
    } else if (mcserver != null) {
        //Check if the server is on or not
        msg.channel.send("Server is already on!");
    } else {
        //Create a child process and wait until it finishes initializing
        inProcess = true;
        msg.channel.send("Starting server...");
        mcserver = spawn(MC_SERVER_START_SCRIPT);

        let promise = new Promise((resolve, reject) => {

          mcserver.stdout.on('data', (data) => {
            data = data.slice(0, data.length - 2);
            console.log("stdout: " + data);

            if (sendServerMsg) {
                let temp = data.toString().split(" ");
                msg.channel.send(temp.splice(3, temp.length).join(" "));
            }

            if (data.slice(data.length - 6, data.length) == "\"help\"")
                resolve("Server open!");
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
    }
}

//Command: !mcstop
function stopSequence(msg) {
    if (inProcess) {
        //Check if the server is currently running an operation or not
        msg.channel.send("Please wait for the process to finish executing");
    } else if (mcserver == null) {
        //Check if the server is off or not
        msg.channel.send("Server is not on!");
    } else {
        //Send the stop signal to the child process
        inProcess = true;
        msg.channel.send("Stopping server...");
        mcserver.stdin.write('stop\n');

        mcserver.on('exit', (code) => {
            console.log("Minecraft Server exited with code " + code);
            msg.channel.send("Minecraft Server exited with code " + code);
            mcserver = null;
            inProcess = false;
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
function commandSequence(msg, msgContent) {
    let tempCommandArray = msg.content.split(" ");
    let tempCommand = "";

    if (mcserver === null) {
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
    sendServerMsg = true;
    mcserver.stdin.write(tempCommand);

    setTimeout( () => {sendServerMsg = false} , 500);
}

//Command: !mchelp
function helpSequence(msg) {
    //Sends help msg as an embeded msg
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

//Command: !mcstatus
function statusSequence(msg) {
    if (mcserver === null) {
        msg.channel.send("Server Status: Online");
        return;
    }

    msg.channel.send("Server Status: Online");
}

//Command: !mconline
function onlineSequence(msg) {
    commandSequence(msg, "list\n");
}

client.login(bot_secret_token);
