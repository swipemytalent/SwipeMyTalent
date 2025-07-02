import React from 'react';
import '../styles/StarRating.scss';

interface StarRatingProps {
  rating?: number | null | string;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'medium', 
  showNumber = false,
  className = ''
}) => {
  const numericRating = typeof rating === 'number' ? rating : Number(rating);
  const isValid = !isNaN(numericRating) && numericRating > 0;
  const fullStars = isValid ? Math.floor(numericRating) : 0;
  const hasHalfStar = isValid ? numericRating % 1 >= 0.5 : false;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  if (!isValid) {
    return (
      <div className={`star-rating star-rating--${size} ${className}`}>
        <span className="star-rating__number" style={{color: '#aaa'}}>Non noté</span>
      </div>
    );
  }

  return (
    <div className={`star-rating star-rating--${size} ${className}`}>
      <div className="star-rating__stars">
        {/* Étoiles pleines */}
        {Array.from({ length: fullStars }, (_, i) => (
          <i key={`full-${i}`} className="fa fa-star star-rating__star star-rating__star--filled"></i>
        ))}
        
        {/* Demi-étoile */}
        {hasHalfStar && (
          <i className="fa fa-star-half-o star-rating__star star-rating__star--half"></i>
        )}
        
        {/* Étoiles vides */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <i key={`empty-${i}`} className="fa fa-star-o star-rating__star star-rating__star--empty"></i>
        ))}
      </div>
      
      {showNumber && (
        <span className="star-rating__number">
          {Number(numericRating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 