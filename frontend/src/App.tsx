import { useState } from 'react';
import Header from './components/Header';
import WeatherCard from './components/WeatherCard';
import ForecastChart from './components/ForecastChart';
import CityComparison from './components/CityComparison';
import TrendChart from './components/TrendChart';
import Favorites from './components/Favorites';
import { Cloud, Calendar, GitCompare, BarChart3, Star } from 'lucide-react';

type Tab = 'current' | 'forecast' | 'compare' | 'trends' | 'favorites';

const tabs: { key: Tab; label: string; icon: typeof Cloud; color: string }[] = [
  { key: 'current', label: 'Current Weather', icon: Cloud, color: 'from-indigo-500 to-purple-500' },
  { key: 'forecast', label: 'Forecast', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
  { key: 'compare', label: 'Compare', icon: GitCompare, color: 'from-purple-500 to-pink-500' },
  { key: 'trends', label: 'Trends', icon: BarChart3, color: 'from-orange-500 to-amber-500' },
  { key: 'favorites', label: 'Favorites', icon: Star, color: 'from-yellow-500 to-orange-500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null);

  const handleSelectCity = (city: string) => {
    setFavoriteCity(city);
    setActiveTab('current');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(({ key, label, icon: Icon, color }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'tab-active text-white'
                    : 'text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.08]'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color} opacity-20`} />
                )}
                <Icon className="relative w-4 h-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'current' && <WeatherCard key={favoriteCity} />}
            {activeTab === 'forecast' && <ForecastChart key={favoriteCity} />}
            {activeTab === 'compare' && <CityComparison />}
            {activeTab === 'trends' && <TrendChart key={favoriteCity} />}
            {activeTab === 'favorites' && <div />}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Favorites onSelectCity={handleSelectCity} />
          </div>
        </div>
      </main>
    </div>
  );
}
