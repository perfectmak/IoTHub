# IoT Hub

## Description
This is project is an experiment with building an iot hub of Micro controllers (for now Arduinos) that is easily 
configured via a drag n drop web interface. 

The Hub uses WebSockets as the form of communication and communication is via a custom protocol codenamed **'RemoteCommand'**.

## Requirements
- Arduino
- Node js

## Setup
The code is split into three parts
- **Arduino**
- **Server**
- **Web**

### Arduino Setup
To setup the arduino, just copy the IoTHub library in the libraries folder to your local arduino libraries archive.
And then you can include it directly in your project. 
All you have to do is parse the RemoteCommands being sent from the Server. A sample code can be found in the Arduino/iothub_sample.ino sketch.
 
### Server Setup
The Server is written with nodejs. So just run the following commands.
```
npm install
npm start
``` 
and the IoT Hub Server is up.

### Web Interface Setup
The Web Portal is a drag and drop editor that allows to configure connected Arduinos with various Components (For now its only LED).
The Web Portal was built with [Phaser](http://phaser.io).

Just open the web/index.html file in your browser.
You will see a connected status, once it can connect to the iot server.

## Remote Command
The whole iot hub communicates via a text based protocol which is called **'RemoteCommand'**.
It consists of two parts delimited by a colon (:). The two parts are:
- Action
- Parameters: If the parameters are multiple, then they are separated with a colon (:)

For example
```
// this is for authentication, the comman is 'whoami' and the parameter is 'yun' 
whoami:yun
```

Right now there are five RemoteCommands defined in the system, and they can be found at the bottom of
'server/modules/lib/RemoteCommand.js' 

```
RemoteCommand.Actions = {
	whoami : "whoami",
	digitalWrite : "digitalWrite",
	digitalRead : "digitalRead",
	arduinoConnected: "arduinoConnected",
	arduinoDisconnected: "arduinoDisconnected"
};
```
## Contributions

You are free to contribute as you wish to the code.
What is majorly missing now are various Arduino Components. Right now, there is only one Arduino Component configured in the web portal (Led Component).
 
## FAQ
### - Unable to bind to Port
By default, the websocket connections use 3500. You would have to change the port numbers in all three parts i.e the Arduino, Web and Server to a port number that is available.

### - Which Arduino can I use
Right now, the sample sketch uses an Arduino Yun, but the IoTHub library can be used with any Arduino that has a networking module and it extends the standard 'Client.h' interface.


## License

This project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)