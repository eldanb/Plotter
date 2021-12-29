#include <ESP8266WiFi.h>
#include <string>


static WiFiServer server(5500);

void netInit() {
  Serial.println("Trying to connect");

  WiFi.persistent(false);
  WiFi.mode(WIFI_OFF);   // this is a temporary line, to be removed after SDK update to 1.5.4
  WiFi.mode(WIFI_STA);
  WiFi.begin("tazmania3", "califragi");

  bool ledStat = false;
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(125);
    ledStat = !ledStat;
    digitalWrite(BUILTIN_LED, ledStat);
  }

  Serial.println("Local IP ");
  Serial.println(WiFi.localIP().toString());

  server.begin();
  Serial.println("Listening");
}


std::string netWaitForJob() {
    std::string s;
    s.reserve(32768);
    WiFiClient client;

    while(!(client = server.available())) {
      yield();
    }

    if(client) {
        Serial.println("Client connected. Reading data");
        while(client.connected()) {
            if(client.available()) {
                s += client.read();
            }
        }

        Serial.println("Client disconnected.");
        client.stop();
    }

    return s;
}