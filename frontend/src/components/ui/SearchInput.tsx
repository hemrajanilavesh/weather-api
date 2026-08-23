import { useRef, useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    loading?: boolean;
    debounceMs?: number;
    className?: string;
    inputClassName?: string;
}

/**
 * Shared search input with debounced onChange, loading spinner, and clear.
 * Debounce prevents duplicate requests while typing (UX: autocomplete rule).
 * onSearch receives the current value so Enter submits immediately.
 */
export default function SearchInput({
    value,
    onChange,
    onSearch,
    placeholder = 'Search city...',
    loading = false,
    debounceMs = 200,
    className,
    inputClassName,
}: SearchInputProps) {
    const [innerValue, setInnerValue] = useState(value);
    const lastEmitted = useRef(value);
    const timer = useRef<ReturnType<typeof setTimeout>>(null);

    // Sync external value into local state (e.g. context-driven reset)
    useEffect(() => {
        if (value !== lastEmitted.current) {
            setInnerValue(value);
            lastEmitted.current = value;
        }
    }, [value]);

    const handleChange = (next: string) => {
        setInnerValue(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            lastEmitted.current = next;
            onChange(next);
        }, debounceMs);
    };

    const handleSubmit = () => {
        if (timer.current) clearTimeout(timer.current);
        lastEmitted.current = innerValue;
        onChange(innerValue);
        onSearch?.(innerValue);
    };

    return (
        <div className={clsx('relative flex-1', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
                type="text"
                value={innerValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={placeholder}
                aria-label={placeholder}
                className={clsx(
                    'input-glass w-full pl-10 pr-10 py-2.5 rounded-xl text-foreground placeholder-muted-foreground outline-none',
                    inputClassName,
                )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value ? (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            setInnerValue('');
                            lastEmitted.current = '';
                            onChange('');
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : null}
                {loading ? <Loader2 className="w-4 h-4 text-accent animate-spin" /> : null}
            </span>
        </div>
    );
}