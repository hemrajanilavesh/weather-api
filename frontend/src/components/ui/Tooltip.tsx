import * as RadixTooltip from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
    return <RadixTooltip.Provider delayDuration={150} skipDelayDuration={300}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children, side = 'top' }: {
    content: ReactNode;
    children: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
}) {
    if (!content) return <>{children}</>;
    return (
        <RadixTooltip.Root>
            <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
            <RadixTooltip.Portal>
                <RadixTooltip.Content
                    side={side}
                    sideOffset={6}
                    className={clsx(
                        'z-50 rounded-lg px-3 py-1.5 text-xs font-medium',
                        'bg-primary text-on-primary border border-white/10 shadow-xl',
                        'animate-in fade-in-0 zoom-in-95',
                    )}
                >
                    {content}
                    <RadixTooltip.Arrow className="fill-primary" />
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
}