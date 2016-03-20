/**
* Client Controller for IoTHub
*
*
*/
#ifndef IOT_HUB_H
#define IOT_HUB_H

#include <Arduino.h>
#include <Client.h>

#include "WebSocketClient.h"

#define SERVER_HOST "192.168.0.102"
#define SERVER_PORT 3500

#define COMMAND_SEPARATOR ':'

//helper function to extract remoteCommands
String getValue(String data, char separator, int index);

String getActionFromRemoteCommand(String command);
String getParameterFromRemoteCommand(String command, int index);
String mergeCommand(String action, String parameters[] = {});


class IoTHub {
public:
	IoTHub(Client& client);
	void connect();
	bool connected();
	String readData();
	void writeData(String& data);

private:
	Client* _client;
	WebSocketClient* _webSocketClient;
	bool _isConnected;
};

#endif