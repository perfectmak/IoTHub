//#define DEBUGGING

#include "global.h"
#include "WebSocketClient.h"

#include "sha1.h"
#include "Base64.h"

#define DEBUGGING 1

bool WebSocketClient::handshake(Client *client) {

    socket_client = client;

    // If there is a connected client->
    if (socket_client->connected()) {
        // Check request and look for websocket handshake
#ifdef DEBUGGING
            Serial.println(F("Client connected"));
#endif
            if(socket_client->connected()) {
        Serial.println("Socket is Connected");
    }
        if (analyzeRequest()) {
#ifdef DEBUGGING
                Serial.println(F("Websocket established"));
#endif

                return true;

        } else {
            // Might just need to break until out of socket_client loop.
#ifdef DEBUGGING
            Serial.println(F("Invalid handshake"));
#endif
            disconnectStream();

            return false;
        }
    } else {
        return false;
    }
}

bool WebSocketClient::analyzeRequest() {
    String temp;

    int bite;
    bool foundupgrade = false;
    unsigned long intkey[2];
    String serverKey;
    char keyStart[17];
    char b64Key[25];
    String key = "------------------------";

    randomSeed(analogRead(0));

    for (int i=0; i<16; ++i) {
        keyStart[i] = (char)random(1, 256);
    }

    base64_encode(b64Key, keyStart, 16);

    for (int i=0; i<24; ++i) {
        key[i] = b64Key[i];
    }

#ifdef DEBUGGING
    Serial.println(F("Sending websocket upgrade headers"));
#endif    

    socket_client->write((uint8_t*)"GET ", 4);
    Serial.print("path length: ");
    Serial.print(strlen(path));
    socket_client->write((uint8_t*)path, strlen(path));
    socket_client->write((uint8_t*)" HTTP/1.1\r\n", 11);    
    socket_client->write((uint8_t*)"Upgrade: websocket\r\n", 20);
    socket_client->write((uint8_t*)"Connection: Upgrade\r\n", 21);
    socket_client->write((uint8_t*)"Host: ", 6);
    socket_client->write((uint8_t*)host, strlen(host));
    socket_client->write((uint8_t*)CRLF, 2); 
    socket_client->write((uint8_t*)"Sec-WebSocket-Key: ", 19);
    socket_client->write((uint8_t*)key.c_str(), key.length());
    socket_client->write((uint8_t*)CRLF,2);
    socket_client->write((uint8_t*)"Sec-WebSocket-Protocol: ", 25);
    socket_client->write((uint8_t*)protocol, strlen(protocol));
    socket_client->write((uint8_t*)CRLF, 2);
    socket_client->write((uint8_t*)"Sec-WebSocket-Version: 13\r\n", 27);
    socket_client->write((uint8_t*)CRLF, 2);

#ifdef DEBUGGING
    Serial.println(F("Analyzing response headers"));
#endif    

    while (true) {
        int available = socket_client->available();
        Serial.println(available);
        if(socket_client->connected() && (available == 0)) {
            delay(100);
            Serial.println("Waiting...");
        }
        else {
            break;
        }
    }
    // TODO: More robust string extraction
    while ((bite = socket_client->read()) != -1) {
        temp += (char)bite;

        if ((char)bite == '\n') {
#ifdef DEBUGGING
            Serial.print("Got Header: " + temp);
#endif
            if (!foundupgrade && temp.startsWith("Upgrade: websocket")) {
                Serial.println("upgrade found.");
                foundupgrade = true;
            } else if (temp.startsWith("Sec-WebSocket-Accept: ")) {
                // Serial.println("serverkey");
                serverKey = temp.substring(22,temp.length() - 2); // Don't save last CR+LF
            }
            temp = "";		
        }

        if (!socket_client->available()) {
          delay(20);
        }
    }

    key += "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    uint8_t *hash;
    char result[21];
    char b64Result[30];

    Sha1.init();
    Sha1.print(key);
    hash = Sha1.result();

    for (int i=0; i<20; ++i) {
        result[i] = (char)hash[i];
    }
    result[20] = '\0';

    base64_encode(b64Result, result, 20);

    Serial.println(b64Result);
    Serial.println(serverKey.c_str());

    // if the keys match, good to go
    return serverKey.equals(String(b64Result));
}


