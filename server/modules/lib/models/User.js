
var _allUsers = [];

var User = function (id) {
	this.setId(id);
};

User.create = function (id) {
	var newUser = new User(id);
	_allUsers.push(newUser);
	return newUser;
}

User.find = function(id) {
	for (var i in _allUsers) {
		if(i.getId == id) {
			return i;
		}
	}

	return false;
}

User.findOrCreate = function(id) {
	return User.find(id) || User.create(id);
}

var methods = {
	setId: function(id) {
		this._id = id;
	},

	getId: function() {
		this._id;
	},

	addArduino: function(arduino) {
		throw new Error("not implemented");
	},

	getArduinos: function() {
		throw new Error("not implemented");
	}
};

User.prototype = methods;

module.exports = User;