import { Storage } from '@ionic/storage';
import { useEffect, useState, useCallback, useRef } from 'react';
import { TemperaturaRegistro } from '../types/types';

export const useStorage = () => {
  const [storage, setStorage] = useState<Storage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const storageRef = useRef<Storage | null>(null);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    const inicializar = async () => {
      if (initializationAttempted.current) return;
      
      initializationAttempted.current = true;
      
      try {
        const novoStorage = new Storage();
        const storageInicializado = await novoStorage.create();
        
        storageRef.current = storageInicializado;
        setStorage(storageInicializado);
        setIsInitialized(true);
      } catch (error) {
        // Usar localStorage como backup
        const backupStorage = {
          async get(chave: string) {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
          },
          async set(chave: string, valor: any) {
            localStorage.setItem(chave, JSON.stringify(valor));
          }
        };
        
        storageRef.current = backupStorage as any;
        setStorage(backupStorage as any);
        setIsInitialized(true);
      }
    };

    if (!isInitialized && !initializationAttempted.current) {
      inicializar();
    }
  }, []);

  const salvarTemperatura = useCallback(async (temperatura: number): Promise<void> => {
    console.log('=== salvarTemperatura CHAMADA ===');
    console.log('Temperatura recebida:', temperatura);
    
    const currentStorage = storageRef.current;
    console.log('Storage atual:', currentStorage);
    
    if (!currentStorage) {
      console.error('Storage não inicializado');
      throw new Error('Storage não está disponível');
    }

    try {
      const agora = new Date();
      const registro: TemperaturaRegistro = {
        temperatura: temperatura,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        dia: agora.getDate(),
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear(),
        timestamp: agora.getTime()
      };
      
      console.log('Registro criado:', registro);

      // Obter registros existentes
      console.log('Obtendo registros existentes...');
      const registrosExistentes = await currentStorage.get('temperaturas') || [];
      console.log('Registros existentes:', registrosExistentes);
      
      const novosRegistros = [...registrosExistentes, registro];
      console.log('Novos registros (total):', novosRegistros.length);
      
      // Salvar no storage
      console.log('Salvando no storage...');
      await currentStorage.set('temperaturas', novosRegistros);
      console.log('Salvo com sucesso!');
      
      console.log('Temperatura salva:', registro);
      console.log('=== salvarTemperatura CONCLUÍDA ===');
    } catch (error) {
      console.error('Erro ao salvar temperatura:', error);
      console.error('Stack trace:', error);
      throw error;
    }
  }, []);

  const obterHistorico = useCallback(async (): Promise<TemperaturaRegistro[]> => {
    const currentStorage = storageRef.current;
    if (!currentStorage) return [];
    
    try {
      const registros = await currentStorage.get('temperaturas');
      return registros || [];
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return [];
    }
  }, []);

  const limparHistorico = useCallback(async (): Promise<void> => {
    const currentStorage = storageRef.current;
    if (!currentStorage) return;
    
    try {
      await currentStorage.set('temperaturas', []);
      console.log('Histórico limpo');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      throw error;
    }
  }, []);

  const obterUltimaTemperatura = useCallback(async (): Promise<TemperaturaRegistro | null> => {
    try {
      const registros = await obterHistorico();
      return registros.length > 0 ? registros[registros.length - 1] : null;
    } catch (error) {
      console.error('Erro ao obter última temperatura:', error);
      return null;
    }
  }, [obterHistorico]);

  return {
    storage,
    isInitialized,
    salvarTemperatura,
    obterHistorico,
    limparHistorico,
    obterUltimaTemperatura
  };
};