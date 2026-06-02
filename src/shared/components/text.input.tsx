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

// Wrapper polymorphic props
type WrapperProps<T extends React.ElementType> = {
    as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | keyof BaseProps>;

// Full TextInput props
type TextInputProps<T extends React.ElementType = 'div'> = BaseProps &
    WrapperProps<T> &
    React.InputHTMLAttributes<HTMLInputElement>;

type TextInputComponent = (<T extends React.ElementType = 'div'>(
    props: TextInputProps<T>,
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

const TextInputInner = <T extends React.ElementType = 'div'>(
    props: TextInputProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as: Wrapper = 'div',
        label,
        helperText,
        error,
        prefix,
        suffix,
        disabled,
        size,
        id,
        type = 'text',
        ...inputProps
    } = props;

    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
        <Wrapper ref={ref} className={wrapperStyles()}>
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
                    type={type}
                    disabled={disabled}
                    className={inputStyles()}
                    {...inputProps}
                />

                {suffix && (
                    <div className="ml-2 flex items-center">{suffix}</div>
                )}
            </div>

            {(helperText || error) && (
                <p className={helperTextStyles()}>{error ?? helperText}</p>
            )}
        </Wrapper>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const TextInput = React.forwardRef(TextInputInner) as TextInputComponent;
TextInput.displayName = 'TextInput';
