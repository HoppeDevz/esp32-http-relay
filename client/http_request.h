#include "HTTPClient.h"
#include "ArduinoJson.h"

struct fetchResponse {

  int httpCode;
  String data;
};

fetchResponse fetch(const char* method, const char* ipv4, const char* path, const int port, const JsonObject headers, const JsonObject body) {

  HTTPClient http;
  int httpResponseCode = 0;
  String url = "http://" + String(ipv4) + ":" + String(port) + String(path);
    
  const char* contentType = headers["Content-Type"];
  const char* authorization = headers["Authorization"];

  String stringifyBody;
  serializeJson(body, stringifyBody);
  
  http.begin(url);
  
  http.addHeader("Content-Type", contentType);
  http.addHeader("Authorization", authorization);

  if (strcmp(method, "GET") == 0) {
    
    httpResponseCode = http.GET();
  }

  if (strcmp(method, "POST") == 0) {
    
    httpResponseCode = http.POST(stringifyBody);
  }

  if (strcmp(method, "PUT") == 0) {
    
    httpResponseCode = http.PUT(stringifyBody);
  }

  if (strcmp(method, "PATCH") == 0) {
    
    httpResponseCode = http.PATCH(stringifyBody);
  }

  /*
  if (strcmp(method, "DELETE") == 0) {
    
    httpResponseCode = http.DELETE();
  }
  */

  if (httpResponseCode > 0) {
      
      Serial.print("HTTP response code: ");
      Serial.println(httpResponseCode);
      
      String payload = http.getString();
      Serial.println("Payload: " + payload);

      return { httpResponseCode, payload };
      
  } else {
      
      Serial.print("Falha na requisição HTTP. Código de erro: ");
      Serial.println(httpResponseCode);

      return { -1, "FETCH_LIBRARY_ERROR" };
  }
}
