import { useEffect, useRef, useState } from 'react';

/**
 * Animated count-up for numbers — uses requestAnimationFrame easing.
 * Instantly settles when prefers-reduced-motion is on.
 */
export function useCountUp(target: number, duration = 700, decimals = 0) {
    const [value, setValue] = useState(target);
    const frame = useRef<number>(0);
    const from = useRef(target);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || target === from.current) {
            setValue(target);
            from.current = target;
            return;
        }

        const start = from.current;
        const delta = target - start;
        const t0 = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            setValue(start + delta * easeOutCubic(p));
            if (p < 1) frame.current = requestAnimationFrame(tick);
            else from.current = target;
        };

        frame.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame.current);
    }, [target, duration]);

    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

export default useCountUp;