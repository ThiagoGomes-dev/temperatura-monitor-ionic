import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { TemperaturaResponse } from '../types/types';

// Configuração da API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://192.168.1.100' 
  : 'http://localhost:3001';

export const useTemperatura = () => {
  const [temperaturaAtual, setTemperaturaAtual] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [conectado, setConectado] = useState<boolean>(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  // Função para gerar temperatura aleatória (fallback)
  const gerarTemperaturaAleatoria = (): number => {
    return Math.round((Math.random() * 15 + 20) * 10) / 10; // Entre 20°C e 35°C
  };

  // Função para obter temperatura da API
  const obterTemperatura = useCallback(async (): Promise<void> => {
    console.log('=== OBTENDO TEMPERATURA ===');
    console.log('URL da API:', `${API_BASE_URL}/temperatura`);
    setCarregando(true);
    setErro('');
    
    try {
      const response = await axios.get<TemperaturaResponse>(
        `${API_BASE_URL}/temperatura`,
        { timeout: 5000 }
      );
      
      console.log('✅ RESPOSTA COMPLETA DA API:');
      console.log('Status HTTP:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data (JSON):', response.data);
      console.log('Temperatura recebida:', response.data.temperatura);
      
      setTemperaturaAtual(response.data.temperatura);
      setConectado(true);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      console.log('Temperatura obtida com sucesso:', response.data.temperatura);
    } catch (error) {
      console.log('Erro na API, usando temperatura simulada:', error);
      
      // Fallback para temperatura simulada
      const tempSimulada = gerarTemperaturaAleatoria();
      setTemperaturaAtual(tempSimulada);
      setConectado(false);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      setErro('Usando dados simulados - API não disponível');
    } finally {
      setCarregando(false);
      console.log('=== FIM OBTER TEMPERATURA ===');
    }
  }, []);

  // Função para testar conexão com ESP8266
  const testarConexao = useCallback(async (ip: string, porta: string): Promise<boolean> => {
    try {
      const url = `http://${ip}:${porta}/status`;
      console.log('🔍 Testando conexão:', url);
      const response = await axios.get(url, { timeout: 3000 });
      console.log('✅ Resposta do teste:', response.data);
      return response.status === 200;
    } catch (error) {
      console.log('❌ Erro no teste de conexão:', error);
      return false;
    }
  }, []);

  // Monitoramento automático
  useEffect(() => {
    // Primeira leitura
    obterTemperatura();

    // Configurar intervalo para atualizações automáticas
    const intervalo = setInterval(() => {
      obterTemperatura();
    }, 5000); // A cada 5 segundos

    return () => {
      clearInterval(intervalo);
    };
  }, []); // Remover dependência para evitar loop

  return {
    temperaturaAtual,
    carregando,
    conectado,
    ultimaAtualizacao,
    erro,
    obterTemperatura,
    testarConexao,
    gerarTemperaturaAleatoria
  };
};