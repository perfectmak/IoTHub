var RemoteCommand = require('./RemoteCommand');
var Log = require('./Log');

var ArduinoSocket = function(socket, arduino) {
	this._arduino = arduino;
	this._socket = socket;
	this._userSockets = [];

	var self = this;

	//hook to on Message
	this._socket.hook("onMessage", function(message){
		Log.d("UserSocket.ctor: "+message);
		var remoteCommand = RemoteCommand.fromString(message);
		self.dispatchCommand(remoteCommand);
	});
};

ArduinoSocket.create = function(socket, arduino) {
	return new ArduinoSocket(socket, arduino);
};

var methods = {
	getSocket: function(){
		return this._socket;
	},

	getArduino: function(){
		return this._arduino;
	},

	addUserSocket: function(userSocket) {
		this._userSockets.push(userSocket);
	},

	getUserSockets: function() {
		return this._userSockets;
	},

	dispatchCommand: function(remoteCommand) {
		for(var i in this._userSockets) {
			try {
				//try because socket might not be valid anymore
				//this design might be wrong, but it gets things done :D
				this._userSockets[i].getSocket().send(remoteCommand.toString());
			}
			catch (e) {
				// user socket is no more active remove
				this._userSockets.splice(i, 1);
			}
			
		}
	}
};

ArduinoSocket.prototype = methods

module.exports = ArduinoSocket;