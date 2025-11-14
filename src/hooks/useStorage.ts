import { useEffect, useState, useCallback, useRef } from 'react';
import { TemperaturaRegistro } from '../types/types';

interface SimpleStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

export const useStorage = () => {
  const [storage, setStorage] = useState<SimpleStorage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const storageRef = useRef<SimpleStorage | null>(null);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    const inicializar = () => {
      if (initializationAttempted.current) return;
      
      initializationAttempted.current = true;
      
      try {
        const simpleStorage: SimpleStorage = {
          async get(chave: string) {
            const chaveCompleta = `temp-monitor-${chave}`;
            try {
              const dados = localStorage.getItem(chaveCompleta);
              return dados ? JSON.parse(dados) : null;
            } catch (e) {
              return null;
            }
          },
          async set(chave: string, valor: any) {
            const chaveCompleta = `temp-monitor-${chave}`;
            try {
              const dadosString = JSON.stringify(valor);
              localStorage.setItem(chaveCompleta, dadosString);
              return Promise.resolve();
            } catch (e) {
              throw new Error('Falha ao salvar dados: ' + (e instanceof Error ? e.message : 'erro desconhecido'));
            }
          }
        };
        
        localStorage.setItem('temp-monitor-test', 'ok');
        const testResult = localStorage.getItem('temp-monitor-test');
        
        if (testResult === 'ok') {
          localStorage.removeItem('temp-monitor-test');
          storageRef.current = simpleStorage;
          setStorage(simpleStorage);
          setIsInitialized(true);
        } else {
          throw new Error('Teste do localStorage falhou');
        }
        
      } catch (error) {
        setIsInitialized(false);
      }
    };

    inicializar();
  }, []);

  const salvarTemperatura = useCallback(async (temperatura: number): Promise<void> => {
    if (!storageRef.current) {
      throw new Error('Sistema de armazenamento não está pronto. Aguarde alguns segundos e tente novamente.');
    }

    const currentStorage = storageRef.current;

    try {
      const agora = new Date();
      const registro: TemperaturaRegistro = {
        temperatura: Number(temperatura),
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        dia: agora.getDate(),
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear(),
        timestamp: agora.getTime()
      };

      let registrosExistentes = [];
      
      try {
        const dadosSalvos = await currentStorage.get('temperaturas');
        registrosExistentes = Array.isArray(dadosSalvos) ? dadosSalvos : [];
      } catch (getError) {
        registrosExistentes = [];
      }
      
      const novosRegistros = [...registrosExistentes, registro];
      
      await currentStorage.set('temperaturas', novosRegistros);
      
      const evento = new CustomEvent('temperaturaRegistrada', { 
        detail: { registros: novosRegistros.length, novoRegistro: registro }
      });
      window.dispatchEvent(evento);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
      throw new Error(`Falha ao salvar: ${errorMessage}`);
    }
  }, []);

  const obterHistorico = useCallback(async (): Promise<TemperaturaRegistro[]> => {
    const currentStorage = storageRef.current;
    if (!currentStorage) return [];
    
    try {
      const registros = await currentStorage.get('temperaturas');
      return registros || [];
    } catch (error) {
      return [];
    }
  }, []);

  const limparHistorico = useCallback(async (): Promise<void> => {
    const currentStorage = storageRef.current;
    if (!currentStorage) return;
    
    try {
      await currentStorage.set('temperaturas', []);
    } catch (error) {
      throw error;
    }
  }, []);

  const obterUltimaTemperatura = useCallback(async (): Promise<TemperaturaRegistro | null> => {
    const currentStorage = storageRef.current;
    if (!currentStorage) return null;
    
    try {
      const registros = await currentStorage.get('temperaturas');
      const historicoArray = registros || [];
      return historicoArray.length > 0 ? historicoArray[historicoArray.length - 1] : null;
    } catch (error) {
      return null;
    }
  }, []);

  return {
    storage,
    isInitialized,
    salvarTemperatura,
    obterHistorico,
    limparHistorico,
    obterUltimaTemperatura
  };
};