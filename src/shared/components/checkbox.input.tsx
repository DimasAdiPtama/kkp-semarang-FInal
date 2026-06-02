import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * =========================================================
 * STYLES
 * =========================================================
 */
const checkboxWrapperStyles = cva('inline-flex items-center gap-2 text-black', {
    variants: {
        size: {
            sm: 'text-sm',
            md: 'text-sm',
            lg: 'text-base',
        },
        state: {
            default: '',
            disabled: 'cursor-not-allowed text-slate-400',
        },
    },
    defaultVariants: {
        size: 'md',
        state: 'default',
    },
});

const checkboxBoxStyles = cva(
    'flex items-center justify-center border rounded-sm transition-colors',
    {
        variants: {
            size: {
                sm: 'h-4 w-4',
                md: 'h-5 w-5',
                lg: 'h-6 w-6',
            },
            checked: {
                true: 'bg-black border-black',
                false: 'bg-white border-slate-300',
            },
            state: {
                default: '',
                disabled: 'bg-slate-200 border-slate-200',
            },
        },
        defaultVariants: {
            size: 'md',
            checked: false,
            state: 'default',
        },
    },
);

/**
 * =========================================================
 * TYPES
 * =========================================================
 */
type CheckboxInputProps<T extends React.ElementType> = {
    as?: T;
    label?: string;
    helperText?: string;
    error?: string;
    disabled?: boolean;

    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<
    React.ComponentPropsWithoutRef<T>,
    'as' | 'size' | 'disabled' | 'checked' | 'defaultChecked' | 'onChange'
> &
    VariantProps<typeof checkboxWrapperStyles> &
    VariantProps<typeof checkboxBoxStyles>;

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */
const CheckboxInputInner = <T extends React.ElementType = 'input'>(
    props: CheckboxInputProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        label,
        helperText,
        error,
        disabled,
        size,
        state,
        id,
        checked,
        defaultChecked,
        onChange,
        ...rest
    } = props;

    const Component = as || 'input';
    const generatedId = React.useId();
    const inputId = id || generatedId;

    /**
     * =========================================================
     * CONTROLLED / UNCONTROLLED HANDLING
     * =========================================================
     */
    const isControlled = checked !== undefined;

    const [internalChecked, setInternalChecked] = React.useState(
        defaultChecked ?? false,
    );

    const isChecked = isControlled ? checked! : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
            setInternalChecked(e.target.checked);
        }

        onChange?.(e);
    };

    const currentState = disabled ? 'disabled' : state || 'default';

    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={inputId}
                className={checkboxWrapperStyles({ size, state: currentState })}
            >
                <span
                    className={checkboxBoxStyles({
                        size,
                        checked: !!isChecked,
                        state: currentState,
                    })}
                >
                    {isChecked && <span className="text-white text-xs">✓</span>}
                </span>

                <Component
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    disabled={disabled}
                    checked={isChecked}
                    onChange={handleChange}
                    className="sr-only"
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

                {label && <span>{label}</span>}
            </label>

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
export const CheckboxInput = React.forwardRef(CheckboxInputInner) as <
    T extends React.ElementType = 'input',
>(
    props: CheckboxInputProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement;
