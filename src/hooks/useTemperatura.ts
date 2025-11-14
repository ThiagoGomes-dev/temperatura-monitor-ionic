import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { TemperaturaResponse } from '../types/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://10.199.43.182' 
  : 'http://10.199.43.182';

export const useTemperatura = () => {
  const [temperaturaAtual, setTemperaturaAtual] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [conectado, setConectado] = useState<boolean>(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  const gerarTemperaturaAleatoria = (): number => {
    return Math.round((Math.random() * 15 + 20) * 10) / 10;
  };

  const obterTemperatura = useCallback(async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    
    try {
      const response = await axios.get<TemperaturaResponse>(
        `${API_BASE_URL}/temperatura`,
        { timeout: 5000 }
      );
      
      setTemperaturaAtual(response.data.temperatura);
      setConectado(true);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      const tempSimulada = gerarTemperaturaAleatoria();
      setTemperaturaAtual(tempSimulada);
      setConectado(false);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      setErro('Usando dados simulados - API não disponível');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Função para testar conexão com ESP8266
  const testarConexao = useCallback(async (ip: string, porta: string): Promise<boolean> => {
    try {
      const url = `http://${ip}:${porta}/status`;
      const response = await axios.get(url, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }, []);

  // Monitoramento automático
  useEffect(() => {
    obterTemperatura();

    const intervalo = setInterval(() => {
      obterTemperatura();
    }, 5000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

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