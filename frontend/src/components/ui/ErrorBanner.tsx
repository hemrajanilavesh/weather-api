import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type BannerTone = 'error' | 'warning' | 'info';

export interface ErrorBannerProps {
    message: string;
    tone?: BannerTone;
    retry?: () => void;
    className?: string;
}

const toneClasses: Record<BannerTone, string> = {
    error: 'bg-destructive/10 border-destructive/25 text-red-200',
    warning: 'bg-amber-500/10 border-amber-500/25 text-amber-200',
    info: 'bg-sky-500/10 border-sky-500/25 text-sky-200',
};

export default function ErrorBanner({ message, tone = 'error', retry, className }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className={clsx(
                'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm',
                toneClasses[tone],
                className,
            )}
        >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{message}</div>
            {retry ? (
                <button
                    onClick={retry}
                    className="text-xs font-semibold uppercase tracking-wide hover:underline shrink-0"
                >
                    Retry
                </button>
            ) : null}
        </div>
    );
}