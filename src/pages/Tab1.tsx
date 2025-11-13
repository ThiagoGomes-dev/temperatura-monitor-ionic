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
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonToast,
  RefresherEventDetail
} from '@ionic/react';
import { thermometerOutline, saveOutline, refreshOutline } from 'ionicons/icons';
import { useTemperatura } from '../hooks/useTemperatura';
import { useStorage } from '../hooks/useStorage';
import './Tab1.css';

const Tab1: React.FC = () => {
  const {
    temperaturaAtual,
    carregando,
    conectado,
    ultimaAtualizacao,
    erro,
    obterTemperatura
  } = useTemperatura();

  const { salvarTemperatura, isInitialized } = useStorage();

  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [salvando, setSalvando] = useState(false);

  // Debug do estado dos botões
  useEffect(() => {
    const isButtonDisabled = carregando || salvando || !isInitialized;
    console.log('=== STATUS DO BOTÃO ===');
    console.log('carregando:', carregando);
    console.log('salvando:', salvando);
    console.log('isInitialized:', isInitialized);
    console.log('botão desabilitado:', isButtonDisabled);
    console.log('temperaturaAtual:', temperaturaAtual);
    console.log('========================');
  }, [carregando, salvando, isInitialized, temperaturaAtual]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await obterTemperatura();
    event.detail.complete();
  };

  const handleRegistrarTemperatura = async () => {
    console.log('=== INÍCIO DO REGISTRO ===');
    console.log('isInitialized:', isInitialized);
    console.log('temperaturaAtual:', temperaturaAtual);
    console.log('salvarTemperatura function:', typeof salvarTemperatura);
    
    if (!isInitialized) {
      console.log('Storage não inicializado ainda');
      setToastMessage('Aguarde, inicializando sistema...');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (temperaturaAtual === 0) {
      console.log('Temperatura é 0, obtendo nova temperatura...');
      await obterTemperatura();
      return;
    }

    setSalvando(true);
    try {
      console.log('Tentando salvar temperatura:', temperaturaAtual);
      await salvarTemperatura(temperaturaAtual);
      setToastMessage('Temperatura registrada com sucesso!');
      setToastColor('success');
      setShowToast(true);
      console.log('Temperatura salva com sucesso');
    } catch (error) {
      console.error('Erro ao registrar temperatura:', error);
      console.error('Detalhes do erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setToastMessage(`Erro: ${errorMessage}`);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setSalvando(false);
      console.log('=== FIM DO REGISTRO ===');
    }
  };

  const getTemperaturaClass = (): string => {
    if (temperaturaAtual < 18) return 'temperatura-fria';
    if (temperaturaAtual >= 18 && temperaturaAtual <= 25) return 'temperatura-agradavel';
    if (temperaturaAtual > 25 && temperaturaAtual <= 30) return 'temperatura-quente';
    return 'temperatura-muito-quente';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Monitor de Temperatura</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            pullingText="Puxe para atualizar"
            refreshingSpinner="circles"
            refreshingText="Atualizando..."
          />
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Monitor de Temperatura</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="container">
          {/* Card principal da temperatura */}
          <IonCard className="temperatura-card">
            <IonCardHeader>
              <IonCardTitle className="temperatura-title">
                <IonIcon icon={thermometerOutline} className="temperatura-icon" />
                Temperatura Atual
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent className="temperatura-content">
              <div className={`temperatura-display ${getTemperaturaClass()}`}>
                {carregando ? (
                  <IonSpinner name="circles" />
                ) : (
                  <span className="temperatura-valor">{temperaturaAtual}°C</span>
                )}
              </div>
              
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${conectado ? 'conectado' : 'desconectado'}`}>
                    {conectado ? 'Conectado' : 'Simulado'}
                  </span>
                </div>

                <div className="status-item">
                  <span className="status-label">Storage:</span>
                  <span className={`status-value ${isInitialized ? 'conectado' : 'desconectado'}`}>
                    {isInitialized ? 'Pronto' : 'Inicializando...'}
                  </span>
                </div>
                
                {ultimaAtualizacao && (
                  <div className="status-item">
                    <span className="status-label">Última atualização:</span>
                    <span className="status-value">{ultimaAtualizacao}</span>
                  </div>
                )}

                {erro && (
                  <div className="status-item">
                    <span className="status-label">Info:</span>
                    <span className="status-value warning">{erro}</span>
                  </div>
                )}

                {/* Debug info */}
                <div className="status-item">
                  <span className="status-label">Debug:</span>
                  <span className="status-value">
                    Carregando: {carregando ? 'SIM' : 'NÃO'} | 
                    Salvando: {salvando ? 'SIM' : 'NÃO'} | 
                    Storage: {isInitialized ? 'OK' : 'ERRO'}
                  </span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Botões de ação */}
          <div className="action-buttons">
            <IonButton 
              expand="block" 
              onClick={() => setShowAlert(true)}
              disabled={carregando || salvando || !isInitialized}
              className="register-button"
            >
              <IonIcon icon={saveOutline} slot="start" />
              {salvando ? 'Salvando...' : 'Registrar Temperatura'}
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={obterTemperatura}
              disabled={carregando || salvando}
              className="refresh-button"
            >
              <IonIcon icon={refreshOutline} slot="start" />
              Atualizar Manualmente
            </IonButton>
          </div>

          {/* Card de informações */}
          <IonCard className="info-card">
            <IonCardHeader>
              <IonCardTitle>Informações</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>• A temperatura é atualizada automaticamente a cada 5 segundos</p>
              <p>• Puxe para baixo para atualizar manualmente</p>
              <p>• Use o botão "Registrar" para salvar a temperatura atual</p>
              <p>• {conectado ? 'Conectado ao sensor ESP8266' : 'Usando dados simulados para teste'}</p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Alert para confirmar registro */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Registrar Temperatura"
          message={`Deseja registrar a temperatura atual de ${temperaturaAtual}°C?`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Registrar',
              handler: handleRegistrarTemperatura
            }
          ]}
        />

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

export default Tab1;
