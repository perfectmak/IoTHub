var RemoteCommand = function(){

}

RemoteCommand.COMMAND_SEPARATOR = ":";

RemoteCommand.sanitizeComponent = function(component) {
	return component.trim();
};

/**
*
* @param command - string command e.g digitalWrite::high::1
*/
RemoteCommand.fromString = function(command) {
	var commandComponents = command.split(RemoteCommand.COMMAND_SEPARATOR);
	
	var action = commandComponents[0];
	var parameters = commandComponents.splice(1, commandComponents.length-1);

	return RemoteCommand.fromActionAndParameters(action, parameters)
}

/**
* @param action - string name of actions
* @param parameters = array of string parameters
*
* @return RemoteCommand Object
*/
RemoteCommand.fromActionAndParameters = function(action, parameters) {
	var remoteCommand = new RemoteCommand();
	remoteCommand.setAction(action);
	remoteCommand.setParameters(parameters);
	
	return remoteCommand;
};

var methods = {
	setAction: function(action) {
		action = RemoteCommand.sanitizeComponent(action);
		this._action = action;
	},

	getAction: function() {
		return this._action;
	},

	setParameters: function(params) {
		if(!(params instanceof Array))
		{
			throw new Error('RemoteCommand Parameters must be array');
		}
		
		for (var i = 0; i < params.length; i++) {
			params[i] = RemoteCommand.sanitizeComponent(params[i]);
		};

		this._params = params;
	},

	getParameters: function() {
		return this._params;
	},

	toString: function() {
		var separator = RemoteCommand.COMMAND_SEPARATOR;
		if(this.getParameters().length == 0)
			return this.getAction();
		else
			return this.getAction() + separator + 
				this.getParameters().reduce(function(initial,item){
					return initial + separator + item;
				});
	}
};

RemoteCommand.prototype = methods;

RemoteCommand.Actions = {
	whoami : "whoami",
	digitalWrite : "digitalWrite",
	digitalRead : "digitalRead",
	arduinoConnected: "arduinoConnected",
	arduinoDisconnected: "arduinoDisconnected"
};