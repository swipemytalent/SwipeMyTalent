import React, { useState } from 'react';
import { Exchange, confirmExchange, completeExchange } from '../../api/exchangesApi';
import { LoggerService } from '../../services/loggerService';

interface ExchangeStatusProps {
    exchange: Exchange;
    currentUserId: number;
    onExchangeUpdated?: () => void;
}

const ExchangeStatus: React.FC<ExchangeStatusProps> = ({ 
    exchange, 
    onExchangeUpdated 
}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canConfirm = exchange.status === 'pending' && 
        ((exchange.isInitiator && !exchange.initiator_confirmed) || 
         (!exchange.isInitiator && !exchange.recipient_confirmed));

    const canComplete = exchange.status === 'confirmed';

    const handleConfirm = async () => {
        setIsUpdating(true);
        setError(null);

        try {
            await confirmExchange(exchange.id);
            if (onExchangeUpdated) {
                onExchangeUpdated();
            }
        } catch (err) {
            setError('Erreur lors de la confirmation');
            LoggerService.error('Erreur confirmation échange', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleComplete = async () => {
        setIsUpdating(true);
        setError(null);

        try {
            await completeExchange(exchange.id);
            if (onExchangeUpdated) {
                onExchangeUpdated();
            }
        } catch (err: any) {
            let errorMessage = 'Erreur lors de la finalisation';
            if (err?.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            LoggerService.error('Erreur finalisation échange', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = () => {
        switch (exchange.status) {
            case 'pending': return '#ffa500';
            case 'confirmed': return '#007bff';
            case 'completed': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusText = () => {
        switch (exchange.status) {
            case 'pending': return 'En attente de confirmation';
            case 'confirmed': return 'Confirmé - En cours';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return 'Inconnu';
        }
    };

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '12px',
            margin: '8px 0',
            fontSize: '14px'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <div style={{ fontWeight: '500', color: '#333' }}>
                    💼 Échange proposé
                </div>
                <div style={{ 
                    color: getStatusColor(), 
                    fontWeight: '500',
                    fontSize: '12px'
                }}>
                    {getStatusText()}
                </div>
            </div>
            
            <div style={{ 
                color: '#666', 
                marginBottom: '12px',
                fontStyle: 'italic'
            }}>
                "{exchange.description}"
            </div>

            {exchange.status === 'pending' && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    <span>
                        {exchange.isInitiator ? 'Vous' : exchange.initiator.firstName} : 
                        {exchange.initiator_confirmed ? ' ✅' : ' ⏳'}
                    </span>
                    <span>
                        {!exchange.isInitiator ? 'Vous' : exchange.recipient.firstName} : 
                        {exchange.recipient_confirmed ? ' ✅' : ' ⏳'}
                    </span>
                </div>
            )}

            {canConfirm && (
                <button
                    onClick={handleConfirm}
                    disabled={isUpdating}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    {isUpdating ? 'Confirmation...' : 'Confirmer l\'échange'}
                </button>
            )}

            {canComplete && (
                <button
                    onClick={handleComplete}
                    disabled={isUpdating}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    {isUpdating ? 'Finalisation...' : 'Marquer comme terminé'}
                </button>
            )}

            {exchange.status === 'completed' && (
                <div style={{ 
                    color: '#28a745', 
                    fontSize: '12px',
                    marginTop: '8px',
                    fontWeight: '500'
                }}>
                    ✅ Échange terminé - Vous pouvez maintenant laisser un avis
                </div>
            )}

            {error && (
                <div style={{ 
                    color: 'red', 
                    fontSize: '12px',
                    marginTop: '8px'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default ExchangeStatus; 