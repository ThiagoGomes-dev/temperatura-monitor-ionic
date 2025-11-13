import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simula leituras de temperatura do ESP8266
let temperaturaAtual = 25.5;

// Endpoint para obter temperatura
app.get('/temperatura', (req, res) => {
  // Simula variação de temperatura
  temperaturaAtual = 20 + Math.random() * 15; // Entre 20°C e 35°C
  
  console.log(`📡 Temperatura solicitada: ${temperaturaAtual.toFixed(1)}°C`);
  
  res.json({
    temperatura: parseFloat(temperaturaAtual.toFixed(1)),
    timestamp: new Date().toISOString(),
    sensor: 'DS18B20',
    status: 'OK'
  });
});

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    sensor: 'DS18B20'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API ESP8266 rodando em http://localhost:${PORT}`);
  console.log(`📊 Simulando sensor DS18B20 com temperaturas aleatórias`);
});