import { useState, useEffect } from 'react';
import type { SportComplex } from '../types';
import { fetchSportsComplexes } from '../services/geminiService';

export const useSportsData = () => {
  const [complexes, setComplexes] = useState<SportComplex[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSportsComplexes();
        if(data && data.length > 0) {
            setComplexes(data);
        } else {
            setError("داده‌های مجموعه‌های ورزشی دریافت نشد. سرویس ممکن است به طور موقت در دسترس نباشد.");
        }
      } catch (e) {
        setError("یک خطای غیرمنتظره رخ داد.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { complexes, isLoading, error };
};
