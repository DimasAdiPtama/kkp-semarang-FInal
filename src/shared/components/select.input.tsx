import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Option = {
    label: string;
    value: string;
    disabled?: boolean;
};

type BaseProps = {
    label?: string;
    helperText?: string;
    error?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    options: Option[];
    value?: string | number;
    placeholder?: string;
};

type SelectInputProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

type SelectInputComponent = {
    <T extends React.ElementType = 'div'>(
        props: SelectInputProps<T> & {
            ref?: React.ComponentPropsWithRef<T>['ref'];
        },
    ): React.ReactElement | null;
    displayName?: string;
};

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva('w-full flex flex-col gap-1');

const fieldWrapperStyles = cva(
    'flex items-center rounded-sm border bg-white transition-colors focus-within:border-slate-400',
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

const selectStyles = cva(
    'w-full bg-transparent outline-none text-black appearance-none cursor-pointer',
);

const labelStyles = cva('text-sm text-black');
const helperTextStyles = cva('text-xs text-black');
const iconStyles = cva('ml-2 flex items-center text-black pointer-events-none');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const SelectInputInner = (
    props: SelectInputProps<React.ElementType>,
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
        options,
        placeholder,
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

                <select
                    id={inputId}
                    disabled={disabled}
                    className={selectStyles()}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>

                {suffix ? (
                    <div className="ml-2 flex items-center">{suffix}</div>
                ) : (
                    <div className={iconStyles()}>▼</div>
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
export const SelectInput = React.forwardRef(
    SelectInputInner as any,
) as SelectInputComponent;

SelectInput.displayName = 'SelectInput';
