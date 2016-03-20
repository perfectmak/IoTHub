var server = require('http').createServer();
var wss = require('ws').Server;
var express = require("express");
var ItemsManager = require('./lib/ItemsManager');
var WebServerSocket = require('./lib/WebServerSocket');





var webSocketServer = new wss({server: server});
var Manager = new ItemsManager(new WebServerSocket(webSocketServer));
Manager.start();

var myWsRouter = express.Router();
myWsRouter.start = function() {
	server.on('request', express);
	server.listen(3500, function () { console.log('Listening on ' + server.address().port) });
}

module.exports = myWsRouter;