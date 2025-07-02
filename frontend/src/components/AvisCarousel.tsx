import React, { useState } from 'react';
import RatingStars from './RatingStars';

interface Avis {
  id: number;
  rating: number;
  service_quality: number;
  communication: number;
  timeliness: number;
  raterFirstName: string;
  raterLastName: string;
  created_at: string;
}

interface AvisCarouselProps {
  avisList: Avis[];
}

const AvisCarousel: React.FC<AvisCarouselProps> = ({ avisList }) => {
  const [index, setIndex] = useState(0);
  const avisAvecCriteres = avisList.filter(a => (a.service_quality > 0 || a.communication > 0 || a.timeliness > 0));
  if (!avisAvecCriteres || avisAvecCriteres.length === 0) return <div>Aucun avis pour le moment.</div>;
  const avis = avisAvecCriteres[index % avisAvecCriteres.length];
  const next = () => setIndex((i) => (i + 1) % avisAvecCriteres.length);
  const prev = () => setIndex((i) => (i - 1 + avisAvecCriteres.length) % avisAvecCriteres.length);
  return (
    <div className="avis-carousel">
      <div className="avis-carousel__content">
        <div className="avis-carousel__avis-block">
          <div className="avis-carousel__note" style={{display:'flex', alignItems:'center', gap:8}}>
            <RatingStars rating={avis.rating} readonly size="large" />
            <span style={{fontWeight:700, fontSize:'1.1rem', marginLeft:4}}>{avis.rating}/5</span>
          </div>
          <div className="avis-carousel__criteres">
            <div className="avis-carousel__critere"><span>Qualité du service :</span> {(avis.service_quality && avis.service_quality > 0) ? <RatingStars rating={avis.service_quality} readonly size="small" /> : <span style={{color:'#aaa'}}>Non noté</span>}</div>
            <div className="avis-carousel__critere"><span>Communication :</span> {(avis.communication && avis.communication > 0) ? <RatingStars rating={avis.communication} readonly size="small" /> : <span style={{color:'#aaa'}}>Non noté</span>}</div>
            <div className="avis-carousel__critere"><span>Respect des délais :</span> {(avis.timeliness && avis.timeliness > 0) ? <RatingStars rating={avis.timeliness} readonly size="small" /> : <span style={{color:'#aaa'}}>Non noté</span>}</div>
          </div>
          <div className="avis-carousel__auteur">
            par {avis.raterFirstName} {avis.raterLastName} le {new Date(avis.created_at).toLocaleDateString()}
          </div>
        </div>
        {avisAvecCriteres.length > 1 && (
          <div className="avis-carousel__nav-bar">
            <button className="avis-carousel__nav-btn" onClick={prev}>&lt;</button>
            <button className="avis-carousel__nav-btn" onClick={next}>&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvisCarousel; 