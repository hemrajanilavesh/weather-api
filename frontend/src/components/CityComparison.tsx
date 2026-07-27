import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GitCompare, X, Plus } from 'lucide-react';
import { fetchComparison } from '../services/api';
import type { CompareResponse } from '../types/weather';

export default function CityComparison() {
  const [cities, setCities] = useState<string[]>(['', '']);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#a855f7'];
  const COLORS_LIGHT = ['rgba(99,102,241,0.15)', 'rgba(16,185,129,0.15)', 'rgba(236,72,153,0.15)', 'rgba(245,158,11,0.15)', 'rgba(168,85,247,0.15)'];

  const addCity = () => setCities([...cities, '']);
  const removeCity = (i: number) => cities.length > 2 && setCities(cities.filter((_, idx) => idx !== i));
  const updateCity = (i: number, v: string) => {
    const next = [...cities];
    next[i] = v;
    setCities(next);
  };

  const handleCompare = async () => {
    const valid = cities.map((c) => c.trim()).filter(Boolean);
    if (valid.length < 2) { setError('Enter at least 2 cities.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await fetchComparison(valid);
      setResult(data);
    } catch {
      setError('Comparison failed. Check city names.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = ['Temperature', 'Humidity', 'Wind Speed'];
  const radarData = metrics.map((metric) => {
    const row: Record<string, string | number> = { metric };
    result?.cities.forEach((c) => {
      row[c.city] = metric === 'Temperature'
        ? Math.round(c.temperature.current)
        : metric === 'Humidity'
          ? c.humidity
          : Math.round(c.wind.speed * 10) / 10;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}{p.dataKey === 'Humidity' ? '%' : p.dataKey === 'Wind Speed' ? ' m/s' : '°C'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">03</span>
        Compare Cities
      </h2>

      <div className="space-y-2 mb-4">
        {cities.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={c}
              onChange={(e) => updateCity(i, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              placeholder={`City ${i + 1}...`}
              className="input-glass flex-1 px-4 py-2.5 rounded-xl text-white placeholder-white/30 outline-none"
            />
            {cities.length > 2 && (
              <button onClick={() => removeCity(i)} className="p-2.5 text-white/30 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={addCity} className="glow-btn flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/8 text-white/60 text-sm rounded-xl transition-all border border-white/5">
          <Plus className="w-3.5 h-3.5" /> Add City
        </button>
        <button
          onClick={handleCompare}
          disabled={loading}
          className="glow-btn flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/25"
        >
          <GitCompare className="w-4 h-4" />
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          ) : 'Compare'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && !loading && (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {result.cities.map((c, i) => (
                  <Radar
                    key={c.city}
                    name={c.city}
                    dataKey={c.city}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS_LIGHT[i % COLORS_LIGHT.length]}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => <span className="text-white/60 text-xs font-medium">{value}</span>}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {result.cities.map((c, i) => (
              <div key={c.city} className="stat-tile p-3 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <div>
                  <p className="text-white font-medium text-sm">{c.city}</p>
                  <p className="text-white/40 text-xs">{Math.round(c.temperature.current)}°C · {c.humidity}%</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Add at least 2 cities and click Compare</p>
        </div>
      )}
    </div>
  );
}
