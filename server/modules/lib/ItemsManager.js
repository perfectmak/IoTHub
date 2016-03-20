var User = require('./models/User');
var Arduino = require('./models/Arduino');

var UserSocket = require('./UserSocket');
var ArduinoSocket = require('./ArduinoSocket');
var RemoteCommand = require('./RemoteCommand');
var Log = require('./Log');
/**
* Actions that should be executed by this Manager and not
* UserSocket or ArduinoSocket
*/
var Actions = RemoteCommand.Actions;

var ServerActions = [Actions.whoami];

/**
* This is the actual a Manager and Router class
* @param serverSocket: WebServerSocket //under the modules
*/
var ItemsManager = function(serverSocket) {
	this._arduinoSockets = [];
	this._userSockets = [];
	this._serverSocket = serverSocket;
	this._isRunning = false;
};

var methods = {

	addArduinoSocket: function(arduinoSocket, arduino) {
		Log.d("A new Arduino has connected");
		this._arduinoSockets.push(arduinoSocket);
	},

	addUserSocket: function(userSocket) {
		Log.d("A new User has connected");
		this._userSockets.push(userSocket);
	},

	removeArduinoSocket: function(arduinoSocket) {
		var socketPosition = this._arduinoSockets.indexOf(arduinoSocket);
		if(socketPosition !== -1) {
			delete this._arduinoSockets[socketPosition];
			this._arduinoSockets.splice(socketPosition, 1);
		}
		else
			Log.d("Unknown ArduinoSocket being deleted");
	},

	removeUserSocket: function(userSocket) {
		var socketPosition = this._userSockets.indexOf(userSocket);
		if(socketPosition !== -1) {
			delete this._userSockets[socketPosition];
			this._userSockets.splice(socketPosition, 1);
		}
		else
			Log.d("Unknown UserSocket being deleted");
		
	},

	isRunning: function() {
		return this._isRunning
	},

	start: function() {
		if(this.isRunning())
			return;
		var self = this;

		this._serverSocket.hook("onNewConnection", function(webSocket){
			Log.d("New client connection.");
			webSocket.hook("onMessage", function(message) {
					Log.d("ItemsManager.message: " + message);				
					var remoteCommand = RemoteCommand.fromString(message);

					if(self.isServerCommand(remoteCommand)) {
						try {
							self.handleServerCommand(webSocket, remoteCommand);
						}
						catch(e) {
							Log.d(e);
							//send error to websocket
						}
					}
			});

		});

		this._isRunning = true;
	},

	stop: function() {
		this._isRunning = false;
	},

	isServerCommand: function(remoteCommand) {
		return ServerActions.indexOf(remoteCommand.getAction()) != -1;
	},

	handleServerCommand: function(socket, remoteCommand) {
		switch(remoteCommand.getAction()) {
			case Actions.whoami:
				var remoteParams = remoteCommand.getParameters();

				if(remoteParams.length != 2) {
					throw new Error("`whoami` required two paramters")
				}

				var who = remoteParams[0];
				var userId = remoteParams[1];

				switch(who) {
					case "yun":
						var arduino = Arduino.create(userId);
						var arduinoSocket = ArduinoSocket.create(socket, arduino);
						this.addArduinoSocket(arduinoSocket);
						this._attachArduinoSocketToUserSockets(arduinoSocket);

						var self = this;
						//attach close listener
						arduinoSocket.getSocket().hook("onClose", function(){
							Log.d("Arduino has disconnected");
							self._dettachArduinoSocketFromUserSocket(arduinoSocket);
							self.removeArduinoSocket(arduinoSocket);
						});
						break;
					case "user":
						var user = User.findOrCreate(userId);
						var userSocket = UserSocket.create(socket, user);
						this.addUserSocket(userSocket);
						this._attachUserSocketToArduinoSockets(userSocket);

						var self = this;
						//attach close listener
						userSocket.getSocket().hook("onClose", function(){
							Log.d("User has disconnected");
							self.removeUserSocket(userSocket);
						});
						break
					default:
						throw new Error("Unknown entity trying to connect");
				}
				break;
			default:
				throw new Error("unknown command");
		}
	},

	/**
	* attaches UserSockets to ArduinoSockets if any
	*
	* NOTE: this should only be called on new connections
	*/
	_attachUserSocketToArduinoSockets: function(userSocket) {
		for(var i in this._arduinoSockets) {
			if(userSocket.getUser().getId()
				== this._arduinoSockets[i].getArduino().getUserId()) {
				userSocket.addArduinoSocket(this._arduinoSockets[i]);
				this._arduinoSockets[i].addUserSocket(userSocket);

				//notify user of connected arduino
				userSocket.getSocket().send(
					RemoteCommand.fromActionAndParameters(
						Actions.arduinoConnected, []
					).toString()
				);
			}
		}
	},

	/**
	* attaches ArduinoSockets to UserSockets if any
	*
	* NOTE: this should only be called on new connections
	*/
	_attachArduinoSocketToUserSockets: function(arduinoSocket) {
		for(var i in this._userSockets) {
			if(arduinoSocket.getArduino().getUserId() 
				== this._userSockets[i].getUser().getId()) {
				arduinoSocket.addUserSocket(this._userSockets[i]);
				this._userSockets[i].addArduinoSocket(arduinoSocket);

				//notify user that arduino has connected
				this._userSockets[i].getSocket().send(
					RemoteCommand.fromActionAndParameters(
						Actions.arduinoConnected, []
					).toString()
				);
			}
		}
	},

	_dettachArduinoSocketFromUserSocket: function(arduinoSocket) {

		//notify user that arduino has disconnected.
		var userSockets = arduinoSocket.getUserSockets();
		var socketsLength = userSockets.length;
		for(var i = 0; i < socketsLength; i++) {
			userSockets[i].getSocket().send(
				RemoteCommand.fromActionAndParameters(
						Actions.arduinoDisconnected, []
					).toString()
				);
		}
	}
};

ItemsManager.prototype = methods;


module.exports = ItemsManager;