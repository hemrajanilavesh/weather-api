import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import WeatherCard from './components/WeatherCard';
import ForecastChart from './components/ForecastChart';
import CityComparison from './components/CityComparison';
import TrendChart from './components/TrendChart';
import Favorites from './components/Favorites';
import BackgroundLayer from './components/layout/BackgroundLayer';
import ContextBar from './components/layout/ContextBar';
import CommandPalette from './components/layout/CommandPalette';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { Cloud, Calendar, GitCompare, BarChart3, Star } from 'lucide-react';

type Tab = 'current' | 'forecast' | 'compare' | 'trends' | 'favorites';

const tabs: { key: Tab; label: string; icon: typeof Cloud }[] = [
  { key: 'current', label: 'Current Weather', icon: Cloud },
  { key: 'forecast', label: 'Forecast', icon: Calendar },
  { key: 'compare', label: 'Compare', icon: GitCompare },
  { key: 'trends', label: 'Trends', icon: BarChart3 },
  { key: 'favorites', label: 'Favorites', icon: Star },
];

/** Tabs that keep the right-rail Favorites panel; Compare + Favorites go full-width */
const FULL_WIDTH_TABS: Tab[] = ['compare', 'favorites'];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null);

  // Global ⌘K / Ctrl+K to open command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSelectCity = (city: string) => {
    setFavoriteCity(city);
    setActiveTab('current');
  };

  const isFullWidth = FULL_WIDTH_TABS.includes(activeTab);

  return (
    <div className="min-h-screen">
      <BackgroundLayer />
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ContextBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="mb-8">
            {tabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className={isFullWidth ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
            <div className={isFullWidth ? '' : 'lg:col-span-2'}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <TabsContent value="current">
                    <WeatherCard key={favoriteCity} />
                  </TabsContent>
                  <TabsContent value="forecast">
                    <ForecastChart key={favoriteCity} />
                  </TabsContent>
                  <TabsContent value="compare">
                    <CityComparison />
                  </TabsContent>
                  <TabsContent value="trends">
                    <TrendChart key={favoriteCity} />
                  </TabsContent>
                  <TabsContent value="favorites">
                    <Favorites onSelectCity={handleSelectCity} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>

            {!isFullWidth && (
              <aside className="lg:col-span-1 space-y-6" aria-label="Favorites">
                <Favorites onSelectCity={handleSelectCity} />
              </aside>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
