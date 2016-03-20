/**
*
*@param webServerSocket : normal websocket from the ws package
*/
var WebSocket = function(webSocket){
	this._webSocket = webSocket;
	this._sentMessagesCount = 0;
	this._receivedMessagesCount = 0;
};

WebSocket.create = function(webSocket){
	return new WebSocket(webSocket);
}

var methods = {
	/**
	* Method signatures to be hooked to tags
		onMessage: function(message){}
		onClose: function(){}
	*/
	hook: function(tag, callback) {
		var self = this;
		switch(tag){
			case "onMessage":
				this._webSocket.on("message", function(message){
					self._receivedMessagesCount++;
					callback(message);
				});
				break;

			case "onClose":
				this._webSocket.on("close", function(code, message){
					callback();
				});
				break;
		}
	},

	send: function(message) {
		this._webSocket.send(message);
		this._sentMessagesCount++;
	},

	getReceivedMessagesCount: function(){
		return this._receivedMessagesCount;
	},

	getSentMessagesCount: function(){
		return this._sentMessagesCount;
	}
};

WebSocket.prototype = methods;

module.exports = WebSocket;