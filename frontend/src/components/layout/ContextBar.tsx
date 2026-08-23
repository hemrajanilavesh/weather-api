import { useCity } from '../../contexts/CityContext';
import Pill from '../ui/Pill';
import { useEffect, useState } from 'react';

function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(t);
    }, [intervalMs]);
    return now;
}

/**
 * Context bar under the header: current city + live/cache status.
 * Follows the Real-Time pattern: "live only when backed by a current source,
 * with update time and stale state."
 */
export default function ContextBar() {
    const { city, lastUpdated } = useCity();
    const now = useNow();
    const secondsAgo = Math.max(0, Math.round((now - lastUpdated) / 1000));

    if (!city) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-4 mb-6">
            <Pill tone="accent" pulsing dot>Live</Pill>
            <span className="font-medium text-foreground">{city}</span>
            <span aria-hidden="true">·</span>
            <span>
                Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
            </span>
        </div>
    );
}