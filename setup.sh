#!/bin/bash

# Script de inicialização rápida do projeto
echo "🚀 Iniciando Monitor de Temperatura IoT..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Baixe em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Instalar dependências do mock
echo "🔧 Configurando API mock..."
npm install express cors

echo ""
echo "🎉 Projeto configurado com sucesso!"
echo ""
echo "📋 Para rodar o projeto:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: npm run mock"
echo ""
echo "🌐 URLs:"
echo "   App: http://localhost:5173"
echo "   API: http://localhost:3001"
echo ""