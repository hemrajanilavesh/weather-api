import { useEffect, useState } from 'react';

export interface GradientStop {
    from: string;
    to: string;
}

const GRADIENTS: Record<string, GradientStop> = {
    Clear: { from: '#fbbf24', to: '#fb7185' },
    Clouds: { from: '#64748b', to: '#94a3b8' },
    Rain: { from: '#38bdf8', to: '#6366f1' },
    Snow: { from: '#e0e7ff', to: '#818cf8' },
    Thunderstorm: { from: '#4338ca', to: '#1e1b4b' },
    Mist: { from: '#475569', to: '#94a3b8' },
    default: { from: 'rgba(99,102,241,0.6)', to: 'rgba(168,85,247,0.5)' },
};

/** Maps an OpenWeather "main" condition to a hero gradient style object. */
export function weatherGradient(main?: string) {
    const g = GRADIENTS[main ?? ''] ?? GRADIENTS.default;
    return {
        from: g.from,
        to: g.to,
        backgroundImage: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
        // Multi-layer radial "aurora" mesh for the app background
        aurora: `radial-gradient(ellipse 80% 50% at 20% 20%, ${g.from}33 0%, transparent 60%),
             radial-gradient(ellipse 60% 40% at 80% 80%, ${g.to}2e 0%, transparent 60%)`,
    };
}

/** Hook that returns the weather gradient for a condition, with reduced-motion-safe settle. */
export function useWeatherGradient(main?: string) {
    const [gradient, setGradient] = useState(() => weatherGradient(main));
    useEffect(() => {
        setGradient(weatherGradient(main));
    }, [main]);
    return gradient;
}