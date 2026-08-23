import { useEffect, useRef, useState } from 'react';
import { Search, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Loader2, MapPin } from 'lucide-react';
import type { CurrentWeatherResponse } from '../types/weather';
import { fetchCurrentWeather } from '../services/api';
import { useCity } from '../contexts/CityContext';
import { useWeatherGradient } from '../hooks/useWeatherGradient';
import useCountUp from '../hooks/useCountUp';
import Card from './ui/Card';
import Stat from './ui/Stat';
import WeatherIcon from './ui/WeatherIcon';
import SearchInput from './ui/SearchInput';
import EmptyState from './ui/EmptyState';
import ErrorBanner from './ui/ErrorBanner';

/** Simple sun arc SVG for sunrise/sunset visualization */
function SunArc({ sunrise, sunset, currentTime }: { sunrise?: number; sunset?: number; currentTime?: number }) {
  // If no times provided, don't render
  if (!sunrise || !sunset) return null;

  const dayProgress = currentTime
    ? Math.min(1, Math.max(0, (currentTime - sunrise) / (sunset - sunrise)))
    : 0.5;

  const cx = 120;
  const cy = 100;
  const r = 80;
  const startAngle = -Math.PI;
  const endAngle = 0;
  const currentAngle = startAngle + (endAngle - startAngle) * dayProgress;
  const x = cx + r * Math.cos(currentAngle);
  const y = cy + r * Math.sin(currentAngle);

  return (
    <svg viewBox="0 0 240 120" className="w-full h-20 mx-auto" aria-hidden="true">
      {/* Arc path */}
      <path
        d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity={0.3}
        className="text-muted-foreground"
      />
      {/* Sun position */}
      <circle
        cx={x}
        cy={y}
        r="8"
        fill="currentColor"
        className="text-weather-clear-from drop-shadow-[0_0_8px_currentColor]"
      />
      {/* Sunrise/sunset labels */}
      <text x={cx - r - 4} y={cy + 4} fontSize="8" fill="currentColor" textAnchor="end" className="text-muted-foreground">Sunrise</text>
      <text x={cx + r + 4} y={cy + 4} fontSize="8" fill="currentColor" textAnchor="start" className="text-muted-foreground">Sunset</text>
    </svg>
  );
}

export default function WeatherCard() {
  const { city: contextCity, setCity, markUpdated } = useCity();
  const [city, setCityInput] = useState('');
  const [weather, setWeather] = useState<CurrentWeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initializedRef = useRef(false);

  // Use context city as initial value (once)
  useEffect(() => {
    if (!initializedRef.current && contextCity) {
      initializedRef.current = true;
      setCityInput(contextCity);
    }
  }, [contextCity]);

  const gradient = useWeatherGradient(weather?.conditions[0]?.main);

  const handleSearch = async (searchCity?: string) => {
    const targetCity = (searchCity ?? city).trim();
    if (!targetCity) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchCurrentWeather(targetCity);
      setWeather(data);
      setCity(targetCity);
      markUpdated();
    } catch {
      setError('City not found. Try a different name.');
    } finally {
      setLoading(false);
    }
  };

  const animatedTemp = useCountUp(weather?.temperature.current ?? 0, 700);
  const animatedFeelsLike = useCountUp(weather?.temperature.feels_like ?? 0, 700, 1);
  const animatedHumidity = useCountUp(weather?.humidity ?? 0, 600);
  const animatedWind = useCountUp(weather?.wind.speed ?? 0, 600, 1);
  const animatedVisibility = useCountUp((weather?.visibility ?? 0) / 1000, 600, 1);
  const animatedPressure = useCountUp(weather?.pressure ?? 0, 600);
  const animatedUV = useCountUp(0, 600, 1); // UV not in API yet; placeholder

  return (
    <Card variant="hero" className="relative overflow-hidden animate-fade-in" style={{ backgroundImage: gradient.backgroundImage }}>
      {/* Subtle weather-condition glow overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${gradient.from}33 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-numerals font-bold">01</span>
            Current Weather
          </h2>
          {weather && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{weather.city}</span>
              {weather.country && <span className="text-muted-foreground">, {weather.country}</span>}
            </div>
          )}
        </div>

        {/* Search */}
        <SearchInput
          value={city}
          onChange={setCityInput}
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
              <span className="text-muted-foreground">Loading weather…</span>
            </div>
          </div>
        )}

        {weather && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero: temp + condition */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <WeatherIcon main={weather.conditions[0]?.main} size={64} labelled />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">
                    {weather.city}
                    {weather.country && (
                      <span className="text-foreground/40 text-xl font-normal ml-2">, {weather.country}</span>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm capitalize mt-0.5">
                    {weather.conditions[0]?.description}
                  </p>
                </div>
              </div>

              <div className="text-right md:text-left">
                <div className="flex items-baseline gap-2">
                  <span className="font-numerals text-6xl font-light text-foreground leading-none">
                    {animatedTemp}°
                  </span>
                  <span className="font-numerals text-xl font-medium text-muted-foreground self-end">
                    Feels like {animatedFeelsLike}°
                  </span>
                </div>
                <div className="text-muted-foreground text-xs mt-1 font-medium flex items-center gap-3">
                  <span>H:{Math.round(weather.temperature.max)}°</span>
                  <span>L:{Math.round(weather.temperature.min)}°</span>
                </div>
              </div>
            </div>

            {/* Sun arc (placeholder — real data would come from API) */}
            <div className="rounded-xl bg-white/5 border border-white/5 p-4">
              <SunArc
                sunrise={weather.timestamp ? Date.parse(weather.timestamp) - 6 * 3600 * 1000 : undefined}
                sunset={weather.timestamp ? Date.parse(weather.timestamp) + 18 * 3600 * 1000 : undefined}
                currentTime={weather.timestamp ? Date.parse(weather.timestamp) : undefined}
              />
            </div>

            {/* 6-tile stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Stat
                label="Temperature"
                value={animatedTemp}
                unit="°C"
                icon={<Thermometer className="w-4 h-4 text-weather-clear-from" />}
                size="md"
              />
              <Stat
                label="Feels like"
                value={animatedFeelsLike}
                unit="°C"
                icon={<Thermometer className="w-4 h-4 text-orange-400" />}
                accent="accent"
                size="md"
              />
              <Stat
                label="Humidity"
                value={animatedHumidity}
                unit="%"
                icon={<Droplets className="w-4 h-4 text-cyan-400" />}
                size="md"
              />
              <Stat
                label="Wind"
                value={animatedWind}
                unit="m/s"
                icon={<Wind className="w-4 h-4 text-indigo-400" />}
                size="md"
              />
              <Stat
                label="Visibility"
                value={animatedVisibility}
                unit="km"
                icon={<Eye className="w-4 h-4 text-emerald-400" />}
                size="md"
              />
              {/* Pressure - gated on optional field */}
              {weather.pressure ? (
                <Stat
                  label="Pressure"
                  value={animatedPressure}
                  unit="hPa"
                  icon={<Gauge className="w-4 h-4 text-amber-400" />}
                  size="md"
                />
              ) : (
                <Stat
                  label="UV Index"
                  value={animatedUV}
                  unit=""
                  icon={<Sun className="w-4 h-4 text-yellow-400" />}
                  accent="muted"
                  size="md"
                />
              )}
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="Enter a city to see current weather"
            hint="Search by name (e.g. Tokyo, London, New York)"
          />
        )}
      </div>
    </Card>
  );
}
