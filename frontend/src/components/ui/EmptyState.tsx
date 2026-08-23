import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    hint?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({ icon, title, hint, action, className }: EmptyStateProps) {
    return (
        <div className={clsx('flex flex-col items-center justify-center py-14 text-center', className)}>
            {icon ? (
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mb-4">
                    {icon}
                </div>
            ) : null}
            <p className="text-foreground font-medium">{title}</p>
            {hint ? <p className="text-muted-foreground text-sm mt-1 max-w-xs">{hint}</p> : null}
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}