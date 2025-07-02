import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { createExchange } from '../api/exchangesApi';
import { LoggerService } from '../services/loggerService';

interface ExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: number;
    recipientName: string;
    onExchangeCreated?: () => void;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ 
    isOpen, 
    onClose, 
    recipientId, 
    recipientName,
    onExchangeCreated 
}) => {
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);
        setSuccess(null);

        try {
            await createExchange({
                recipient_id: recipientId,
                description: description.trim()
            });

            setDescription('');
            setSuccess('Échange proposé avec succès !');
            
            setTimeout(() => {
                onClose();
                setSuccess(null);
                if (onExchangeCreated) {
                    onExchangeCreated();
                }
            }, 1500);
        } catch (err) {
            setError('Une erreur est survenue lors de la proposition de l\'échange');
            LoggerService.error('Erreur création échange', err);
        } finally {
            setIsCreating(false);
        }
    };

    return createPortal(
        <div className="message-modal__overlay" onClick={onClose}>
            <div className="message-modal" onClick={e => e.stopPropagation()}>
                <button className="message-modal__close" onClick={onClose}>&times;</button>
                <h2 className="message-modal__title">Proposer un échange à {recipientName}</h2>
                
                {success && (
                    <div className="message-modal__success" style={{ 
                        color: 'green', 
                        backgroundColor: '#e8f5e8', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {success}
                    </div>
                )}
                
                <form className="message-modal__form" onSubmit={handleSubmit}>
                    <div className="message-modal__content">
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="description" style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500',
                                color: '#333'
                            }}>
                                Description de l'échange *
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez ce que vous proposez d'échanger... (ex: Je peux t'aider avec ton logo en échange d'un coup de main sur mon site web)"
                                rows={5}
                                required
                                disabled={isCreating}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '12px', 
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            <strong>💡 Comment ça marche :</strong>
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                <li>Votre proposition sera envoyée à {recipientName}</li>
                                <li>Les deux parties devront confirmer l'échange</li>
                                <li>Une fois terminé, vous pourrez vous noter mutuellement</li>
                            </ul>
                        </div>
                        
                        {error && (
                            <div className="message-modal__error" style={{ 
                                color: 'red', 
                                backgroundColor: '#ffe6e6', 
                                padding: '8px', 
                                borderRadius: '4px',
                                marginTop: '12px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button 
                            type="button" 
                            className="btn" 
                            onClick={onClose} 
                            disabled={isCreating}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn--primary"
                            disabled={isCreating || !description.trim()}
                        >
                            {isCreating ? 'Création...' : 'Proposer l\'échange'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ExchangeModal; 