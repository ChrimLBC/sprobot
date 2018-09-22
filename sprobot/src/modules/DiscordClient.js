const DiscordAPI = require('./API.js');
const Discord = require("discord.js");
const WebSocket = require("ws");


class DiscordClient {
    
    constructor (io) {
        this.client = new Discord.Client({ autoReconnect: true });
        this.API = new DiscordAPI(this.client);
        this.status = false;
        this.socket = io;
    }

    connect(token) {
        console.log(token);
        
        return this.client.login(token)
            .then((r) => {
                this.setEvents();
                this.setupIntervals();
                this.status = true;
                this.sendBroadcast({
                    type: "UPDATE_SPROBOT",
                    status: this.client.status,
                    uptime: this.client.uptime
                }, this.socket);
                return {status: "success"};
            }).catch((error) => {
                console.error(error);
                return {status: "error", error};
            });
    }

    parseMins (arr) {
        var mins = 0;
        
        if (arr.length > 1) {
            mins = parseInt(arr[1]);
        }

        if (!isNaN(mins)) {
            if (mins <= 0) {
                mins = 60;
            }
        }
        return mins;
    }

    setEvents() {
        this.client.on("message", (message) => {

            if (message.content.startsWith("!verify")) {
                
                this.API.getRunsToVerify();
            }
        
            if (message.content.startsWith("!lb")) {
                var arr = message.content.toString().split(" ");
                var mins = this.parseMins(arr);
                this.API.getRecentRuns(mins);
            }
        
            if (message.content.startsWith("!dc")) {
                this.client.destroy((err) => {
                    console.log(err);
                });
                this.status = false;
                clearInterval(this.recentRunsInterval);
                clearInterval(this.runsToVerifyInterval);
            }
        
        
        });

        this.client.on('guildMemberAdd', member => {
            // Send the message to the guilds default channel (usually #general), mentioning the member
            //member.guild.get("name", "office").send("Welcome to the server, ${member}!");
        
            // If you want to send the message to a designated channel on a server instead
            // you can do the following:
            const channel = member.guild.channels.find(c => c.name === 'office');
            // Do nothing if the channel wasn't found on this server
            if (!channel) return;
            // Send the message, mentioning the member
            channel.send(`${member.user.username} joined the server.`);
        });

        this.client.on("guildMemberRemove", (member) => {
            const channel = member.guild.channels.find(c => c.name === 'office');
            // Do nothing if the channel wasn't found on this server
            if (!channel) return;
            // Send the message, mentioning the member
            channel.send(`${member.user.username} left the server.`);
        });

        this.client.on("reconnecting", () => {
            console.log("Reconnecting to discord");
            this.sendBroadcast({
                type: "UPDATE_SPROBOT",
                status: this.client.status,
                uptime: this.client.uptime
            }, this.socket);

        });

        this.client.on("resume", (replayed) => {
            console.log(`Reconnect and replayed ${replayed} events`);
            this.sendBroadcast({
                type: "UPDATE_SPROBOT",
                status: this.client.status,
                uptime: this.client.uptime
            }, this.socket);
        });
    }

    disconnect(token) {
        return token === process.env.REACT_APP_DISCORD_TOKEN ? this.client.destroy()
            .then(() => {
                clearInterval(this.recentRunsInterval);
                clearInterval(this.runsToVerifyInterval);
                this.status = false;
                this.sendBroadcast({
                    type: "UPDATE_SPROBOT",
                    status: this.client.status,
                    uptime: this.client.uptime
                }, this.socket);
                return {status: "success"};
            }).catch((error) => {
                return {status: true, error}
            }) : {status: true, error: "Invalid token"}
        
    }


    sendBroadcast(data, ws) {
        ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client != ws) {
                client.send(JSON.stringify(data));
            }
        });
    };


    setupIntervals() {
        //get the most recent runs every 10 minutes
        this.recentRunsInterval = setInterval(() =>  {
            
            //console.log("ran getRecentRuns again at " + (new Date()).toISOString());
            
            this.API.getRecentRuns(60);
        }, 600000);

        //get the most recent runs every 10 minutes
        this.runsToVerifyInterval = setInterval(() =>  {
            //console.log("ran getVerifyRuns at " + (new Date()).toISOString());
            this.API.getRunsToVerify();
        }, 600000);
    }
    

}

module.exports = DiscordClient