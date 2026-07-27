import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Plus, MapPin } from 'lucide-react';
import type { Favorite } from '../types/weather';
import { fetchFavorites, addFavorite, removeFavorite } from '../services/api';

interface FavoritesProps {
  onSelectCity: (city: string) => void;
}

export default function Favorites({ onSelectCity }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchFavorites();
      setFavorites(data.favorites);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!newCity.trim()) return;
    try {
      await addFavorite(newCity.trim());
      setNewCity('');
      await load();
    } catch {
      // silently fail
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeFavorite(id);
      await load();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Star className="w-3 h-3 text-white" fill="currentColor" />
        </div>
        Favorites
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add city..."
          className="input-glass flex-1 px-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none"
        />
        <button
          onClick={handleAdd}
          className="glow-btn p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg shadow-yellow-500/25"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-white/5 flex items-center justify-center">
            <Star className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">No favorites yet</p>
          <p className="text-white/20 text-xs mt-1">Add a city above to save it</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {favorites.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectCity(f.city)}
              className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.07] rounded-xl px-3.5 py-3 transition-all group border border-transparent hover:border-white/[0.06]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-white/70 group-hover:text-white font-medium text-sm transition-colors">{f.city}</span>
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); handleRemove(f.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
