import React, { useState } from 'react';
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
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonAlert,
  IonToast,
  RefresherEventDetail
} from '@ionic/react';
import {
  thermometerOutline,
  timeOutline,
  calendarOutline,
  trashOutline,
  statsChartOutline
} from 'ionicons/icons';
import { useHistorico } from '../hooks/useHistorico';
import { TemperaturaRegistro } from '../types/types';
import './Tab2.css';

const Tab2: React.FC = () => {
  const { historico, estatisticas, loading, carregarHistorico, limparTodoHistorico } = useHistorico();
  
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await carregarHistorico();
    event.detail.complete();
  };

  const handleLimparHistorico = async () => {
    try {
      await limparTodoHistorico();
      setToastMessage('Histórico limpo com sucesso!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Erro ao limpar histórico');
      setShowToast(true);
    }
  };

  const getTemperaturaClass = (temperatura: number): string => {
    if (temperatura < 18) return 'temperatura-fria';
    if (temperatura >= 18 && temperatura <= 25) return 'temperatura-agradavel';
    if (temperatura > 25 && temperatura <= 30) return 'temperatura-quente';
    return 'temperatura-muito-quente';
  };

  const formatarDataCompleta = (registro: TemperaturaRegistro): string => {
    return `${registro.data} às ${registro.hora}`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Histórico de Temperaturas</IonTitle>
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
            <IonTitle size="large">Histórico</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="container">
          {/* Card de Estatísticas */}
          <IonCard className="stats-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={statsChartOutline} />
                Estatísticas
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{estatisticas.total}</span>
                  <span className="stat-label">Registros</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">{estatisticas.media}°C</span>
                  <span className="stat-label">Média</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">{estatisticas.maxima}°C</span>
                  <span className="stat-label">Máxima</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">{estatisticas.minima}°C</span>
                  <span className="stat-label">Mínima</span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Lista de Registros */}
          {historico.length > 0 ? (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Registros de Temperatura</IonCardTitle>
              </IonCardHeader>
              
              <IonList>
                {historico.map((registro, index) => (
                  <IonItem key={registro.timestamp} className="temperatura-item">
                    <div className="registro-content">
                      <div className="temperatura-info">
                        <span className={`temperatura-valor ${getTemperaturaClass(registro.temperatura)}`}>
                          <IonIcon icon={thermometerOutline} />
                          {registro.temperatura}°C
                        </span>
                      </div>
                      
                      <div className="data-info">
                        <div className="data-item">
                          <IonIcon icon={calendarOutline} />
                          <span>{registro.data}</span>
                        </div>
                        <div className="data-item">
                          <IonIcon icon={timeOutline} />
                          <span>{registro.hora}</span>
                        </div>
                      </div>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            </IonCard>
          ) : (
            /* Mensagem quando não há registros */
            <IonCard className="empty-card">
              <IonCardContent className="empty-content">
                <IonIcon icon={thermometerOutline} className="empty-icon" />
                <h2>Nenhum registro encontrado</h2>
                <p>Vá para a tela inicial e registre algumas temperaturas para visualizar o histórico aqui.</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Botão flutuante para limpar histórico */}
        {historico.length > 0 && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="danger" onClick={() => setShowAlert(true)}>
              <IonIcon icon={trashOutline} />
            </IonFabButton>
          </IonFab>
        )}

        {/* Alert para confirmar limpeza */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Limpar Histórico"
          message="Tem certeza que deseja limpar todo o histórico de temperaturas? Esta ação não pode ser desfeita."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Limpar',
              role: 'destructive',
              handler: handleLimparHistorico
            }
          ]}
        />

        {/* Toast para feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