bool WebSocketClient::handleStream(String& data, uint8_t *opcode) {
    uint8_t msgtype;
    uint8_t bite;
    unsigned int length;
    uint8_t mask[4];
    uint8_t index;
    unsigned int i;
    bool hasMask = false;

    if (!socket_client->connected() || !socket_client->available())
    {
        return false;
    }      

    msgtype = timedRead();
    if (!socket_client->connected()) {
        return false;
    }

    length = timedRead();

    if (length & WS_MASK) {
        hasMask = true;
        length = length & ~WS_MASK;
    }


    if (!socket_client->connected()) {
        return false;
    }

    index = 6;

    if (length == WS_SIZE16) {
        length = timedRead() << 8;
        if (!socket_client->connected()) {
            return false;
        }
            
        length |= timedRead();
        if (!socket_client->connected()) {
            return false;
        }   

    } else if (length == WS_SIZE64) {
#ifdef DEBUGGING
        Serial.println(F("No support for over 16 bit sized messages"));
#endif
        return false;
    }

    if (hasMask) {
        // get the mask
        mask[0] = timedRead();
        if (!socket_client->connected()) {
            return false;
        }

        mask[1] = timedRead();
        if (!socket_client->connected()) {

            return false;
        }

        mask[2] = timedRead();
        if (!socket_client->connected()) {
            return false;
        }

        mask[3] = timedRead();
        if (!socket_client->connected()) {
            return false;
        }
    }
        
    data = "";
        
    if (opcode != NULL)
    {
      *opcode = msgtype & ~WS_FIN;
    }
                
    if (hasMask) {
        for (i=0; i<length; ++i) {
            data += (char) (timedRead() ^ mask[i % 4]);
            if (!socket_client->connected()) {
                return false;
            }
        }
    } else {
        for (i=0; i<length; ++i) {
            data += (char) timedRead();
            if (!socket_client->connected()) {
                return false;
            }
        }            
    }
    
    return true;
}

void WebSocketClient::disconnectStream() {
#ifdef DEBUGGING
    Serial.println(F("Terminating socket"));
#endif
    // Should send 0x8700 to server to tell it I'm quitting here.
    socket_client->write((uint8_t) 0x87);
    socket_client->write((uint8_t) 0x00);
    
    socket_client->flush();
    delay(10);
    socket_client->stop();
}

bool WebSocketClient::getData(String& data, uint8_t *opcode) {
    return handleStream(data, opcode);
}    

void WebSocketClient::sendData(const char *str, uint8_t opcode) {
#ifdef DEBUGGING
    Serial.print(F("Sending data: "));
    Serial.println(str);
#endif
    if (socket_client->connected()) {
        sendEncodedData(str, opcode);       
    }
}

void WebSocketClient::sendData(String str, uint8_t opcode) {
#ifdef DEBUGGING
    Serial.print(F("Sending data: "));
    Serial.println(str);
#endif
    if (socket_client->connected()) {
        sendEncodedData(str, opcode);
    }
}

int WebSocketClient::timedRead() {
  while (!socket_client->available()) {
    delay(20);  
  }

  return socket_client->read();
}

void WebSocketClient::sendEncodedData(char *str, uint8_t opcode) {
    uint8_t mask[4];
    int size = strlen(str);

    // Opcode; final fragment
    socket_client->write(opcode | WS_FIN);

    // NOTE: no support for > 16-bit sized messages
    if (size > 125) {
        socket_client->write(WS_SIZE16 | WS_MASK);
        socket_client->write((uint8_t) (size >> 8));
        socket_client->write((uint8_t) (size & 0xFF));
    } else {
        socket_client->write((uint8_t) size | WS_MASK);
    }

    mask[0] = random(0, 256);
    mask[1] = random(0, 256);
    mask[2] = random(0, 256);
    mask[3] = random(0, 256);
    
    socket_client->write(mask[0]);
    socket_client->write(mask[1]);
    socket_client->write(mask[2]);
    socket_client->write(mask[3]);
     
    for (int i=0; i<size; ++i) {
        socket_client->write(str[i] ^ mask[i % 4]);
    }
}

void WebSocketClient::sendEncodedData(String str, uint8_t opcode) {
    int size = str.length() + 1;
    char cstr[size];

    str.toCharArray(cstr, size);

    sendEncodedData(cstr, opcode);
}

void WebSocketClient::setPath(char* path) {
    int pathSize = strlen(path);
    this->path = new char[pathSize+1];
    strcpy(this->path, path);
}

void WebSocketClient::setHost(char* host) {
    int hostSize = strlen(host);
    this->host = new char[hostSize+1];
    strcpy(this->host, host);
}

void WebSocketClient::setProtocol(char* protocol) {
    int protocolSize = strlen(protocol);
    this->protocol = new char[protocolSize+1];
    strcpy(this->protocol, protocol);
}