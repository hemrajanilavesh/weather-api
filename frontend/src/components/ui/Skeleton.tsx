import { clsx } from 'clsx';

export interface SkeletonProps {
    className?: string;
    /** Match layout dimensions of the content being replaced (e.g. "h-8 w-24") */
    as?: 'div' | 'span';
    'aria-busy'?: boolean;
}

export default function Skeleton({ className, as: Tag = 'div', ...rest }: SkeletonProps) {
    return <Tag className={clsx('skeleton rounded-lg', className)} aria-hidden="true" {...rest} />;
}