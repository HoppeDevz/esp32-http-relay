#include "WiFi.h"
#include "WebSocketsClient.h"
#include "ArduinoJson.h"

#include "port_forward.h"
#include "http_request.h"

int HEARTBEAT_INTERVAL = 20000;
int LAST_HEARTBEAT = millis();
boolean CONNECTED_TO_MIDDLEWARE_SERVER = false;

const char* ssid = "Rancho Wifi";
const char* password = "guga@123";

const char* webSocketUrl = "149.56.174.85";
const uint16_t webSocketPort = 32512;

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  
  switch(type) {
    
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket Server");
      CONNECTED_TO_MIDDLEWARE_SERVER = false;
      break;
      
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket Server");
      CONNECTED_TO_MIDDLEWARE_SERVER = true;
      break;
      
    case WStype_TEXT:
      Serial.println("Message received from WebSocket Server: " + String((char *)payload));

      StaticJsonDocument<1024> doc; // sizeof
      DeserializationError error = deserializeJson(doc, (char*)payload);

      if (error) {
        Serial.println("Error while trying to read JSON");
        return;
      }

      const char* eventName = doc["eventName"];

      Serial.print("eventName: ");
      Serial.println(eventName);
      
      if (strcmp(eventName, "http-request") == 0) {

          JsonObject data = doc["data"];

          const char* requestId = data["requestId"];
          const char* path = data["path"];
          const char* method = data["method"];
          const int port = data["port"];

          const JsonObject body = data["body"];
          const JsonObject headers = data["headers"];

          const portForward target = getPortForward(port);

          if (target.port == -1) {

            Serial.println("Error while trying to get port forward object");
            return;
          }
  
          fetchResponse response = fetch(method, target.ipv4, path, port, headers, body);

          if (response.httpCode > 0) {

            StaticJsonDocument<1024> mainJSON;
            StaticJsonDocument<1024> data;

            mainJSON["eventName"] = "http-request." + String(requestId);
            data["httpCode"] = response.httpCode;
            data["data"] = response.data;
            mainJSON["data"] = data;

            String stringifyJSON;
            serializeJson(mainJSON, stringifyJSON);

            Serial.println(stringifyJSON);

            webSocket.sendTXT(stringifyJSON);
          }
      }
      
      break;
  }
}

void heartBeat() {

  uint64_t now = millis();
  
  if((now - LAST_HEARTBEAT) > HEARTBEAT_INTERVAL) {

      LAST_HEARTBEAT = now;
      webSocket.sendPing();
  }
}

void setup() {

  Serial.begin(115200);
  
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to Wi-Fi...");
  }
  
  Serial.println("Connected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(webSocketUrl, webSocketPort);
  webSocket.onEvent(webSocketEvent);
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {
    
    webSocket.loop();
    heartBeat();
  }
}
