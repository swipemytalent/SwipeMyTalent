import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchUserExchanges, Exchange, confirmExchange, completeExchange, fetchExchangeRating } from '../../api/exchangesApi';
import '../../styles/RecentActivityCard.scss';
import RatingModal from '../RatingModal/RatingModal';

const RecentActivityCard = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [exchangeRating, setExchangeRating] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      fetchUserExchanges()
        .then(data => {
          setExchanges(data.slice(0, 5));
          setLoading(false);
        })
        .catch(() => {
          setError('Erreur lors du chargement des échanges');
          setLoading(false);
        });
    };

    fetchData();
    
    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedExchange) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [selectedExchange]);

  useEffect(() => {
    if (selectedExchange && selectedExchange.status === 'completed') {
      fetchExchangeRating(selectedExchange.id)
        .then(setExchangeRating)
        .catch(() => setExchangeRating(null));
    } else {
      setExchangeRating(null);
    }
  }, [selectedExchange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#b8860b';
      case 'confirmed': return '#1976d2';
      case 'completed': return '#388e3c';
      case 'cancelled': return '#d32f2f';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirm = async () => {
    if (!selectedExchange) return;
    setIsUpdating(true);
    setErrorAction(null);
    try {
      await confirmExchange(selectedExchange.id);

      const data = await fetchUserExchanges();
      setExchanges(data.slice(0, 5));

      setSelectedExchange(data.find((ex: Exchange) => ex.id === selectedExchange.id) || null);
    } catch (err) {
      setErrorAction("Erreur lors de la confirmation");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedExchange) return;
    setIsUpdating(true);
    setErrorAction(null);
    try {
      await completeExchange(selectedExchange.id);
      const data = await fetchUserExchanges();
      setExchanges(data.slice(0, 5));
      setSelectedExchange(data.find((ex: Exchange) => ex.id === selectedExchange.id) || null);
    } catch (err) {
      setErrorAction("Erreur lors de la finalisation");
    } finally {
      setIsUpdating(false);
    }
  };

  const canConfirm = selectedExchange && selectedExchange.status === 'pending' &&
    ((selectedExchange.isInitiator && !selectedExchange.initiator_confirmed) ||
     (!selectedExchange.isInitiator && !selectedExchange.recipient_confirmed));
  const canComplete = selectedExchange && selectedExchange.status === 'confirmed';
  const canRate = selectedExchange && selectedExchange.status === 'completed' && !exchangeRating;

  return (
    <section className="dashboard__card recent-activity-card">
      <h2>Activité récente</h2>
      {loading ? (
        <div className="recent-activity-card__empty">Chargement...</div>
      ) : error ? (
        <div className="recent-activity-card__empty">{error}</div>
      ) : exchanges.length === 0 ? (
        <div className="recent-activity-card__empty">Aucune activité récente.</div>
      ) : (
        <ul className="recent-activity-list">
          {exchanges.map((ex) => (
            <li key={ex.id} className="recent-activity-item" onClick={() => setSelectedExchange(ex)}>
              <span className="recent-activity-title">
                {ex.isInitiator ? 'Échange demandé avec ' : 'Échange reçu de '}
                <b>{ex.isInitiator ? ex.recipient.firstName : ex.initiator.firstName}</b>
              </span>
              <span 
                className="recent-activity-status"
                style={{ color: getStatusColor(ex.status) }}
              >
                {getStatusText(ex.status)}
              </span>
              <span className="recent-activity-date">{new Date(ex.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Modale de détail d'échange */}
      {selectedExchange && createPortal(
        <div 
          className="recent-activity-modal" 
          onClick={() => setSelectedExchange(null)}
        >
          <div 
            className="recent-activity-modal__content" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="recent-activity-modal__close" 
              onClick={() => setSelectedExchange(null)}
            >
              &times;
            </button>
            
            <div className="exchange-detail">
              <div className="exchange-detail__header">
                <h3>Détail de l'échange</h3>
                <div 
                  className="exchange-detail__status"
                  style={{ 
                    backgroundColor: getStatusColor(selectedExchange.status) + '20',
                    color: getStatusColor(selectedExchange.status),
                    border: `1px solid ${getStatusColor(selectedExchange.status)}`
                  }}
                >
                  {getStatusText(selectedExchange.status)}
                </div>
              </div>

              <div className="exchange-detail__content">
                <div className="exchange-detail__section">
                  <h4>👤 Participant</h4>
                  <p className="exchange-detail__participant">
                    {selectedExchange.isInitiator 
                      ? `${selectedExchange.recipient.firstName} ${selectedExchange.recipient.lastName}`
                      : `${selectedExchange.initiator.firstName} ${selectedExchange.initiator.lastName}`
                    }
                  </p>
                </div>

                <div className="exchange-detail__section">
                  <h4>📝 Description</h4>
                  <p className="exchange-detail__description">
                    {selectedExchange.description || 'Aucune description fournie'}
                  </p>
                </div>

                <div className="exchange-detail__section">
                  <h4>📅 Dates</h4>
                  <div className="exchange-detail__dates">
                    <p><strong>Créé le :</strong> {formatDate(selectedExchange.created_at)}</p>
                    {selectedExchange.completed_at && (
                      <p><strong>Terminé le :</strong> {formatDate(selectedExchange.completed_at)}</p>
                    )}
                  </div>
                </div>

                {/* Actions selon le statut */}
                {errorAction && <div style={{color:'red',marginBottom:8}}>{errorAction}</div>}
                {canConfirm && (
                  <button className="btn btn--primary" onClick={handleConfirm} disabled={isUpdating}>
                    {isUpdating ? 'Confirmation...' : 'Confirmer l\'échange'}
                  </button>
                )}
                {canComplete && (
                  <button className="btn btn--success" onClick={handleComplete} disabled={isUpdating}>
                    {isUpdating ? 'Finalisation...' : 'Marquer comme terminé'}
                  </button>
                )}
                {canRate && (
                  <button className="btn btn--success" onClick={async ()=>{
                    // Rafraîchir les données avant d'ouvrir la modale
                    try {
                      const data = await fetchUserExchanges();
                      setExchanges(data.slice(0, 5));
                      const updatedExchange = data.find((ex: Exchange) => ex.id === selectedExchange.id) || null;
                      setSelectedExchange(updatedExchange);
                      
                      if (updatedExchange && updatedExchange.status === 'completed') {
                        const rating = await fetchExchangeRating(updatedExchange.id);
                        setExchangeRating(rating);
                      }
                    } catch (error) {
                      
                    }
                    setIsRatingModalOpen(true);
                  }}>
                    ⭐ Laisser un avis
                  </button>
                )}
                {selectedExchange.status === 'completed' && (
                  <div className="exchange-detail__section">
                    <h4>⭐ Évaluation</h4>
                    <p className="exchange-detail__rating">
                      {exchangeRating && exchangeRating.rating ? (
                        <span>Votre note : {exchangeRating.rating}/5</span>
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>
                          Vous n'avez pas encore noté cet échange
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Modale d'avis */}
            {isRatingModalOpen && (
              <RatingModal
                isOpen={isRatingModalOpen}
                onClose={()=>setIsRatingModalOpen(false)}
                exchangeId={selectedExchange.id}
                userId={selectedExchange.isInitiator ? selectedExchange.recipient.id : selectedExchange.initiator.id}
                userName={selectedExchange.isInitiator 
                  ? `${selectedExchange.recipient.firstName} ${selectedExchange.recipient.lastName}`
                  : `${selectedExchange.initiator.firstName} ${selectedExchange.initiator.lastName}`
                }
                onRatingSubmitted={async ()=>{
                  setIsRatingModalOpen(false);
                  
                  const data = await fetchUserExchanges();
                  setExchanges(data.slice(0, 5));
                  const updatedExchange = data.find((ex: Exchange) => ex.id === selectedExchange.id) || null;
                  setSelectedExchange(updatedExchange);
                  
                  // Rafraîchir aussi l'évaluation
                  if (updatedExchange && updatedExchange.status === 'completed') {
                    try {
                      const rating = await fetchExchangeRating(updatedExchange.id);
                      setExchangeRating(rating);
                    } catch (error) {
                      setExchangeRating(null);
                    }
                  }
                }}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default RecentActivityCard; 