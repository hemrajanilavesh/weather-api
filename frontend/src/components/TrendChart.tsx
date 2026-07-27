import { useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { TrendResponse } from '../types/weather';
import { fetchTrends } from '../services/api';

export default function TrendChart() {
  const [city, setCity] = useState('');
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrends(city.trim());
      setTrend(data);
    } catch {
      setError('Trends unavailable for this city.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = trend?.trends.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    temperature: Math.round(d.temperature * 10) / 10,
    humidity: d.humidity,
  })) ?? [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/50 text-xs mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}{p.dataKey === 'temperature' ? '°C' : '%'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[10px]">04</span>
        Temperature & Humidity Trends
      </h2>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
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
          className="glow-btn px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25"
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

      {trend && !loading && (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="tempBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="humLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                <YAxis yAxisId="temp" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} unit="°C" />
                <YAxis yAxisId="hum" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => <span className="text-white/60 text-xs font-medium">{value}</span>}
                />
                <Bar yAxisId="temp" dataKey="temperature" fill="url(#tempBar)" radius={[6, 6, 0, 0]} barSize={28} name="Temperature" />
                <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="url(#humLine)" strokeWidth={2.5} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="Humidity" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {trend.summary && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="stat-tile p-3 text-center">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1">Avg Temp</p>
                <p className="text-white font-semibold text-lg">{trend.summary.avg_temperature}°C</p>
              </div>
              <div className="stat-tile p-3 text-center">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1">Avg Humidity</p>
                <p className="text-white font-semibold text-lg">{trend.summary.avg_humidity}%</p>
              </div>
              <div className="stat-tile p-3 text-center">
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1">Condition</p>
                <p className="text-white font-semibold text-sm">{trend.summary.dominant_condition}</p>
              </div>
            </div>
          )}
        </>
      )}

      {!trend && !loading && !error && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-white/5 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Enter a city to view temperature and humidity trends</p>
        </div>
      )}
    </div>
  );
}
