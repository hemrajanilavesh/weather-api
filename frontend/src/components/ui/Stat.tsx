import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface StatProps {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    unit?: string;
    accent?: 'default' | 'accent' | 'muted' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const accentText: Record<NonNullable<StatProps['accent']>, string> = {
    default: 'text-foreground',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive',
};

const sizeValue: Record<NonNullable<StatProps['size']>, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
};

export default function Stat({ label, value, icon, unit, accent = 'default', size = 'md', className }: StatProps) {
    return (
        <div className={clsx('stat-tile p-4 flex flex-col gap-1', className)}>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {icon}
                <span>{label}</span>
            </div>
            <div className={clsx('flex items-baseline gap-1', sizeValue[size], accentText[accent])}>
                <span className="font-numerals font-semibold leading-none">{value}</span>
                {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
            </div>
        </div>
    );
}