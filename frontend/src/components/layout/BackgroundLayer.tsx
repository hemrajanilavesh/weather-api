import { useCity } from '../../contexts/CityContext';
import { useWeatherGradient } from '../../hooks/useWeatherGradient';

/**
 * Weather-reactive ambient background.
 * Tints the fixed body layer toward the current city's condition gradient
 * (Aurora). Falls back to the default indigo/violet mesh when no city.
 */
export default function BackgroundLayer({ condition }: { condition?: string }) {
    const { city } = useCity();
    const gradient = useWeatherGradient(condition || undefined);

    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 transition-[background] duration-700 ease-out"
            style={{
                background: gradient.aurora,
                opacity: city ? 1 : 0.55,
                // Layer under everything; pointer-events none
                pointerEvents: 'none',
            }}
        />
    );
}