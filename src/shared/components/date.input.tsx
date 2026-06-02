import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type BaseProps = {
    label?: string;
    helperText?: string;
    error?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

type DateInputProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    > &
    React.InputHTMLAttributes<HTMLInputElement>;

type DateInputComponent = (<T extends React.ElementType = 'div'>(
    props: DateInputProps<T>,
) => React.ReactElement | null) & { displayName?: string };

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva('w-full flex flex-col gap-1');

const fieldWrapperStyles = cva(
    'flex items-center rounded-sm border bg-white focus-within:border-black',
    {
        variants: {
            size: {
                sm: 'h-8 text-sm px-2',
                md: 'h-10 text-sm px-3',
                lg: 'h-12 text-base px-3',
            },
            disabled: {
                true: 'opacity-50 pointer-events-none',
                false: '',
            },
            error: {
                true: 'border-black',
                false: 'border-slate-300',
            },
        },
        defaultVariants: {
            size: 'md',
            disabled: false,
            error: false,
        },
    },
);

const inputStyles = cva(
    'w-full bg-transparent outline-none text-black placeholder:text-black/50',
);

const labelStyles = cva('text-sm text-black');

const helperTextStyles = cva('text-xs text-black');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const DateInputInner = <T extends React.ElementType = 'div'>(
    props: DateInputProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        label,
        helperText,
        error,
        prefix,
        suffix,
        disabled,
        size,
        id,
        ...rest
    } = props;

    const Component = (as || 'div') as React.ElementType;
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
        <Component ref={ref} className={wrapperStyles()}>
            {label && (
                <label htmlFor={inputId} className={labelStyles()}>
                    {label}
                </label>
            )}

            <div
                className={fieldWrapperStyles({
                    size,
                    disabled,
                    error: !!error,
                })}
            >
                {prefix && (
                    <div className="mr-2 flex items-center">{prefix}</div>
                )}

                <input
                    id={inputId}
                    type="date"
                    disabled={disabled}
                    className={inputStyles()}
                    {...rest}
                />

                {suffix && (
                    <div className="ml-2 flex items-center">{suffix}</div>
                )}
            </div>

            {(helperText || error) && (
                <p className={helperTextStyles()}>
                    {error ? error : helperText}
                </p>
            )}
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const DateInput = React.forwardRef(DateInputInner) as DateInputComponent;

DateInput.displayName = 'DateInput';
