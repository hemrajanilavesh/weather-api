import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { clsx } from 'clsx';

export type WeatherKind = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Mist' | 'Clouds';

/** Maps OpenWeather "main" values to an icon + accent classes */
export function weatherKind(main?: string): WeatherKind {
    switch (main) {
        case 'Clear': return 'Clear';
        case 'Clouds': return 'Clouds';
        case 'Rain':
        case 'Drizzle': return 'Rain';
        case 'Snow': return 'Snow';
        case 'Thunderstorm': return 'Thunderstorm';
        case 'Mist':
        case 'Fog':
        case 'Haze':
        case 'Smoke':
        case 'Dust':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado': return 'Mist';
        default: return 'Clouds';
    }
}

const iconMap: Record<WeatherKind, typeof Sun> = {
    Clear: Sun,
    Clouds: Cloud,
    Rain: CloudRain,
    Snow: CloudSnow,
    Thunderstorm: CloudLightning,
    Mist: CloudFog,
};

const accentMap: Record<WeatherKind, string> = {
    Clear: 'text-weather-clear-from',
    Clouds: 'text-weather-clouds-from',
    Rain: 'text-weather-rain-from',
    Snow: 'text-weather-snow-from',
    Thunderstorm: 'text-weather-storm-from',
    Mist: 'text-muted-foreground',
};

export interface WeatherIconProps {
    /** e.g. "Clear" | "Rain" | undefined */
    main?: string;
    size?: number;
    className?: string;
    /** Decorative by default; set true when the icon carries meaning by itself */
    labelled?: boolean;
}

export default function WeatherIcon({ main, size = 48, className, labelled = false }: WeatherIconProps) {
    const kind = weatherKind(main);
    const Icon = iconMap[kind];
    const a11y = labelled ? { role: 'img', 'aria-label': main ?? 'weather' } : { 'aria-hidden': true };

    return (
        <span
            {...a11y}
            className={clsx('inline-flex items-center justify-center shrink-0', accentMap[kind], className)}
        >
            <Icon size={size} strokeWidth={1.5} className="drop-shadow-[0_0_12px_currentColor]" />
        </span>
    );
}