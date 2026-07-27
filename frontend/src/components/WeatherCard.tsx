import { useState } from 'react';
import { Search, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import type { CurrentWeatherResponse } from '../types/weather';
import { fetchCurrentWeather } from '../services/api';

export default function WeatherCard() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<CurrentWeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchCurrentWeather(city.trim());
      setWeather(data);
    } catch {
      setError('City not found. Try a different name.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px]">01</span>
        Current Weather
      </h2>
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city..."
            className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="glow-btn px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          ) : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
            <div className="absolute inset-0 w-10 h-10 border-2 border-purple-500/20 border-b-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>
      )}

      {weather && !loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {weather.city}<span className="text-white/40 text-lg font-normal ml-2">{weather.country}</span>
              </h3>
              <p className="text-white/50 text-sm capitalize mt-0.5">{weather.conditions[0]?.description}</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-light bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                {Math.round(weather.temperature.current)}°
              </div>
              <div className="text-white/40 text-xs mt-1 font-medium">
                H:{Math.round(weather.temperature.max)}° L:{Math.round(weather.temperature.min)}°
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Thermometer, label: 'Feels like', value: `${Math.round(weather.temperature.feels_like)}°`, color: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-400' },
              { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, color: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-400' },
              { icon: Wind, label: 'Wind', value: `${weather.wind.speed.toFixed(1)} m/s`, color: 'from-indigo-500/20 to-violet-500/20', iconColor: 'text-indigo-400' },
              { icon: Eye, label: 'Visibility', value: `${(weather.visibility ?? 0) / 1000} km`, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
            ].map(({ icon: Icon, label, value, color, iconColor }) => (
              <div key={label} className="stat-tile p-3.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                </div>
                <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider">{label}</p>
                <p className="text-white font-semibold text-lg mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!weather && !loading && !error && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center">
            <Search className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Enter a city to see current weather</p>
        </div>
      )}
    </div>
  );
}
