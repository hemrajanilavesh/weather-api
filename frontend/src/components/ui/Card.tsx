import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'default' | 'hero' | 'compact' | 'inset';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    interactive?: boolean;
}

const variantClasses: Record<Variant, string> = {
    default: 'glass-card p-6',
    hero: 'glass-card p-6 md:p-8 relative overflow-hidden',
    compact: 'glass-card p-4',
    inset: 'bg-card/60 border border-white/5 rounded-xl p-4',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', interactive = false, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    variantClasses[variant],
                    interactive && 'cursor-pointer hover:border-white/15 transition-all duration-300',
                    className,
                )}
                {...props}
            />
        );
    },
);
Card.displayName = 'Card';

export default Card;