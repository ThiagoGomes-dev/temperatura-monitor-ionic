// Monitor de Temperatura - ESP8266
// Projeto: App móvel para monitoramento de temperatura
// Hardware: ESP8266 + Sensor Analógico

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// Configuração da rede WiFi
const char* ssid = "Show";
const char* password = "87602325";

#define SENSOR_PIN A0

ESP8266WebServer webServer(80);

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  
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
  // Leitura analógica do sensor (0-1024)
  int leituraAnalogica = analogRead(SENSOR_PIN);
  
  // Fórmula: temperatura = (leitura * 3.3V / 1024) * 100°C
  float temp = (leituraAnalogica * 3.3 / 1024.0) * 100.0;
  
  // Criar resposta JSON manualmente
  String resposta = "{";
  resposta += "\"temperatura\":" + String(temp, 1) + ",";
  resposta += "\"timestamp\":" + String(millis()) + ",";
  resposta += "\"sensor\":\"Analogico\",";
  resposta += "\"status\":\"OK\"";
  resposta += "}";
  
  webServer.sendHeader("Access-Control-Allow-Origin", "*");
  webServer.send(200, "application/json", resposta);
}

void obterStatus() {
  String resposta = "{";
  resposta += "\"status\":\"ESP8266 Online\",";
  resposta += "\"uptime\":" + String(millis() / 1000) + ",";
  resposta += "\"ip\":\"" + WiFi.localIP().toString() + "\"";
  resposta += "}";
  
  webServer.sendHeader("Access-Control-Allow-Origin", "*");
  webServer.send(200, "application/json", resposta);
}

void paginaInicial() {
  // Leitura analógica e conversão
  int leituraAnalogica = analogRead(SENSOR_PIN);
  float temp = (leituraAnalogica * 3.3 / 1024.0) * 100.0;
  
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
// 2. Não precisa instalar bibliotecas extras!
// 3. Conectar sensor analógico no pino A0