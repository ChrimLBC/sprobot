const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const http = require("http");
const app = express();
const WebSocket = require('ws');
const DiscordClient = require("./modules/DiscordClient");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.static(path.join(__dirname, 'build')));




app.listen(8080);

//const server = http.createServer();
const wss = new WebSocket.Server({ port: 8081 });



let dc = new DiscordClient(wss);
app.get('/api/client', (req, res) => {
  return res.send({
    uptime: dc.client.uptime, 
    status: dc.status, 
    clientStatus: dc.client.uptime != null ? dc.client.status : 5});
 });
let interval = null;
 wss.on("connection", (socket, req) => {
  console.log("User has connected");
  // if (interval) {
  //   clearInterval(interval);
  // }
  /*socket.on("message", msg => {
    socket.send({status: dc.status, uptime: dc.client.uptime, clientStatus: dc.client.uptime != null ? dc.client.status : 5});
  });*/
  //interval = setInterval(() => socket.send(dc), 10000);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  })
})

app.post('/api/connect', (req,res) => {
    return dc.connect(req.body.token).then(code => {
      return res.send({
        status: code.status === 'success' ? true : false,
        error: code.error,
        clientStatus: 0,
        uptime: 0
      });
    }).catch(error => {
      return res.send({
        status: false,
        error
      });
    });
    
})

app.post('/api/disconnect', (req, res) => {
  //res.sendFile(path.join(__dirname, 'build', 'index.html'));
  return dc.disconnect(req.body.token).then(code => {
    return res.send({
      status: code.status === 'success' ? false : true,
      error: code.error
    });
  }).catch(error => {
    return res.send({
      status: true,
      error
    });
  });
});