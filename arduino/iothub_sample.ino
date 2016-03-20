#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>

#include "IoTHub.h"

YunClient yunClient;
IoTHub iotHub(yunClient);

void setup() {
  Serial.begin(9600);
  for(int i = 0; i <= 13; i++)
    pinMode(i, OUTPUT);
//  digitalWrite(13, HIGH);
  
  Bridge.begin();
  
  iotHub.connect();
  delay(100);
}

void loop() {
  String data = "";
  while(iotHub.connected())
  {
    data = iotHub.readData();
    Serial.println(data.c_str());
    handleCommand(data);
    delay(100);
  }
  Serial.println("not connected");
  iotHub.connect();
  delay(100);
}

void handleCommand(String& remoteCommand) {
  if(remoteCommand.startsWith("digitalWrite")) {
      Serial.println("digitalWriteCommand");
      String pin = getParameterFromRemoteCommand(remoteCommand, 1);
      String value = getParameterFromRemoteCommand(remoteCommand, 2);

      Serial.println(pin.c_str());
      Serial.println(value.c_str());

      int pinName = pin.toInt();

      if(value.equals("HIGH")) {
        digitalWrite(pinName, HIGH);
      }
      else if(value.equals("LOW")) {
        digitalWrite(pinName, LOW);
      }
  }
  else if(remoteCommand.startsWith("digitalRead")) {
      String pin = getParameterFromRemoteCommand(remoteCommand, 1);

      int pinName = pin.toInt();
      int response = digitalRead(pinName);
      if(response == HIGH) {
        iotHub.writeData(String("digitalReadResponse:")+pin+String(":HIGH"));
      }
      else if(response == LOW) {
        iotHub.writeData(String("digitalReadResponse:")+pin+String(":LOW"));
      }
  }
  else if(remoteCommand.startsWith("pinMode")) {
      String pin = getParameterFromRemoteCommand(remoteCommand, 1);
      String value = getParameterFromRemoteCommand(remoteCommand, 2);

      int pinName = pin.toInt();

      if(value.equals("OUTPUT")) {
        pinMode(pinName, OUTPUT);
      }
      else if(value.equals("INPUT")) {
        pinMode(pinName, INPUT);
      }
  }
  
}
