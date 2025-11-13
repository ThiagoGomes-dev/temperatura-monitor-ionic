// Monitor de Temperatura - ESP8266
// Projeto: App móvel para monitoramento de temperatura
// Hardware: ESP8266 + Sensor DS18B20

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// Configuração da rede WiFi
const char* ssid = "Show";
const char* password = "87602325";

// Pinos do sensor
#define SENSOR_PIN 4  // GPIO4 (D2)
OneWire oneWire(SENSOR_PIN);
DallasTemperature ds18b20(&oneWire);

ESP8266WebServer webServer(80);

void setup() {
  Serial.begin(115200);
  ds18b20.begin();
  
  // Conectar à rede WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  // Configurar endpoints da API
  webServer.enableCORS(true);
  webServer.on("/temperatura", HTTP_GET, obterTemperatura);
  webServer.on("/status", HTTP_GET, obterStatus);
  webServer.on("/", HTTP_GET, paginaInicial);
  
  webServer.begin();
  Serial.println("Servidor inicializado");
}

void loop() {
  webServer.handleClient();
}

void obterTemperatura() {
  ds18b20.requestTemperatures();
  float temp = ds18b20.getTempCByIndex(0);
  
  if (temp == DEVICE_DISCONNECTED_C) {
    temp = 25.0; // fallback
  }
  
  DynamicJsonDocument json(200);
  json["temperatura"] = temp;
  json["timestamp"] = millis();
  json["sensor"] = "DS18B20";
  json["status"] = "OK";
  
  String resposta;
  serializeJson(json, resposta);
  
  webServer.sendHeader("Access-Control-Allow-Origin", "*");
  webServer.send(200, "application/json", resposta);
}

void obterStatus() {
  DynamicJsonDocument json(250);
  json["status"] = "ESP8266 Online";
  json["uptime"] = millis() / 1000;
  json["ip"] = WiFi.localIP().toString();
  
  String resposta;
  serializeJson(json, resposta);
  
  webServer.sendHeader("Access-Control-Allow-Origin", "*");
  webServer.send(200, "application/json", resposta);
}

void paginaInicial() {
  ds18b20.requestTemperatures();
  float temp = ds18b20.getTempCByIndex(0);
  
  String html = "<!DOCTYPE html><html><head>";
  html += "<title>Monitor ESP8266</title>";
  html += "<meta charset='UTF-8'>";
  html += "</head><body>";
  html += "<h1>Monitor de Temperatura</h1>";
  html += "<h2>Temperatura: " + String(temp, 1) + "°C</h2>";
  html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
  html += "<p>Endpoints: /temperatura, /status</p>";
  html += "</body></html>";
  
  webServer.send(200, "text/html", html);
}

// Configuração:
// 1. Alterar ssid e password
// 2. Instalar bibliotecas: OneWire, DallasTemperature, ArduinoJson
// 3. Conectar DS18B20: VCC->3.3V, GND->GND, DATA->D2 (com resistor 4.7k)