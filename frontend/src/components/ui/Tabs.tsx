import * as RadixTabs from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Compound tabs wrapper over Radix (state shared via Radix context —
 * matches the "compound components" React guideline from ui-ux-pro-max).
 */
export function Tabs({ value, onValueChange, children, className }: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <RadixTabs.Root
            value={value}
            onValueChange={onValueChange}
            className={className}
        >
            {children}
        </RadixTabs.Root>
    );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <RadixTabs.List
            className={clsx('flex flex-wrap gap-2', className)}
            aria-label="Dashboard sections"
        >
            {children}
        </RadixTabs.List>
    );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
    return (
        <RadixTabs.Trigger
            value={value}
            className={clsx(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                'text-muted-foreground hover:text-foreground hover:bg-white/5',
                'data-[state=active]:text-white data-[state=active]:tab-active',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'active:scale-95',
                className,
            )}
        >
            {children}
        </RadixTabs.Trigger>
    );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
    return (
        <RadixTabs.Content
            value={value}
            className={clsx('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl', className)}
        >
            {children}
        </RadixTabs.Content>
    );
}