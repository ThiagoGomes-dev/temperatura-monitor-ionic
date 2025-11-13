import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
  IonToggle,
  IonToast
} from '@ionic/react';
import {
  wifiOutline,
  saveOutline,
  informationCircleOutline,
  hardwareChipOutline,
  timeOutline
} from 'ionicons/icons';
import { useTemperatura } from '../hooks/useTemperatura';
import './Tab3.css';

interface Configuracoes {
  esp8266Ip: string;
  esp8266Port: string;
  intervaloAtualizacao: number;
  usarMock: boolean;
  autoRegistrar: boolean;
}

const Tab3: React.FC = () => {
  const { testarConexao } = useTemperatura();

  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    esp8266Ip: '192.168.1.100',
    esp8266Port: '80',
    intervaloAtualizacao: 5000,
    usarMock: true,
    autoRegistrar: false
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'primary' | 'warning'>('success');

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = () => {
    const configSalvas = localStorage.getItem('temperatura-config');
    if (configSalvas) {
      setConfiguracoes({ ...configuracoes, ...JSON.parse(configSalvas) });
    }
  };

  const salvarConfiguracoes = () => {
    try {
      localStorage.setItem('temperatura-config', JSON.stringify(configuracoes));
      mostrarToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      mostrarToast('Erro ao salvar configurações', 'danger');
    }
  };

  const testarConexaoESP8266 = async () => {
    mostrarToast('Testando conexão...', 'primary');
    
    try {
      const sucesso = await testarConexao(configuracoes.esp8266Ip, configuracoes.esp8266Port);
      
      if (sucesso) {
        mostrarToast('Conexão estabelecida com sucesso!', 'success');
      } else {
        mostrarToast('Erro: Não foi possível conectar ao ESP8266', 'danger');
      }
    } catch (error) {
      mostrarToast('Erro ao testar conexão', 'danger');
    }
  };

  const resetarConfiguracoes = () => {
    setConfiguracoes({
      esp8266Ip: '192.168.1.100',
      esp8266Port: '80',
      intervaloAtualizacao: 5000,
      usarMock: true,
      autoRegistrar: false
    });
    mostrarToast('Configurações resetadas para o padrão', 'warning');
  };

  const mostrarToast = (message: string, color: 'success' | 'danger' | 'primary' | 'warning') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getUrlCompleta = (): string => {
    return `http://${configuracoes.esp8266Ip}:${configuracoes.esp8266Port}/temperatura`;
  };

  const updateConfig = (key: keyof Configuracoes, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Configurações</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Configurações</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="container">
          {/* Configurações do ESP8266 */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={hardwareChipOutline} />
                ESP8266 - Sensor de Temperatura
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Endereço IP do ESP8266</IonLabel>
                  <IonInput
                    value={configuracoes.esp8266Ip}
                    placeholder="192.168.1.100"
                    type="text"
                    onIonInput={(e) => updateConfig('esp8266Ip', e.detail.value!)}
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Porta</IonLabel>
                  <IonInput
                    value={configuracoes.esp8266Port}
                    placeholder="80"
                    type="number"
                    onIonInput={(e) => updateConfig('esp8266Port', e.detail.value!)}
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>URL de Conexão</h3>
                    <p>{getUrlCompleta()}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
              
              <div className="button-container">
                <IonButton expand="block" fill="outline" onClick={testarConexaoESP8266}>
                  <IonIcon icon={wifiOutline} slot="start" />
                  Testar Conexão
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Configurações de Monitoramento */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={timeOutline} />
                Monitoramento
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Intervalo de Atualização (ms)</IonLabel>
                  <IonInput
                    value={configuracoes.intervaloAtualizacao}
                    placeholder="5000"
                    type="number"
                    min={1000}
                    max={60000}
                    onIonInput={(e) => updateConfig('intervaloAtualizacao', parseInt(e.detail.value!, 10))}
                  />
                  <IonNote slot="helper">Entre 1 e 60 segundos</IonNote>
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>Usar dados simulados</h3>
                    <p>Ativar para testes sem ESP8266</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={configuracoes.usarMock}
                    onIonChange={(e) => updateConfig('usarMock', e.detail.checked)}
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>Auto-registrar temperaturas</h3>
                    <p>Salvar automaticamente a cada leitura</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={configuracoes.autoRegistrar}
                    onIonChange={(e) => updateConfig('autoRegistrar', e.detail.checked)}
                  />
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Informações do Sistema */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={informationCircleOutline} />
                Informações do Sistema
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h3>Versão do App</h3>
                    <p>1.0.0</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>Plataforma</h3>
                    <p>Ionic React</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>Sobre</h3>
                    <p>Aplicativo para monitoramento de temperatura com ESP8266</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Botões de Ação */}
          <div className="action-buttons">
            <IonButton 
              expand="block" 
              onClick={salvarConfiguracoes}
              className="save-button"
            >
              <IonIcon icon={saveOutline} slot="start" />
              Salvar Configurações
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="outline" 
              color="warning"
              onClick={resetarConfiguracoes}
              className="reset-button"
            >
              Resetar para Padrão
            </IonButton>
          </div>
        </div>

        {/* Toast para feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
