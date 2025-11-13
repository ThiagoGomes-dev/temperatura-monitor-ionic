# 🌡️ Monitor de Temperatura IoT

**App mobile Ionic React** para monitoramento de temperatura com **ESP8266** + **DS18B20**

## ⚡ INÍCIO RÁPIDO

### 1️⃣ Clonar e instalar

**Opção A - Script automático:**
```bash
git clone [URL-DO-REPOSITORIO]
cd temperatura-monitor
./setup.sh
```

**Opção B - Manual:**
```bash
git clone [URL-DO-REPOSITORIO]
cd temperatura-monitor
npm install
```

### 2️⃣ Rodar o projeto (2 terminais)

**Terminal 1 - App:**
```bash
npm run dev
# ou: npm start
```

**Terminal 2 - API Mock:**
```bash
npm run mock
# ou: node mock-api.js
```

### 3️⃣ Acessar
- **App**: http://localhost:5173
- **API**: http://localhost:3001/temperatura

---

## 📋 Pré-requisitos

- **Node.js** 18+ ([baixar aqui](https://nodejs.org/))
- **Git** para clonar o repositório

## 🎯 Funcionalidades

✅ Monitoramento em tempo real  
✅ Registro manual de temperaturas  
✅ Histórico com estatísticas  
✅ Persistência local (Ionic Storage)  
✅ Configuração de hardware ESP8266  
✅ API mock para testes

## 📱 Como usar o app

1. **Tab 1 - Monitoramento**: Ver temperatura atual e registrar
2. **Tab 2 - Histórico**: Ver temperaturas salvas e estatísticas
3. **Tab 3 - Configurações**: Configurar IP do ESP8266

---

## 🔧 Hardware ESP8266 (Opcional)

### Arquivo: `arduino-codigo-completo.ino`

1. **Abrir no Arduino IDE**
2. **Alterar WiFi** (linhas 11-12):
   ```cpp
   const char* ssid = "SUA_REDE";
   const char* password = "SUA_SENHA";
   ```
3. **Instalar bibliotecas**: OneWire, DallasTemperature, ArduinoJson
4. **Carregar no ESP8266**
5. **Anotar o IP** do Serial Monitor
6. **Configurar no app** (Tab 3)

### Ligações:
```
ESP8266    DS18B20
-------    -------
3.3V   --> VCC
GND    --> GND
D2     --> DATA (com resistor 4.7kΩ para 3.3V)
```

---

## 🛠️ Tecnologias

- **Frontend**: Ionic 8 + React 18 + TypeScript
- **Storage**: Ionic Storage + localStorage
- **API**: Node.js + Express (mock)
- **Hardware**: ESP8266 + DS18B20

## 📂 Estrutura do Projeto

```
├── src/
│   ├── hooks/           # Lógica de negócio
│   ├── pages/           # Telas do app
│   └── types/           # Interfaces TypeScript
├── mock-api.js          # Servidor de teste
└── arduino-codigo-completo.ino  # Firmware ESP8266
```

---

## 🚨 Solução de Problemas

### App não carrega:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Mock API não funciona:
```bash
npm install express cors
node mock-api.js
```

### Storage não inicializa:
- O app usa fallback automático para localStorage
- Funciona em qualquer navegador moderno

---

**✅ Projeto pronto para uso e demonstração**

**Desenvolvido com Ionic React + TypeScript + ESP8266**