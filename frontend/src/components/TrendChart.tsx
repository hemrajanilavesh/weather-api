import { useState, useEffect, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend, Area } from 'recharts';
import { BarChart3, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import type { TrendResponse } from '../types/weather';
import { fetchTrends } from '../services/api';
import { useCity } from '../contexts/CityContext';
import { Card } from './ui/Card';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import ErrorBanner from './ui/ErrorBanner';
import Stat from './ui/Stat';

export default function TrendChart() {
  const { city: contextCity, markUpdated } = useCity();
  const [city, setCity] = useState('');
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTable, setShowTable] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && contextCity) {
      initializedRef.current = true;
      setCity(contextCity);
    }
  }, [contextCity]);

  const chartData = trend?.trends.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    temperature: Math.round(d.temperature * 10) / 10,
    humidity: d.humidity,
  })) ?? [];

  const summary = trend?.summary;

  const handleSearch = async (searchCity?: string) => {
    const targetCity = (searchCity ?? city).trim();
    if (!targetCity) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrends(targetCity);
      setTrend(data);
      setCity(targetCity);
      markUpdated();
    } catch {
      setError('Trends unavailable for this city.');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-foreground">
        <p className="text-muted-foreground text-xs mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}{p.dataKey === 'temperature' ? '°C' : '%'}
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
            <span className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-numerals font-bold">04</span>
            Temperature & Humidity Trends
          </h2>
          {trend && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-muted-foreground hover:bg-white/8 hover:text-foreground"
              >
                {showTable ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {showTable ? 'Hide table' : 'Show data'}
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <SearchInput
          value={city}
          onChange={setCity}
          onSearch={handleSearch}
          placeholder="Search city…"
          loading={loading}
          className="max-w-xs"
        />

        {error && <ErrorBanner message={error} tone="error" retry={() => handleSearch()} />}

        {loading && (
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-muted-foreground">Loading trends…</span>
            </div>
          </div>
        )}

        {trend && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* 4 KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                label="Avg Temp"
                value={summary?.avg_temperature ?? 0}
                unit="°C"
                accent="accent"
                size="md"
              />
              <Stat
                label="Min Temp"
                value={summary?.min_temperature ?? 0}
                unit="°C"
                size="md"
              />
              <Stat
                label="Max Temp"
                value={summary?.max_temperature ?? 0}
                unit="°C"
                accent="accent"
                size="md"
              />
              <Stat
                label="Avg Humidity"
                value={summary?.avg_humidity ?? 0}
                unit="%"
                size="md"
              />
            </div>

            {/* Area chart */}
            <div className="h-80 rounded-xl bg-muted/30 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                    unit="°C"
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                    unit="%"
                    domain={[0, 100]}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#tempArea)"
                    dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#humArea)"
                    dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#22d3ee', strokeWidth: 2, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Data table (collapsible) */}
            <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: showTable ? '500px' : '0' }}>
              {showTable && (
                <div className="mt-4 rounded-xl border border-white/10 overflow-x-auto">
                  <table className="w-full text-sm" role="table">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-3 text-left font-medium text-foreground">Date</th>
                        <th className="p-3 text-right font-medium text-foreground">Temp (°C)</th>
                        <th className="p-3 text-right font-medium text-foreground">Humidity (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trend.trends.map((d, i) => (
                        <tr key={d.date} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/3' : ''}`}>
                          <td className="p-3 text-left text-foreground">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="p-3 text-right font-numerals font-medium text-foreground">{Math.round(d.temperature * 10) / 10}</td>
                          <td className="p-3 text-right font-numerals font-medium text-foreground">{d.humidity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {!trend && !loading && !error && (
          <EmptyState
            icon={<BarChart3 className="w-6 h-6" />}
            title="Enter a city to view temperature & humidity trends"
            hint="Analyze patterns over time"
          />
        )}
      </div>
    </Card>
  );
}
