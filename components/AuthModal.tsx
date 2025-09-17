import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XIcon } from './IconComponents';
import Spinner from './Spinner';

interface AuthModalProps {
  initialForm: 'login' | 'register';
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialForm, onClose }) => {
  const [formType, setFormType] = useState(initialForm);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (formType === 'login') {
        await login(emailOrPhone, password);
      } else {
        await register(emailOrPhone, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-card rounded-2xl shadow-2xl m-4 max-w-md w-full transform transition-all scale-100 relative border border-border">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close authentication modal">
            <XIcon className="h-6 w-6" />
        </button>

        <div className="p-8">
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setFormType('login')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors ${formType === 'login' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    Login
                </button>
                 <button
                    onClick={() => setFormType('register')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors ${formType === 'register' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    Sign Up
                </button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                {formType === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
                {formType === 'login' ? 'Log in to continue your journey.' : 'Join us to start booking and playing.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                 {error && (
                    <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="emailOrPhone" className="block text-sm font-medium text-card-foreground mb-1">
                        Email or Phone Number
                    </label>
                    <input
                        type="text"
                        id="emailOrPhone"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                        className="w-full bg-transparent px-4 py-2.5 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="you@example.com"
                    />
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-transparent px-4 py-2.5 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {isLoading ? <Spinner size="sm" /> : (formType === 'login' ? 'Login' : 'Create Account')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;