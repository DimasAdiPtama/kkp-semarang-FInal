import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type BaseProps = {
    disabled?: boolean;
    variant?: 'rect' | 'text' | 'circle';
    animate?: boolean;
};

type SkeletonProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

type SkeletonComponent = (<T extends React.ElementType = 'div'>(
    props: SkeletonProps<T>,
) => React.ReactElement | null) & { displayName?: string };

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const skeletonStyles = cva('bg-slate-200 rounded-sm relative overflow-hidden', {
    variants: {
        variant: {
            rect: '',
            text: 'h-4 w-full',
            circle: 'rounded-full',
        },
        animate: {
            true: 'before:absolute before:inset-0 before:animate-pulse before:bg-white/40',
            false: '',
        },
        disabled: {
            true: 'opacity-50',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'rect',
        animate: true,
        disabled: false,
    },
});

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const SkeletonInner = <T extends React.ElementType = 'div'>(
    props: SkeletonProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const { as, variant, animate, disabled, className, ...rest } = props;

    const Component = (as || 'div') as React.ElementType;

    return (
        <Component
            ref={ref}
            aria-hidden="true"
            className={skeletonStyles({
                variant,
                animate,
                disabled,
                className,
            })}
            {...rest}
        />
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const Skeleton = React.forwardRef(SkeletonInner) as SkeletonComponent;

Skeleton.displayName = 'Skeleton';
