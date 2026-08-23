import { useState, useEffect, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GitCompare, X, Plus, Loader2, ArrowUpDown } from 'lucide-react';
import { fetchComparison } from '../services/api';
import type { CompareResponse, CityComparison as CityResult } from '../types/weather';
import { useCity } from '../contexts/CityContext';
import { Card } from './ui/Card';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import ErrorBanner from './ui/ErrorBanner';

type MetricKey = 'temperature' | 'feels_like' | 'humidity' | 'wind' | 'pressure';

interface Metric {
  key: MetricKey;
  label: string;
  color: string;
  extract: (c: CityResult) => number;
}

const METRICS: Metric[] = [
  { key: 'temperature', label: 'Temp (°C)', color: '#f97316', extract: (c) => c.temperature.current },
  { key: 'feels_like', label: 'Feels (°C)', color: '#fb923c', extract: (c) => c.temperature.feels_like },
  { key: 'humidity', label: 'Humidity (%)', color: '#06b6d4', extract: (c) => c.humidity },
  { key: 'wind', label: 'Wind (m/s)', color: '#6366f1', extract: (c) => c.wind.speed },
];

const CITY_COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#a855f7', '#f97316', '#06b6d4', '#8b5cf6'];

export default function CityComparison() {
  const { city: contextCity } = useCity();
  const [cities, setCities] = useState<string[]>(['', '']);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<MetricKey | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const initializedRef = useRef(false);

  // Seed from context if available
  useEffect(() => {
    if (!initializedRef.current && contextCity && cities.length >= 1 && !cities[0]) {
      initializedRef.current = true;
      setCities([contextCity, ...cities.slice(1)]);
    }
  }, [contextCity]);

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

  // Normalize values for radar (0-1 scale)
  const radarData = (() => {
    if (!result) return [];
    const metrics = METRICS;
    const citiesData = result.cities;
    return metrics.map((m) => {
      const row: Record<string, string | number> = { metric: m.label };
      const values = citiesData.map(m.extract);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      citiesData.forEach((c) => {
        row[c.city] = Math.round(((m.extract(c) - min) / range) * 100);
      });
      return row;
    });
  })();

  const cityList = result?.cities ?? [];

  const sortedCities = [...cityList].sort((a, b) => {
    if (!sortKey) return 0;
    const m = METRICS.find(x => x.key === sortKey);
    if (!m) return 0;
    const av = m.extract(a);
    const bv = m.extract(b);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-foreground">
        <p className="text-muted-foreground text-xs mb-1.5 font-medium">{payload[0].name}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.dataKey}: {p.value}%
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card variant="default" className="animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-numerals font-bold">03</span>
            City Comparison
          </h2>
        </div>

        {/* City inputs */}
        <div className="space-y-3" role="list" aria-label="Cities to compare">
          {cities.map((city, i) => (
            <div key={i} className="flex items-center gap-2" role="listitem">
              <SearchInput
                value={city}
                onChange={(v) => updateCity(i, v)}
                placeholder={`City ${i + 1}`}
                className="flex-1"
              />
              {cities.length > 2 && (
                <button
                  onClick={() => removeCity(i)}
                  aria-label={`Remove city ${i + 1}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/8 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add city
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Comparing…
              </span>
            ) : 'Compare'}
          </button>
        </div>

        {error && <ErrorBanner message={error} tone="error" retry={handleCompare} />}

        {result && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Radar chart */}
            <div className="h-96 rounded-xl bg-muted/30 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" innerRadius={40} outerRadius={110} data={radarData}>
                  <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontWeight: 500 }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                  {cityList.map((c, i) => (
                    <Radar
                      key={c.city}
                      name={c.city}
                      dataKey={c.city}
                      stroke={CITY_COLORS[i % CITY_COLORS.length]}
                      fill={CITY_COLORS[i % CITY_COLORS.length]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CITY_COLORS[i % CITY_COLORS.length], strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Ranked leaderboard table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-3 text-left font-medium text-foreground w-8">#</th>
                    <th className="p-3 text-left font-medium text-foreground">City</th>
                    {METRICS.map((m) => (
                      <th
                        key={m.key}
                        className="p-3 text-right font-medium text-foreground cursor-pointer hover:text-accent select-none"
                        onClick={() => {
                          if (sortKey === m.key) {
                            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortKey(m.key);
                            setSortDir('desc');
                          }
                        }}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-muted-foreground">{m.label}</span>
                          {sortKey === m.key && (
                            <ArrowUpDown className={`w-3.5 h-3.5 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedCities.map((c, i) => (
                    <tr key={c.city} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/3' : ''}`}>
                      <td className="p-3 text-left font-numerals font-bold text-foreground">{i + 1}</td>
                      <td className="p-3 text-left font-medium text-foreground">{c.city}</td>
                      {METRICS.map((m) => (
                        <td key={m.key} className="p-3 text-right font-numerals font-medium text-foreground">
                          {m.key === 'wind' ? Math.round(m.extract(c) * 10) / 10 : Math.round(m.extract(c))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <EmptyState
            icon={<GitCompare className="w-6 h-6" />}
            title="Add cities and click Compare"
            hint="Select at least 2 cities to see side-by-side comparison"
          />
        )}
      </div>
    </Card>
  );
}
