import React, { useState } from 'react';

interface RatingStarsProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
    rating, 
    onRatingChange, 
    readonly = false,
    size = 'medium'
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const getSizeClass = () => {
        switch (size) {
            case 'small': return 'rating-stars--small';
            case 'large': return 'rating-stars--large';
            default: return 'rating-stars--medium';
        }
    };

    const handleStarClick = (starRating: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleStarHover = (starRating: number) => {
        if (!readonly) {
            setHoverRating(starRating);
        }
    };

    const handleStarLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`rating-stars ${getSizeClass()}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
        }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    style={{
                        cursor: readonly ? 'default' : 'pointer',
                        fontSize: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
                        color: star <= displayRating ? '#ffc107' : '#e4e5e9',
                        transition: 'color 0.2s ease',
                        userSelect: 'none'
                    }}
                >
                    ★
                </span>
            ))}
            {!readonly && (
                <span style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    {displayRating}/5
                </span>
            )}
        </div>
    );
};

export default RatingStars; 