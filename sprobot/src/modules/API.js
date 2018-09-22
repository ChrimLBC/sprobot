const SpeedrunAPI = require('speedrunapi');
const sr = new SpeedrunAPI();

const games = [
	"Spyro the Dragon",
	"Spyro 2: Ripto's Rage",
	"spyro 2: season of flame",
	"spyro orange: the cortex conspiracy",
	"spyro: a hero's tail",
	"spyro: attack of the rhynocs",
	"spyro: enter the dragonfly",
	"spyro: season of ice",
	"spyro: shadow legacy",
	"spyro: year of the dragon",
	"the legend of spyro: a new beginning",
	"the legend of spyro: dawn of the dragon",
	"the legend of spyro: the eternal night"
];

var gameIds = {};



class API {
    constructor(discord) {
        this.client = discord;
        for (var i = 0; i < games.length; i++) {
            sr.games()
                .param({ name: games[i] })
                .exec()
                .then(response2 => {
                    gameIds[response2.items[0].id] = response2.items[0].names.international;
                });
        }
    }
    
    getRunsToVerify()  {
        var channel = this.client.channels.find(c => c.name === "new-submissions");
        var done = [];
        
        channel.fetchMessages({ limit: 100 })
                        .then(messages => {
                            messages.forEach(message => {
                                done.push(message.content.split("/").pop());
                            });
                        });
        var current = [];
        var promises = Object.keys(gameIds).map((gameId, index) => {
            return new Promise((resolve, reject) => {
                sr.runs()
                    .embed(['game'])
                    .embed(['category'])
                    .param({ game: gameId })
                    .param({ status: "new" })
                    .exec()
                    .then(response => {
                        var game = gameIds[gameId];
                        response.items.forEach((el) => {
    
                            var runId = el.id;
                            var catName = el.category.data.name;
    
                            if (!(done.includes(runId))) {
                                //console.log(client.channels);
                                channel.send(`A new submission is awaiting verification in ${game} ${catName} : ${el.weblink}`);
                            }
                            current.push(runId);
                            
                            //console.log(`did it: ${runId}`);
                    
                        });
                        resolve();
                    }).catch((error) => {
                        console.log("Promise Rejected - probably invalid verify date.");
                        return reject();
                    });
            });
    
        });
        Promise.all(promises).then(() => {
    
            for (var i = 0; i < done.length - 1; i++) {
                var curDone = done[i];
    
                //console.log(`${done[i]} : ${done[i]} ${current.includes(done[i])}`);
                
                if (!(current.includes(done[i]))) {
                    var channel = this.client.channels.find(c => c.name === 'announcements');
                    
                    //console.log(channel);
                    
                    channel.fetchMessages({ limit: 100 })
                        .then(messages => {
                            messages.forEach((msg) => {
                                
                                //console.log(`${curDone} ${msg.content} ${msg.content.indexOf(curDone)});
                                
                                if (msg.content.indexOf(curDone) > -1) {
                                    //console.log("deleting");
                                    done.splice(i, 1);
                                    msg.delete();
                                }
                            });
                        }).catch((error) => console.error());
                }
            }
        });
    }

    getRecentVerifyDate(channel) {
        return channel.fetchMessages({limit: 100})
        .then(messages => {
            let sprobotMessages = messages.filter(g => g.author.username === "Sprobot").sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
            let recentRunId = sprobotMessages.first().content.split("/").pop();
            return sr.runs(recentRunId).exec()
                        .then(response => {
                            console.log("test: " + response.items.status['verify-date']);
                            var parsed = JSON.parse(JSON.stringify(response.items.status));
                            console.log(parsed['verify-date']);
                            const recentVerifyDate = new Date(parsed['verify-date']);
                            console.log(recentVerifyDate);
                            return recentVerifyDate;
                        }).catch((error) => {console.error("getRecentVerifyDate sr.runs failed", error)});
        }).catch((error) => {console.error("getRecentVerifyDate channel.fetchMessages failed", error)});
    }

    getPlaceInfo(userId, runId, el) {
        return sr.users(userId)
            .personalBests()
            .exec()
            .then(response3 => {
                var place;
                response3.items.forEach((run) => {
                    if (run.run.id === runId) {
                        place = run.place;
                    }
                });

                var seconds = el.times["primary_t"];
                var date2 = new Date(null);
                date2.setSeconds(seconds); // specify value for SECONDS here
                var result = date2.toISOString().substr(11, 8);

                var suffix = "";
                var sPlace = place.toString();
                var first = true;
                
                if (sPlace.length > 1) {
                    var s = place.toString().slice(-2);
                    if (s === "11" || s === "12" || s === "13") {
                        first = false;
                    }
                }
                
                if ((place % 10) === 1 && first) {
                    suffix = "st";
                }
                else if ((place % 10) === 2 && first) {
                    suffix = "nd";
                }
                else if ((place % 10) === 3 && first) {
                    suffix = "rd";
                }
                else {
                    suffix = "th";
                }

                return {
                    place,
                    suffix,
                    result
                }

            }).catch((error) => {
                console.error("response3 in getRecentRuns",error);
            });
    }
    
    getRecentRuns(minutes)  {
        var channel = this.client.channels.find(c => c.name === 'announcements');
        this.getRecentVerifyDate(channel)
            .then(recentVerifyDate => {
                console.log(`recentVerifyDate: ${recentVerifyDate}`);
                Object.keys(gameIds).forEach((gameId, index) => {
                    sr.runs()
                        .embed(['game'])
                        //.embed(['players'])
                        .embed(['category'])
                        .param({ game: gameId })
                        .param({ orderby: "verify-date" })
                        .param({ direction: "desc" })
                        .exec()
                        .then(response => {
                            var game = gameIds[gameId];
                            response.items.some((el) => {
                                var status = JSON.parse(JSON.stringify(el.status));
                                var verifyDate = new Date(status['verify-date']);
                                var user;
                                if (verifyDate.getTime() > recentVerifyDate.getTime()) {
                                    var catName = el.category.data.name;
                                    var runId = el.id;
                                    var userId = el.players[0].id;
                                    sr.users(userId)
                                        .exec()
                                        .then(response2 => {
                                            user = response2.items.names.international;
                                            this.getPlaceInfo(userId, runId, el)
                                                .then(placeInfo => {
                                                    if (placeInfo.place != null) {
                                                                        channel.send(user + " just got " + placeInfo.place + placeInfo.suffix + " in " + game + " " + catName + " with a " + placeInfo.result + "! " + el.weblink);
                                                                        console.log(user + " just got " + placeInfo.place + placeInfo.suffix + " in " + game + " " + catName + " with a " + placeInfo.result + "! " + el.weblink);
                    
                                                                    }
                                                }).catch((error) => {
                                                    console.error("placeInfo in getRecentRuns",error);
                                                });
                                        }).catch((error) => {
                                            console.error("response2 in getRecentRuns",error);
                                        });
                                    return false;
                                }
                                else {return true;}
                            });
                        }).catch((error) =>  {
                            console.error(error);
                        });
                }, gameIds);
            }).catch((error) => {console.error("getRecentVerifyDate inside getRecentRuns failed", error)});
    }
}

module.exports = API

