import { useEffect, useState } from 'react';

/** Returns `value` only after `delay` ms of no change. */
export function useDebounced<T>(value: T, delay = 200): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default useDebounced;