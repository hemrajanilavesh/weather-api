import { useState, useEffect } from 'react';

export interface Favorite {
  id: number;
  city: string;
  created_at: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage (backend API would be used in production)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weather-favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed.map((f: Favorite) => f.city));
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
    }
  }, []);

  const isFavorite = (city: string) => favorites.includes(city);

  const toggleFavorite = (city: string) => {
    const next = isFavorite(city)
      ? favorites.filter((c) => c !== city)
      : [...favorites, city];
    setFavorites(next);
    try {
      localStorage.setItem('weather-favorites', JSON.stringify(next.map((c) => ({ city: c, created_at: new Date().toISOString() }))));
    } catch { /* ignore */ }
  };

  const addFavorite = (city: string) => {
    if (!isFavorite(city)) toggleFavorite(city);
  };

  const removeFavorite = (city: string) => {
    if (isFavorite(city)) toggleFavorite(city);
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
