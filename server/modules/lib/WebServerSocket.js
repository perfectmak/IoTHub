var WebSocket = require('./WebSocket');

/**
* A class used to encabsulate a ServerSocket
*@param webSocketServer : normal webserver socket from the ws package
*/
var WebServerSocket = function(webSocketServer) {
	this._webServerSocket = webSocketServer;
};

WebServerSocket.create = function(webSocketServer) {
	return new WebServerSocket(webSocketServer);
};

var methods = {
	
	/**
	* Method signature to hooked to tags
	* - onNewConnection: function (webSocket) {} //to be overriden in the implementing class
	*/
	hook: function(tag, callback) {
		switch(tag) {
			case "onNewConnection":
				this._webServerSocket.on("connection", function(ws) {
					callback(new WebSocket(ws));
				});
				break;
		}
	}
};

WebServerSocket.prototype = methods;

module.exports = WebServerSocket;