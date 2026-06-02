import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type BaseProps = {
    label?: string;
    value?: string | number;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
};

type StatProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

type StatComponent = (<T extends React.ElementType = 'div'>(
    props: StatProps<T>,
) => React.ReactElement | null) & { displayName?: string };

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva(
    'w-full border border-slate-200 bg-white rounded-sm p-4 flex flex-col gap-2',
);

const headerStyles = cva('flex items-center justify-between');

const labelStyles = cva('text-sm text-black');

const valueStyles = cva('text-2xl font-semibold text-black');

const descriptionStyles = cva('text-xs text-black opacity-70');

const iconStyles = cva('flex items-center justify-center');

const contentStyles = cva('flex flex-col gap-1');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const StatInner = <T extends React.ElementType = 'div'>(
    props: StatProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const { as, label, value, description, icon, disabled, ...rest } = props;

    const Component = (as || 'div') as React.ElementType;

    return (
        <Component
            ref={ref}
            className={wrapperStyles({
                className: disabled ? 'opacity-50 pointer-events-none' : '',
            })}
            {...rest}
        >
            <div className={headerStyles()}>
                {label && <span className={labelStyles()}>{label}</span>}
                {icon && <div className={iconStyles()}>{icon}</div>}
            </div>

            <div className={contentStyles()}>
                {value !== undefined && (
                    <span className={valueStyles()}>{value}</span>
                )}

                {description && (
                    <span className={descriptionStyles()}>{description}</span>
                )}
            </div>
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const Stat = React.forwardRef(StatInner) as StatComponent;

Stat.displayName = 'Stat';
