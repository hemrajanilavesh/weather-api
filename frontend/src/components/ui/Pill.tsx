import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface PillProps {
    children: ReactNode;
    tone?: 'accent' | 'muted' | 'warning' | 'destructive' | 'info';
    dot?: boolean;
    pulsing?: boolean;
    className?: string;
}

const toneClasses: Record<NonNullable<PillProps['tone']>, string> = {
    accent: 'bg-accent/10 border-accent/25 text-accent',
    muted: 'bg-white/5 border-white/10 text-muted-foreground',
    warning: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
    destructive: 'bg-destructive/10 border-destructive/25 text-destructive',
    info: 'bg-sky-500/10 border-sky-500/25 text-sky-300',
};

export default function Pill({ children, tone = 'muted', pulsing = false, className }: PillProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
                toneClasses[tone],
                pulsing && 'animate-pulse-glow',
                className,
            )}
        >
            {pulsing ? <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span> : null}
            {children}
        </span>
    );
}