import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SportComplexList from './components/SportComplexList';
import SportComplexDetail from './components/SportComplexDetail';
import TeamBuilder from './components/TeamBuilder';
import Profile from './components/Profile';
import Messenger from './components/Messenger';
import AuthModal from './components/AuthModal';
import type { SportComplex } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { useSportsData } from './hooks/useSportsData';

// --- THEME CONTEXT ---
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs as Theme;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
// --- END THEME CONTEXT ---


export type View = 
  | { name: 'list' }
  | { name: 'detail'; complex: SportComplex }
  | { name: 'teambuilder' }
  | { name: 'profile' }
  | { name: 'messenger' };

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>({ name: 'list' });
  const [authModalState, setAuthModalState] = useState<{isOpen: boolean; form: 'login' | 'register'}>({ isOpen: false, form: 'login' });
  const { complexes, isLoading, error } = useSportsData();

  const handleSelectComplex = (complex: SportComplex) => {
    setCurrentView({ name: 'detail', complex });
  };

  const handleBackToList = () => {
    setCurrentView({ name: 'list' });
  };
  
  const openLoginModal = () => setAuthModalState({ isOpen: true, form: 'login' });
  const openRegisterModal = () => setAuthModalState({ isOpen: true, form: 'register' });
  const closeModal = () => setAuthModalState({ isOpen: false, form: 'login' });
  
  const renderContent = () => {
    switch (currentView.name) {
      case 'list':
        return <SportComplexList 
                  complexes={complexes} 
                  isLoading={isLoading} 
                  error={error} 
                  onSelectComplex={handleSelectComplex} 
                />;
      case 'detail':
        return <SportComplexDetail complex={currentView.complex} onBack={handleBackToList} />;
      case 'teambuilder':
        return <TeamBuilder />;
      case 'profile':
        return <Profile onBack={handleBackToList} complexes={complexes} setCurrentView={setCurrentView} />;
      case 'messenger':
        return <Messenger />;
      default:
        return <SportComplexList 
                  complexes={complexes} 
                  isLoading={isLoading} 
                  error={error} 
                  onSelectComplex={handleSelectComplex} 
                />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        setCurrentView={setCurrentView} 
        onOpenLogin={openLoginModal}
        onOpenRegister={openRegisterModal}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
      {authModalState.isOpen && (
        <AuthModal 
            initialForm={authModalState.form}
            onClose={closeModal}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ThemeProvider>
);


export default App;