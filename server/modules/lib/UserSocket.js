var RemoteCommand = require('./RemoteCommand');
var Log = require('./Log');

var UserSocket = function(socket, user) {
	this._user = user;
	this._socket = socket;
	this._arduinoSockets = [];

	var self = this;


	//hook to on Message and onClose
	this._socket.hook("onMessage", function(message){
		Log.d("UserSocket.ctor: "+message);
		var remoteCommand = RemoteCommand.fromString(message);
		self.dispatchCommand(remoteCommand);
	});
};

UserSocket.create = function(socket, user) {
	return new UserSocket(socket, user);
}

var methods = {
	
	getSocket: function() {
		return this._socket;
	},

	getUser: function() {
		return this._user;
	},

	addArduinoSocket: function(arduinoSocket) {
		this._arduinoSockets.push(arduinoSocket);
	},

	getArduinoSockets: function() {
		this._arduinoSockets;
	},

	dispatchCommand: function(remoteCommand) {
		for(var i in this._arduinoSockets) {
			try {
				//try because socket might not be valid anymore
				//this design might be wrong, but it gets things done :D
				this._arduinoSockets[i].getSocket().send(remoteCommand.toString());
			}
			catch (e) {
				// arduino socket is no more active remove
				this._arduinoSockets.splice(i, 1);
			}
		}
	}
};

UserSocket.prototype = methods;

module.exports = UserSocket;