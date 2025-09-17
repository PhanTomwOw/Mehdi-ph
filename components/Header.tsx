import React from 'react';
import type { View } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../App';
import { UserCircleIcon, SunIcon, MoonIcon } from './IconComponents';

interface HeaderProps {
    setCurrentView: (view: View) => void;
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentView, onOpenLogin, onOpenRegister }) => {
  const { currentUser, logout, totalUnreadCount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setCurrentView({ name: 'list' });
  };

  return (
    <header className="bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-bold text-foreground cursor-pointer flex items-center gap-2"
          onClick={() => setCurrentView({ name: 'list' })}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.069l4.981 2.49a1 1 0 01.019 1.74l-4.02 2.01a1 1 0 01-1.01-.035l-4-3a1 1 0 01-.02-1.74L11 2.131V2a1 1 0 01.3-.954zM10 11.25a1 1 0 011-1h.09a1 1 0 01.98.745l.24 1.2a1 1 0 01-.38 1.05l-1.95 1.463a1 1 0 01-1.23 0l-1.95-1.463a1 1 0 01-.38-1.05l.24-1.2A1 1 0 019.91 10.25H10zm-3.09 4.34a1 1 0 01.44-.257l.03-.01 3.51-1.755a1 1 0 011.03 0l3.51 1.755.03.01a1 1 0 01.44.257 1 1 0 01.21.902l-.54 2.7a1 1 0 01-.94.807H6.94a1 1 0 01-.94-.807l-.54-2.7a1 1 0 01.21-.902z" clipRule="evenodd" />
            </svg>
          اسپورت‌زون تبریز
        </div>
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => setCurrentView({ name: 'list' })}
            className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
          >
            مجموعه‌ها
          </button>
          <button 
            onClick={() => setCurrentView({ name: 'teambuilder' })}
            className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
          >
            هم‌تیمی پیدا کن
          </button>

          <button
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>

          {currentUser ? (
            <>
              <button 
                onClick={() => setCurrentView({ name: 'messenger' })}
                className="relative text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                  پیام‌رسان
                  {totalUnreadCount > 0 && (
                     <span className="absolute top-0 left-0 block h-2.5 w-2.5 -translate-y-1/2 -translate-x-full transform rounded-full bg-primary ring-2 ring-card"></span>
                  )}
              </button>
              <button 
                onClick={() => setCurrentView({ name: 'profile' })}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="View Profile"
              >
                  <UserCircleIcon className="h-7 w-7" />
              </button>
              <button 
                onClick={handleLogout}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full hover:bg-secondary/80 transition-colors text-sm font-semibold"
              >
                خروج
              </button>
            </>
          ) : (
             <>
                <button onClick={onOpenLogin} className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium">
                    ورود
                </button>
                <button 
                    onClick={onOpenRegister}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                    ثبت‌نام
                </button>
             </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;