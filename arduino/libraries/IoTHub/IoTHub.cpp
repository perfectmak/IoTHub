#include "IoTHub.h"

// #include <Serial.h>

IoTHub::IoTHub(Client& client) {
	_client = &client;
	_webSocketClient = new WebSocketClient;
	_webSocketClient->setHost(SERVER_HOST);
	_webSocketClient->setProtocol("chat");
	_webSocketClient->setPath("/ws");
	_isConnected = false;	
}

void IoTHub::connect() {
	if(_client->connect(SERVER_HOST, SERVER_PORT)) {
		if(_webSocketClient->handshake((_client))) {
			//state you are an arduino
			String whoamiCommand = "whoami:yun:1";
			writeData(whoamiCommand);
			_isConnected = true;
		}
		else {
			Serial.println("Handshake failed");
		}
	}
	else {
		Serial.println("Could not connect");
	}
		
}

bool IoTHub::connected() {
	return _client->connected() && _isConnected;
}

String IoTHub::readData() {
	String data = "";
	_webSocketClient->getData(data);

	return data;
}

void IoTHub::writeData(String& data) {
	_webSocketClient->sendData(data);
}


String getValue(String data, char separator, int index) {

    int maxIndex = data.length()-1;
    int j=0;
    String chunkVal = "";

    for(int i=0; i<=maxIndex && j<=index; i++) { 
      	if(data[i]==separator) {
        	j++;

        	if(j>index) {
          		chunkVal.trim();
          		return chunkVal;
    		}    

        	chunkVal = "";    
      	}	
      	else {
      		chunkVal.concat(data[i]);
      	}
    }

    return chunkVal;
}

String getActionFromRemoteCommand(String command) {
	int index = command.indexOf(":");
	String action = command.substring(0, index+1);

	return action;
}

String mergeCommand(String action, String parameters[]) {
	String command = action;
	int sizeOfParams = sizeof(parameters)/sizeof(String);
	for(int i = 0; i < sizeOfParams; i++) {
		command += COMMAND_SEPARATOR + parameters[i];
	}
	return command;
}

String getParameterFromRemoteCommand(String command, int no) {
	return getValue(command, COMMAND_SEPARATOR, no);
}
