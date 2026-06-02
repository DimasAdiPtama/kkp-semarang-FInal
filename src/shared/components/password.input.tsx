import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * =========================================================
 * STYLES
 * =========================================================
 */
const passwordInputStyles = cva(
    'w-full flex items-center gap-2 border rounded-sm bg-white text-black transition-colors focus-within:border-slate-400',
    {
        variants: {
            size: {
                sm: 'h-8 px-2 text-sm',
                md: 'h-10 px-3 text-sm',
                lg: 'h-12 px-4 text-base',
            },
            state: {
                default: 'border-slate-300',
                error: 'border-slate-400',
                disabled: 'bg-slate-200 border-slate-200 cursor-not-allowed',
            },
        },
        defaultVariants: {
            size: 'md',
            state: 'default',
        },
    },
);

const inputStyles = cva(
    'w-full outline-none bg-transparent placeholder:text-slate-400 disabled:cursor-not-allowed',
    {
        variants: {
            size: {
                sm: 'text-sm',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

/**
 * =========================================================
 * TYPES
 * =========================================================
 */
type PasswordInputProps<T extends React.ElementType> = {
    as?: T;
    label?: string;
    helperText?: string;
    error?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
} & Omit<
    React.ComponentPropsWithoutRef<T>,
    'as' | 'size' | 'prefix' | 'suffix' | 'disabled'
> &
    VariantProps<typeof passwordInputStyles>;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */
const PasswordInputInner = <T extends React.ElementType = 'input'>(
    props: PasswordInputProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        label,
        helperText,
        error,
        prefix,
        suffix,
        size,
        state,
        disabled,
        id,
        ...rest
    } = props;

    const Component = as || 'input';
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const [visible, setVisible] = React.useState(false);

    const currentState = disabled
        ? 'disabled'
        : error
          ? 'error'
          : state || 'default';

    return (
        <div className="w-full flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className="text-sm text-black">
                    {label}
                </label>
            )}

            <div className={passwordInputStyles({ size, state: currentState })}>
                {prefix && <div className="flex items-center">{prefix}</div>}

                <Component
                    ref={ref}
                    id={inputId}
                    type={visible ? 'text' : 'password'}
                    disabled={disabled}
                    className={inputStyles({ size })}
                    aria-invalid={!!error}
                    aria-describedby={
                        error
                            ? `${inputId}-error`
                            : helperText
                              ? `${inputId}-helper`
                              : undefined
                    }
                    {...rest}
                />

                {/* Toggle visibility */}
                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    disabled={disabled}
                    className="text-sm text-black"
                    tabIndex={-1}
                >
                    {visible ? 'Hide' : 'Show'}
                </button>

                {suffix && <div className="flex items-center">{suffix}</div>}
            </div>

            {error ? (
                <span id={`${inputId}-error`} className="text-sm text-black">
                    {error}
                </span>
            ) : helperText ? (
                <span id={`${inputId}-helper`} className="text-sm text-black">
                    {helperText}
                </span>
            ) : null}
        </div>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */
export const PasswordInput = React.forwardRef(PasswordInputInner) as <
    T extends React.ElementType = 'input',
>(
    props: PasswordInputProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement;
