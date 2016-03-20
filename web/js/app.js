wsConnect(); //connect websocket to iot server;

// $('[name=inputLedToggle]').bootstrapSwitch();

var INPUT_LOW = "LOW";
var INPUT_HIGH = "HIGH";

var STATUS_CONNECTED = "Connected";
var STATUS_DISCONNECTED = "Not Connected";

/**
* Helper Functions - mostly pure functions
*/
function half(value) {
	return value/2;
}

/**
* Global variable
*/
var selectedComponent = null; //Component item

var configCanvasId = "configurationCanvas";
var canvasWidth = 800;
var canvasHeight = 600;
var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, configCanvasId, 
	{ preload: preload, create: create, update: update });

var yunImage = "yunImage";
var LedAssetName = LedComponent.getAssetName();
var overAComponent = false; //to know if mouse is over a component

var componentGroup;
var yunSprite;

function preload() {
	game.load.image(yunImage, "./assets/yun2.png");
	game.load.image(LedAssetName, LedComponent.getAssetUrl());
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.stage.backgroundColor = "#ffffff";

	//add a single arduino (yun)
	yunSprite = game.add.sprite(20, 20, yunImage);
	yunSprite.scale.set(0.3,0.3);
	game.physics.arcade.enable(yunSprite);
	yunSprite.body.collideWorldBounds = true; //enable collision
	yunSprite.inputEnabled = true;
	yunSprite.input.useHandCursor = true;
	yunSprite.input.enableDrag();

	componentGroup = game.add.physicsGroup();
    // componentGroup.enableBody = true;
    // componentGroup.physicsBodyType = Phaser.Physics.ARCADE;
    // componentGroup.body.collideWorldBounds = true;
	
}

function update() {
	game.physics.arcade.collide(yunSprite, componentGroup);

	if(game.input.activePointer.isDown) {
		if(getSelectedComponent()) {
			addComponent(getSelectedComponent(), game.input.x, 
				game.input.y);

			setSelectedComponent(null);
		}
		if(!overAComponent)
		{
			toggleInputBody(false);
			toggleOutputBody(false);
		}
	}
}

var ledConfigs = {};
var componentId = 1;
var usedPins = [];
function addComponent(component, x, y) {
	
	$("#configPopup").modal("show");

	$("#configOkBtn").off("click").click(function(){
		var pinName = $("input[name=pin]").val();
		pinName = pinName.trim();

		if(pinName == "") {
	  		alert("Specify a digital Pin (1-13)");
	  	}
	  	else if((usedPins[0] == pinName) || (pinName in usedPins))
	  	{
	  		alert("Pin has been used before.");
	  	}
	  	else {
	  		usedPins.push(pinName);

	  		var newSprite = componentGroup.create(x, y, 
				component.getAssetName());//game.add.sprite(x, y, component.getAssetName());	
			
			newSprite.scale.set(0.3,0.3);

			game.physics.arcade.enable(newSprite);
			newSprite.inputEnabled = true;
			newSprite.input.useHandCursor = true;
			newSprite.input.enableDrag();
			// newSprite.angle += 180;	

			//save current led component
			ledConfigs[componentId] = {pinName: pinName, state: INPUT_LOW}

			var localCopyId = componentId;
			//add click listener
			newSprite.events.onInputDown.add(function(event, sprite) {
				updateInputControl(localCopyId);
				updateOutputControl(localCopyId);
			});

			newSprite.events.onInputOver.add(function(event, sprite) {
				overAComponent = true;
			});

			newSprite.events.onInputOut.add(function(event, sprite) {
				overAComponent = false;
			});
			componentId += 1;
			
			$("#configPopup").modal("hide");

			//configure pin to be output
			wsSend("pinMode:"+pinName+":OUTPUT");
	  	}
	});

	$('#configPopup').on('hidden.bs.modal', function (e) {
		$("input[name=pin]").val("");
	});
}

function toggleOutputBody(toggle) {
	if(toggle)
		$("#outputBody").removeClass("hidden");
	else
		$("#outputBody").addClass("hidden");
}

function toggleInputBody(toggle) {
	if(toggle)
		$("#inputBody").removeClass("hidden");
	else
		$("#inputBody").addClass("hidden");
}

function updateInputControl(component) {
	var config = ledConfigs[component];

	console.log(config);
	$("#inputLedToggle").prop("checked", config.state == INPUT_HIGH);

	$("#inputLedToggle").off("change").change(function() {
        	if ($(this).is(':checked')) {
        		ledConfigs[component].state = INPUT_HIGH;
        	}
        	else {
        		ledConfigs[component].state = INPUT_LOW;
        	}

        	wsSend("digitalWrite:"+config.pinName+":"+ledConfigs[component].state, null);
        	updateOutputControl(component);
	});

	toggleInputBody(true);
}	

function updateOutputControl(component) {
	var config = ledConfigs[component];

	//send a digitalRead to arduino
	wsSend("digitalRead:"+config.pinName, function(response) {
		var remoteCommand = RemoteCommand.from(response);

		if(remoteCommand.getAction() == "digitalReadResponse") {

			var remotePin = remoteCommand.getParameters()[0];
			var remoteValue = remoteCommand.getParameters()[1];
			
			if(config.pinName == remotePin) {
				$("#outputLedToggle").prop("checked", remoteValue == INPUT_HIGH);
			}
		}
	});

	// toggleOutputBody(true);
}

//global component function
function setSelectedComponent(component) {
	selectedComponent = window[component];	
}

function getSelectedComponent() {
	return selectedComponent;
}

//websocket code
var ws;
var wsResponseCallback;

function wsConnect() {
	ws = new WebSocket("ws://localhost:3500/ws");
    
    ws.onopen = function(){  
        console.log("Socket has been opened!");
        //state you are online;
        wsSend("whoami:user:1");
        updateUStatus(STATUS_CONNECTED);
    };
    
    ws.onmessage = function(message) {
        message = message.data;

        var remoteCommand = RemoteCommand.fromString(message);
        if(remoteCommand.getAction() == "arduinoConnected") {
        	updateAStatus(STATUS_CONNECTED);
        }
        else if(remoteCommand.getAction() == "arduinoDisconnected") {
        	updateAStatus(STATUS_DISCONNECTED);
        }
        else if(wsResponseCallback) {
        	wsResponseCallback(message);
        }
    };

  	ws.onclose = function(){
  		updateUStatus(STATUS_DISCONNECTED);
  		updateAStatus(STATUS_DISCONNECTED);
  		console.log("socket closed");
  		console.log("reconnecting");
  		wsConnect();
  	}
};

function wsSend(request, responseCallback) {
      ws.send(request);
      wsResponseCallback = responseCallback;
};

function updateAStatus(status) {
	$("#aStatus").html(status);
}

function updateUStatus(status) {
	$("#uStatus").html(status);
}
