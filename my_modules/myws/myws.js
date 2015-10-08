var server = require('http').createServer();
var wss = require('ws').Server;
var webSocketServer = new wss({server: server});

var express = require("express");
var myWsRouter = express.Router();

/* GET ws connect. */
webSocketServer.on("connection", function(ws){
	console.log("connected");
	// console.log(ws);
	ws.on("message", function(message){
		console.log("received");
		console.log(message);
	});

	ws.send("Welcome human. Identify yourself");
});

myWsRouter.start = function() {
	server.on('request', express);
	server.listen(3500, function () { console.log('Listening on ' + server.address().port) });
}

module.exports = myWsRouter;