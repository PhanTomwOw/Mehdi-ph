import React from 'react';
import type { SportComplex } from '../types';
import { LocationIcon, StarIcon, HeartIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';

interface SportComplexCardProps {
  complex: SportComplex;
  onSelect: (complex: SportComplex) => void;
}

const SportComplexCard: React.FC<SportComplexCardProps> = ({ complex, onSelect }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(complex.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onSelect from firing
    toggleFavorite(complex.id);
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group border border-border">
      <div className="relative overflow-hidden">
        <img className="w-full h-48 object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-95" src={complex.imageUrl} alt={`Image of ${complex.name}`} />
        
        <button 
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-black/60 transition-all duration-200 z-10 ${favorited ? 'text-primary' : 'text-white'}`}
            aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        >
            <HeartIcon className="w-5 h-5" filled={favorited} />
        </button>

        {typeof complex.rating === 'number' && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 m-3 rounded-full text-sm font-semibold flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            <span>{complex.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-card-foreground mb-2 truncate">{complex.name}</h3>
        <div className="flex items-center text-muted-foreground mb-4">
          <LocationIcon className="w-5 h-5 ms-2 text-muted-foreground" />
          <p className="text-sm truncate">{complex.address}</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
            {(complex.sports || []).slice(0,3).map(sport => (
                <span key={sport} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{sport}</span>
            ))}
        </div>
        <button
          onClick={() => onSelect(complex)}
          className="w-full bg-foreground text-background py-2.5 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform group-hover:scale-105"
        >
          مشاهده و رزرو
        </button>
      </div>
    </div>
  );
};

export default SportComplexCard;