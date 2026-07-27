import { useState } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import type { ForecastResponse } from '../types/weather';
import { fetchForecast } from '../services/api';

export default function ForecastChart() {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'temp' | 'humidity'>('temp');

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchForecast(city.trim());
      setForecast(data);
    } catch {
      setError('City not found.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = forecast?.entries.map((e) => ({
    time: new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    temp: Math.round(e.temperature.current * 10) / 10,
    tempMin: Math.round(e.temperature.min * 10) / 10,
    tempMax: Math.round(e.temperature.max * 10) / 10,
    humidity: e.humidity,
  })) ?? [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/50 text-xs mb-1.5 font-medium">{label}</p>
        {view === 'temp' ? (
          <>
            <p className="text-indigo-300 text-sm font-semibold">Avg: {payload[0].value}°C</p>
            <p className="text-white/40 text-xs mt-0.5">Min: {payload[1]?.value}°C / Max: {payload[2]?.value}°C</p>
          </>
        ) : (
          <p className="text-cyan-300 text-sm font-semibold">{payload[0].value}%</p>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px]">02</span>
        5-Day Forecast
      </h2>
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="City name..."
            className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="glow-btn px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          ) : 'Go'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {forecast && !loading && (
        <>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setView('temp')}
              className={`glow-btn px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'temp'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/8'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
              Temperature
            </button>
            <button
              onClick={() => setView('humidity')}
              className={`glow-btn px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === 'humidity'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-200 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/8'
              }`}
            >
              Humidity
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {view === 'temp' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#a855f7" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} unit="°C" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="temp" stroke="url(#tempStroke)" fill="url(#tempGradient)" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} />
                  <Line type="monotone" dataKey="tempMin" stroke="#818cf8" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.5} />
                  <Line type="monotone" dataKey="tempMax" stroke="#f472b6" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.5} />
                </AreaChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="humidity" stroke="url(#humStroke)" fill="url(#humGradient)" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!forecast && !loading && !error && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Enter a city to view the 5-day forecast</p>
        </div>
      )}
    </div>
  );
}
