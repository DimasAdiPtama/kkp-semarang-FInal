import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * TYPES
 */
type MenuItemProps = {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    badge?: number | string; // angka atau string opsional di sebelah icon
    active?: boolean;
    disabled?: boolean;
    href?: string;
};

/**
 * STYLES
 */
const itemStyles = cva(
    'flex flex-col items-center justify-center p-4 border rounded-sm cursor-pointer select-none transition-colors duration-150 h-48',
    {
        variants: {
            active: {
                true: 'bg-black text-white border-slate-400',
                false: 'bg-white text-black border-slate-300 hover:bg-slate-200',
            },
            disabled: {
                true: 'opacity-50 pointer-events-none',
                false: '',
            },
        },
        defaultVariants: {
            active: false,
            disabled: false,
        },
    },
);

const descriptionStyles = cva(
    'text-sm text-slate-500 text-center mt-1 overflow-hidden text-ellipsis',
    {
        variants: {
            clamp: {
                true: 'line-clamp-3',
                false: '',
            },
        },
        defaultVariants: {
            clamp: true,
        },
    },
);

const badgeStyles = cva(
    'ml-2 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full',
);

/**
 * COMPONENT
 */
const MenuItemInner = (
    {
        title,
        description,
        icon,
        badge,
        active,
        disabled,
        href,
        className,
        ...props
    }: MenuItemProps & { className?: string },
    ref: React.ForwardedRef<HTMLAnchorElement | HTMLDivElement>,
) => {
    const Component = href ? 'a' : 'div';

    return (
        <Component
            ref={ref as any}
            href={href}
            className={itemStyles({ active, disabled, className })}
            {...props}
        >
            {/* Icon + Badge */}
            {icon && (
                <div className="mb-2 flex items-center relative">
                    {icon}
                    {badge !== undefined && (
                        <span className={badgeStyles()}>{badge}</span>
                    )}
                </div>
            )}

            {/* Title & Description */}
            <div className="flex flex-col items-center justify-start">
                <h3 className="font-semibold text-lg text-center">{title}</h3>
                {description && (
                    <p className={descriptionStyles()} title={description}>
                        {description}
                    </p>
                )}
            </div>
        </Component>
    );
};

/**
 * EXPORT
 */
export const MenuItem = React.forwardRef(MenuItemInner);
MenuItem.displayName = 'MenuItem';

export default MenuItem;
