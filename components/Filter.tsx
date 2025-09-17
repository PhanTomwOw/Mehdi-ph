import React from 'react';

interface FilterProps {
  sports: string[];
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

const Filter: React.FC<FilterProps> = ({ sports, selectedSport, onSelectSport }) => {
  return (
    <div className="flex justify-center flex-wrap gap-3 mb-10">
      {sports.map(sport => (
        <button
          key={sport}
          onClick={() => onSelectSport(sport)}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5
            ${selectedSport === sport
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground shadow-sm border border-border'
            }
          `}
          aria-pressed={selectedSport === sport}
        >
          {sport}
        </button>
      ))}
    </div>
  );
};

export default Filter;