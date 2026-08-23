import { useState, useEffect, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, Droplets, Wind, CloudSun, ChevronDown, Loader2 } from 'lucide-react';
import type { ForecastResponse } from '../types/weather';
import { fetchForecast } from '../services/api';
import { useCity } from '../contexts/CityContext';
import { Card } from './ui/Card';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import ErrorBanner from './ui/ErrorBanner';
import Stat from './ui/Stat';
import WeatherIcon from './ui/WeatherIcon';

type ViewMode = 'temp' | 'humidity' | 'precip' | 'wind';
type TimelineEntry = {
  date: string;
  day: string;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  humidity: number;
  precip: number;
  wind: number;
  condition: string;
  icon: string;
};

const VIEW_CONFIG: Record<ViewMode, { label: string; icon: typeof Calendar; unit: string; color: string }> = {
  temp: { label: 'Temperature', icon: CloudSun, unit: '°C', color: 'text-weather-clear-from' },
  humidity: { label: 'Humidity', icon: Droplets, unit: '%', color: 'text-weather-rain-from' },
  precip: { label: 'Precipitation', icon: Droplets, unit: '%', color: 'text-weather-rain-from' },
  wind: { label: 'Wind', icon: Wind, unit: 'm/s', color: 'text-weather-clouds-from' },
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ForecastChart() {
  const { city: contextCity, markUpdated } = useCity();
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<ViewMode>('temp');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && contextCity) {
      initializedRef.current = true;
      setCity(contextCity);
    }
  }, [contextCity]);

  const timeline: TimelineEntry[] = (forecast?.entries ?? []).slice(0, 7).map((e) => {
    const d = new Date(e.timestamp);
    return {
      date: d.toISOString().split('T')[0],
      day: DAY_LABELS[d.getDay()],
      tempMin: Math.round(e.temperature.min * 10) / 10,
      tempMax: Math.round(e.temperature.max * 10) / 10,
      tempAvg: Math.round(e.temperature.current * 10) / 10,
      humidity: e.humidity,
      precip: Math.round((e.pop ?? 0) * 100),
      wind: Math.round(e.wind.speed * 10) / 10,
      condition: e.conditions[0]?.main ?? 'Clear',
      icon: e.conditions[0]?.icon ?? '01d',
    };
  });

  const handleSearch = async (searchCity?: string) => {
    const targetCity = (searchCity ?? city).trim();
    if (!targetCity) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchForecast(targetCity);
      setForecast(data);
      setCity(targetCity);
      markUpdated();
    } catch {
      setError('City not found. Try a different name.');
    } finally {
      setLoading(false);
    }
  };

  // Sparkline data for mini chart
  const sparkData = timeline.map((t, i) => ({ i, value: view === 'temp' ? t.tempAvg : view === 'humidity' ? t.humidity : view === 'precip' ? t.precip : t.wind }));

  return (
    <Card variant="default" className="animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-numerals font-bold">02</span>
            5-Day Forecast
          </h2>
          {forecast && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{forecast.city}</span>
              {forecast.country && <span className="text-muted-foreground">, {forecast.country}</span>}
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
              <span className="text-muted-foreground">Loading forecast…</span>
            </div>
          </div>
        )}

        {forecast && !loading && (
          <div className="space-y-4 animate-fade-in">
            {/* View toggle */}
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Forecast view">
              {(Object.keys(VIEW_CONFIG) as ViewMode[]).map((v) => {
                const Config = VIEW_CONFIG[v];
                const Icon = Config.icon;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v
                      ? 'bg-white/10 text-foreground border border-white/15 shadow-sm'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/8 hover:text-foreground'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${Config.color}`} />
                    {Config.label}
                  </button>
                );
              })}
            </div>

            {/* Sparkline header */}
            <div className="relative h-20 rounded-xl bg-muted/50 border border-white/5 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="i" stroke="none" tickLine={false} axisLine={false} />
                  <YAxis stroke="none" tickLine={false} axisLine={false} />
                  <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={1.5} fill="url(#sparkGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline rows */}
            <div className="space-y-2" role="list" aria-label="Daily forecast">
              {timeline.map((t) => {
                const isExpanded = expandedDay === t.date;
                const value = view === 'temp' ? `${t.tempMin}° / ${t.tempMax}°` : view === 'humidity' ? `${t.humidity}%` : view === 'precip' ? `${t.precip}%` : `${t.wind} m/s`;

                return (
                  <button
                    key={t.date}
                    onClick={() => setExpandedDay(isExpanded ? null : t.date)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isExpanded ? 'bg-white/10 border border-white/10' : 'bg-white/5 border border-white/5 hover:bg-white/8'
                      }`}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3 w-28 flex-shrink-0">
                      <span className="font-numerals font-medium text-foreground w-16">{t.day}</span>
                      <span className="text-muted-foreground text-xs w-16 text-end">{t.date.slice(5)}</span>
                    </div>

                    <WeatherIcon main={t.condition} size={32} className="flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate capitalize">{t.condition}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-numerals font-medium">{value}</span>
                        <span>{VIEW_CONFIG[view].unit}</span>
                      </div>
                    </div>

                    <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="absolute left-0 right-0 top-full mt-2 p-4 rounded-xl bg-white/5 border border-white/5 animate-fade-in z-10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <Stat label="Min Temp" value={t.tempMin} unit="°C" icon={<CloudSun className="w-4 h-4 text-weather-clear-from" />} size="sm" />
                          <Stat label="Max Temp" value={t.tempMax} unit="°C" icon={<CloudSun className="w-4 h-4 text-orange-400" />} size="sm" />
                          <Stat label="Humidity" value={t.humidity} unit="%" icon={<Droplets className="w-4 h-4 text-cyan-400" />} size="sm" />
                          <Stat label="Wind" value={t.wind} unit="m/s" icon={<Wind className="w-4 h-4 text-indigo-400" />} size="sm" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sparkline full-width if no data */}
            {timeline.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No forecast data available</p>
              </div>
            )}
          </div>
        )}

        {!forecast && !loading && !error && (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="Enter a city to view the 5-day forecast"
            hint="Search by name (e.g. Tokyo, London, New York)"
          />
        )}
      </div>
    </Card>
  );
}
