import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * =========================================================
 * STYLES
 * =========================================================
 */
const buttonStyles = cva(
    'inline-flex items-center justify-center gap-2 rounded-sm border text-sm transition-colors focus:outline-none focus-visible:border-slate-400 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                solid: 'bg-black text-white border-black',
                outline: 'bg-white text-black border-slate-300',
                ghost: 'bg-white text-black border-transparent',
            },
            size: {
                sm: 'h-8 px-3 text-sm',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
            },
            state: {
                default: '',
                disabled: 'bg-slate-200 border-slate-200 text-black',
            },
            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'solid',
            size: 'md',
            state: 'default',
            fullWidth: false,
        },
    },
);

/**
 * =========================================================
 * TYPES
 * =========================================================
 */
type ButtonProps<T extends React.ElementType> = {
    as?: T;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
} & Omit<
    React.ComponentPropsWithoutRef<T>,
    'as' | 'size' | 'prefix' | 'suffix' | 'disabled'
> &
    VariantProps<typeof buttonStyles>;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */
const ButtonInner = <T extends React.ElementType = 'button'>(
    props: ButtonProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        children,
        prefix,
        suffix,
        loading,
        disabled,
        variant,
        size,
        state,
        fullWidth,
        ...rest
    } = props;

    const Component = as || 'button';

    const isDisabled = disabled || loading;

    const currentState = isDisabled ? 'disabled' : state || 'default';

    return (
        <Component
            ref={ref}
            disabled={isDisabled}
            className={buttonStyles({
                variant,
                size,
                state: currentState,
                fullWidth,
            })}
            {...rest}
        >
            {loading ? (
                <span className="text-black">Loading...</span>
            ) : (
                <>
                    {prefix && (
                        <span className="flex items-center">{prefix}</span>
                    )}
                    {children}
                    {suffix && (
                        <span className="flex items-center">{suffix}</span>
                    )}
                </>
            )}
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */
export const Button = React.forwardRef(ButtonInner) as <
    T extends React.ElementType = 'button',
>(
    props: ButtonProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement;
