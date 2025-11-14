// Monitor de Temperatura - ESP8266 com Termistor
// Projeto: App móvel para monitoramento de temperatura
// Hardware: ESP8266 + Termistor NTC

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// Configuração da rede WiFi
const char* ssid = "Show";
const char* password = "87602325";

// --- CONFIGURAÇÕES DO TERMISTOR ---
const float Vcc_sensor = 5.0;
const float Rfixo = 10000.0;
const float Beta = 3950.0;
const float R0 = 10000.0;
const float T0 = 298.15;
const float adcRefVoltage = 1.0;
const int adcMax = 1023;
const float adcDividerFactor = 3.3 / 1.0;
float calibrationOffset = 0.0;

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
  // Leitura do termistor usando a lógica do professor
  int leituraADC = analogRead(SENSOR_PIN);
  
  // Converte leitura ADC para tensão no pino A0 (Vout)
  float Vadc = ((float)leituraADC / adcMax) * adcRefVoltage;
  float Vout = Vadc * adcDividerFactor;
  
  // Proteção: evitar divisão por zero
  if (Vout <= 0.0001) {
    // Retorna erro em JSON
    String resposta = "{";
    resposta += "\"temperatura\":0,";
    resposta += "\"timestamp\":" + String(millis()) + ",";
    resposta += "\"sensor\":\"Termistor NTC\",";
    resposta += "\"status\":\"ERRO - Sensor desconectado\"";
    resposta += "}";
    
    webServer.sendHeader("Access-Control-Allow-Origin", "*");
    webServer.send(200, "application/json", resposta);
    return;
  }
  
  // Calcula resistência do termistor
  float Rtermistor = Rfixo * (Vcc_sensor / Vout - 1.0);
  
  // Steinhart-Hart simplificada (equação Beta)
  float tempK = 1.0 / ((1.0 / T0) + (1.0 / Beta) * log(Rtermistor / R0));
  float tempC = tempK - 273.15;
  
  // Aplica offset de calibração
  tempC += calibrationOffset;
  
  // Criar resposta JSON com dados do termistor
  String resposta = "{";
  resposta += "\"temperatura\":" + String(tempC, 2) + ",";
  resposta += "\"timestamp\":" + String(millis()) + ",";
  resposta += "\"sensor\":\"Termistor NTC\",";
  resposta += "\"adc\":" + String(leituraADC) + ",";
  resposta += "\"vout\":" + String(Vout, 3) + ",";
  resposta += "\"resistencia\":" + String(Rtermistor, 0) + ",";
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
  // Leitura do termistor para exibição
  int leituraADC = analogRead(SENSOR_PIN);
  float Vadc = ((float)leituraADC / adcMax) * adcRefVoltage;
  float Vout = Vadc * adcDividerFactor;
  
  float temp = 0.0;
  if (Vout > 0.0001) {
    float Rtermistor = Rfixo * (Vcc_sensor / Vout - 1.0);
    float tempK = 1.0 / ((1.0 / T0) + (1.0 / Beta) * log(Rtermistor / R0));
    temp = tempK - 273.15 + calibrationOffset;
  }
  
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
// 3. Conectar termistor NTC no pino A0 (com resistor fixo de 10k)
// 4. Alimentação: 5V (Vcc_sensor = 5.0) ou 3.3V (ajustar Vcc_sensor = 3.3)