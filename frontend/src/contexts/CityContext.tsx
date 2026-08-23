import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface CityContextValue {
    /** The currently "active" city across the dashboard */
    city: string | null;
    setCity: (city: string | null) => void;
    /** Last time a refresh happened (epoch ms) — for ContextBar's "updated Ns ago" */
    lastUpdated: number;
    markUpdated: () => void;
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: ReactNode }) {
    const [city, setCity] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState(() => Date.now());

    // useMemo per React guideline: stable value reference, memoize context value
    const value = useMemo<CityContextValue>(
        () => ({
            city,
            setCity,
            lastUpdated,
            markUpdated: () => setLastUpdated(Date.now()),
        }),
        [city, lastUpdated],
    );

    return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
    const ctx = useContext(CityContext);
    if (!ctx) throw new Error('useCity must be used within <CityProvider>');
    return ctx;
}