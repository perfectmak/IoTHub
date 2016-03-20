/**
* Helper function
*/
function between(x, start, stop) {
	return (x > start) && (x < stop);
}

var Port = function() {

}

Port.Function = {
	Input: "Input",
	Output: "Output"
}

Port.Type = {
	Analog: "Analog",
	Digital: "Digital"
}

var Arduino = function (userId) {
	this._usedAnalogPorts = {};
	this._usedDigitalPorts = {};
	this._components = [];
	this.setUserId(userId);
};

Arduino.create = function (userId) {
	return new Arduino(userId);
}

var methods = {
	setUserId: function(userId) {
		this._userId = userId;
	},

	getUserId: function() {
		this._userId;
	},

	addComponent: function(arduinoComponent) {
		this._components.push(arduinoComponent);
	},

	setPortFunction: function(type, port, portFunction) {
		switch(type) {
			case Port.Analog:
				if(between(port, -1, Arduino.MAX_ANALOG_PORT_NO)) {
					if(!this.this._usedAnalogPorts[port])
						this._usedAnalogPorts[port] = portFunction;
					else
						throw new Error("Port is used"); //change to UsedPortError
				}
				else
					throw new Error("Port out of range");
				break;
			case Port.Digital:
				if(between(port, -1, Arduino.MAX_DIGITAL_PORT_NO)) {
					if(!this.this._usedDigitalPorts[port])
						this._usedDigitalPorts[port] = portFunction;
					else
						throw new Error("Port is used"); //change to UsedPortError
				}
				else
					throw new Error("Port out of range");
				break;
			default:
				throw new Error("Unknown port type");
		}
	},

	setDigitalPortFunction: function(port, portFunction) {
		this.setPortFunction(Port.Digital, port, portFunction);
	},

	setAnalogPortFunction: function(port, portFunction) {
		this.setPortFunction(Port.Analog, port, portFunction);
	},

	unsetPortFunction: function(type, port) {
		switch(type) {
			case Port.Analog:
				if(between(port, -1, Arduino.MAX_ANALOG_PORT_NO)) {
					if(this.this._usedAnalogPorts[port])
						delete this._usedAnalogPorts[port];
				}
				else
					throw new Error("Port out of range");
				break;
			case Port.Digital:
				if(between(port, -1, Arduino.MAX_DIGITAL_PORT_NO)) {
					if(this.this._usedDigitalPorts[port])
						delete this._usedDigitalPorts[port];
				}
				else
					throw new Error("Port out of range");
				break;
			default:
				throw new Error("Unknown port type");
		}
	},

	unsetDigitalPortFunction: function(port) {
		this.unsetPortFunction(Port.Digital, port);
	},

	unsetAnalogPortFunction: function(port) {
		this.unsetPortFunction(Port.Analog, port);
	},
};

Arduino.MAX_DIGITAL_PORT_NO = 13;
Arduino.MAX_ANALOG_PORT_NO = 6;

Arduino.prototype = methods;

Arduino.Port = Port;

module.exports = Arduino;