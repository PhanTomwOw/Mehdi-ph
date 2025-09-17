import React, { useState, useMemo } from 'react';
import type { SportComplex } from '../types';
import SportComplexCard from './SportComplexCard';
import Spinner from './Spinner';
import Filter from './Filter';
import { SearchIcon } from './IconComponents';

interface SportComplexListProps {
  complexes: SportComplex[];
  isLoading: boolean;
  error: string | null;
  onSelectComplex: (complex: SportComplex) => void;
}

const SportComplexList: React.FC<SportComplexListProps> = ({ complexes, isLoading, error, onSelectComplex }) => {
  const [selectedSport, setSelectedSport] = useState<string>('All Sports');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allSports = useMemo(() => {
    if (complexes.length === 0) return [];
    const uniqueSports = [...new Set(complexes.flatMap(c => c.sports))];
    return ['All Sports', ...uniqueSports.sort()];
  }, [complexes]);

  const filteredComplexes = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    
    return complexes
      .filter(c => selectedSport === 'All Sports' || c.sports.includes(selectedSport))
      .filter(c => 
        !lowercasedQuery ||
        c.name.toLowerCase().includes(lowercasedQuery) ||
        c.address.toLowerCase().includes(lowercasedQuery)
      );
  }, [complexes, selectedSport, searchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return <Spinner size="lg" />;
    }

    if (error) {
      return <div className="text-center py-10 px-4 bg-destructive text-destructive-foreground rounded-lg">{error}</div>;
    }
    
    if (complexes.length === 0 && !isLoading) {
      return <div className="text-center py-10 text-muted-foreground">No sports complexes found.</div>;
    }

    return (
      <>
        {allSports.length > 1 && (
          <Filter
            sports={allSports}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
          />
        )}

        {filteredComplexes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No complexes found matching your criteria. Try different filters or a new search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredComplexes.map((complex) => (
              <SportComplexCard key={complex.id} complex={complex} onSelect={onSelectComplex} />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">Find Your Arena</h1>
        <p className="text-lg text-muted-foreground mt-2">Explore and book the best sports facilities in Tabriz.</p>
      </div>
      
      <div className="max-w-2xl mx-auto mb-10 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          aria-label="Search sports complexes"
        />
      </div>

      {renderContent()}
    </div>
  );
};

export default SportComplexList;