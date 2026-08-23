import { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { Search, MapPin, X, Clock, Star, ChevronRight, Loader2 } from 'lucide-react';
import { useCity } from '../../contexts/CityContext';
import { useFavorites } from '../../hooks/useFavorites';

const POPULAR_CITIES = ['Tokyo', 'London', 'New York', 'Paris', 'Sydney', 'Reykjavik', 'Singapore', 'Dubai', 'Berlin', 'Toronto'];

const ACTIONS = [
    { id: 'forecast', label: 'Open Forecast', hint: 'Go to the 5-day forecast', shortcut: 'F' },
    { id: 'trends', label: 'Open Trends', hint: 'Analyze temperature & humidity trends', shortcut: 'T' },
    { id: 'compare', label: 'Open Compare', hint: 'Compare cities side-by-side', shortcut: 'C' },
] as const;

export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    const { city, setCity, markUpdated } = useCity();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const [query, setQuery] = useState('');
    const [recent, setRecent] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('weather-recent-searches');
            if (stored) setRecent(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    // Persist recent searches
    const addRecent = (name: string) => {
        const next = [name, ...recent.filter((r) => r !== name)].slice(0, 5);
        setRecent(next);
        try { localStorage.setItem('weather-recent-searches', JSON.stringify(next)); } catch { /* ignore */ }
    };

    // Auto-focus input when palette opens
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                onOpenChange(false);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                onOpenChange(false);
                return;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onOpenChange]);

    const handleSelectCity = (name: string) => {
        setCity(name);
        markUpdated();
        addRecent(name);
        onOpenChange(false);
    };

    const debouncedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

    const filtered = useMemo(() => {
        if (!debouncedQuery) return POPULAR_CITIES;
        return POPULAR_CITIES.filter((s) => s.toLowerCase().includes(debouncedQuery));
    }, [debouncedQuery]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />
                <Dialog.Content className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[min(92vw,600px)] z-50 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl animate-fade-in">
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search cities, view forecast, compare..."
                                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-muted/50 border border-white/5 text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <kbd className="px-2 py-1 rounded bg-muted/50 border border-white/5 text-xs text-muted-foreground font-mono">⌘K</kbd>
                        </div>

                        <Command className="flex-1 overflow-hidden">
                            <Command.Input value={query} className="sr-only" />
                            <Command.List className="max-h-[60vh] overflow-auto">
                                <Command.Empty className="py-8 px-4 text-center text-muted-foreground">
                                    {query.trim() ? (
                                        <>
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                                <span>Searching for &ldquo;{query}&rdquo;...</span>
                                            </div>
                                            <p className="text-xs">Press Enter to search or select a suggestion</p>
                                        </>
                                    ) : (
                                        <>
                                            <Star className="w-6 h-6 mx-auto mb-2 opacity-30" />
                                            <p>Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono">⌘K</kbd> to open</p>
                                        </>
                                    )}
                                </Command.Empty>

                                {query.trim() && (
                                    <Command.Group heading="Actions">
                                        {ACTIONS.map((a) => (
                                            <Command.Item
                                                key={a.id}
                                                onSelect={() => {
                                                    onOpenChange(false);
                                                    setTimeout(() => {
                                                        const tabs = document.querySelector('[role="tablist"]');
                                                        const tab = tabs?.querySelector(`[data-tab="${a.id}"]`) as HTMLElement;
                                                        tab?.click();
                                                    }, 0);
                                                }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                                                    <p className="text-xs text-muted-foreground">{a.hint}</p>
                                                </div>
                                                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-muted-foreground">{a.shortcut}</kbd>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Favorite cities */}
                                {favorites.length > 0 && (
                                    <Command.Group heading="Favorites">
                                        {favorites
                                            .filter((f) => !debouncedQuery || f.toLowerCase().includes(debouncedQuery))
                                            .map((fav) => (
                                                <Command.Item
                                                    key={fav}
                                                    onSelect={() => handleSelectCity(fav)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-foreground">{fav}</p>
                                                        <p className="text-xs text-muted-foreground">Favorite city</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }}
                                                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors"
                                                        aria-label={isFavorite(fav) ? 'Remove from favorites' : 'Add to favorites'}
                                                    >
                                                        <Star className={`w-4 h-4 ${isFavorite(fav) ? 'fill-amber-400' : ''}`} />
                                                    </button>
                                                </Command.Item>
                                            ))}
                                    </Command.Group>
                                )}

                                {/* Recent searches */}
                                {recent.length > 0 && (
                                    <Command.Group heading="Recent">
                                        {recent
                                            .filter((r) => !debouncedQuery || r.toLowerCase().includes(debouncedQuery))
                                            .map((r) => (
                                                <Command.Item
                                                    key={r}
                                                    onSelect={() => handleSelectCity(r)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    <p className="text-sm font-medium text-foreground">{r}</p>
                                                </Command.Item>
                                            ))}
                                    </Command.Group>
                                )}

                                {/* Popular cities */}
                                {filtered.length > 0 && (
                                    <Command.Group heading="Popular Cities">
                                        {filtered.map((c) => (
                                            <Command.Item
                                                key={c}
                                                onSelect={() => handleSelectCity(c)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <p className="text-sm font-medium text-foreground">{c}</p>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}

                                {city && (
                                    <div className="px-3 py-2 text-xs text-muted-foreground/70 border-t border-white/5">
                                        Selected city: <span className="text-foreground font-medium">{city}</span>
                                    </div>
                                )}
                            </Command.List>
                        </Command>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
