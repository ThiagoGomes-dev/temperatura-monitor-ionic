import { useState, useEffect, useCallback } from 'react';
import { TemperaturaRegistro, Estatisticas } from '../types/types';
import { useStorage } from './useStorage';

export const useHistorico = () => {
  const [historico, setHistorico] = useState<TemperaturaRegistro[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    media: 0,
    maxima: 0,
    minima: 0
  });
  const [loading, setLoading] = useState(false);
  
  const { obterHistorico, limparHistorico, isInitialized } = useStorage();

  const calcularEstatisticas = useCallback((registros: TemperaturaRegistro[]): Estatisticas => {
    if (registros.length === 0) {
      return { total: 0, media: 0, maxima: 0, minima: 0 };
    }

    const temperaturas = registros.map(item => item.temperatura);
    
    return {
      total: registros.length,
      media: Math.round((temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length) * 10) / 10,
      maxima: Math.max(...temperaturas),
      minima: Math.min(...temperaturas)
    };
  }, []);

  const carregarHistorico = useCallback(async (): Promise<void> => {
    if (!isInitialized) return;
    
    setLoading(true);
    try {
      const registros = await obterHistorico();
      const registrosOrdenados = registros.sort((a, b) => b.timestamp - a.timestamp);
      
      setHistorico(registrosOrdenados);
      setEstatisticas(calcularEstatisticas(registrosOrdenados));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }, [obterHistorico, calcularEstatisticas, isInitialized]);

  const limparTodoHistorico = useCallback(async (): Promise<void> => {
    if (!isInitialized) return;
    
    try {
      await limparHistorico();
      setHistorico([]);
      setEstatisticas({ total: 0, media: 0, maxima: 0, minima: 0 });
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      throw error;
    }
  }, [limparHistorico, isInitialized]);

  // Carregar histórico apenas quando o storage estiver inicializado
  useEffect(() => {
    if (isInitialized) {
      carregarHistorico();
    }
  }, [isInitialized, carregarHistorico]);

  return {
    historico,
    estatisticas,
    loading,
    carregarHistorico,
    limparTodoHistorico
  };
};