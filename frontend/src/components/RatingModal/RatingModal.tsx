import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { rateUserAfterExchange } from '../../api/exchangesApi';
import { LoggerService } from '../../services/loggerService';
import RatingStars from '../RatingStars/RatingStars';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    exchangeId: number;
    userId: number;
    userName: string;
    onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
    isOpen, 
    onClose, 
    exchangeId, 
    userId, 
    userName,
    onRatingSubmitted 
}) => {
    const [ratings, setRatings] = useState({
        serviceQuality: 0,
        communication: 0,
        timeliness: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRatingChange = (category: keyof typeof ratings, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [category]: rating
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (ratings.serviceQuality === 0 || ratings.communication === 0 || ratings.timeliness === 0) {
            setError('Veuillez noter tous les critères');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await rateUserAfterExchange(userId, {
                exchange_id: exchangeId,
                ...ratings
            });

            setSuccess('Avis envoyé avec succès !');
            
            setTimeout(() => {
                onClose();
                setSuccess(null);
                setRatings({ serviceQuality: 0, communication: 0, timeliness: 0 });
                if (onRatingSubmitted) {
                    onRatingSubmitted();
                }
            }, 1500);
        } catch (err: any) {
            let msg = 'Une erreur est survenue lors de l\'envoi de l\'avis';
            if (err?.message) {
                msg = err.message;
            }
            setError(msg);
            LoggerService.error('Erreur envoi avis', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = Math.round(
        (ratings.serviceQuality + ratings.communication + ratings.timeliness) / 3
    );

    return createPortal(
        <div className="message-modal__overlay" onClick={onClose}>
            <div className="message-modal" onClick={e => e.stopPropagation()}>
                <button className="message-modal__close" onClick={onClose}>&times;</button>
                <h2 className="message-modal__title">Laisser un avis à {userName}</h2>
                
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
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '12px', 
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            <strong>💡 Votre avis aide la communauté !</strong>
                            <p style={{ margin: '8px 0 0 0' }}>
                                Partagez votre expérience pour aider {userName} à progresser et valoriser son travail.
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500',
                                color: '#333'
                            }}>
                                Qualité du service
                            </label>
                            <RatingStars
                                rating={ratings.serviceQuality}
                                onRatingChange={(rating) => handleRatingChange('serviceQuality', rating)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500',
                                color: '#333'
                            }}>
                                Communication
                            </label>
                            <RatingStars
                                rating={ratings.communication}
                                onRatingChange={(rating) => handleRatingChange('communication', rating)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: '500',
                                color: '#333'
                            }}>
                                Respect des délais
                            </label>
                            <RatingStars
                                rating={ratings.timeliness}
                                onRatingChange={(rating) => handleRatingChange('timeliness', rating)}
                            />
                        </div>

                        {averageRating > 0 && (
                            <div style={{ 
                                backgroundColor: '#e3f2fd', 
                                padding: '12px', 
                                borderRadius: '8px',
                                marginBottom: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                    Note moyenne
                                </div>
                                <RatingStars rating={averageRating} readonly size="large" />
                            </div>
                        )}
                        
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
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn--primary"
                            disabled={isSubmitting || averageRating === 0}
                        >
                            {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default RatingModal; 