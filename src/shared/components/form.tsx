import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * =========================================================
 * FORM CONTEXT
 * =========================================================
 */
type FormContextType = {
    errors?: Record<string, string | undefined>;
};

const FormContext = React.createContext<FormContextType | null>(null);

/**
 * =========================================================
 * FIELD CONTEXT
 * =========================================================
 */
type FieldContextType = {
    name: string;
    id: string;
    error?: string;
    helperText?: string;
};

const FieldContext = React.createContext<FieldContextType | null>(null);

/**
 * =========================================================
 * FORM ROOT
 * =========================================================
 */
type FormProps = {
    children: React.ReactNode;
    errors?: Record<string, string | undefined>;
} & React.FormHTMLAttributes<HTMLFormElement>;

export function Form({ children, errors, ...props }: FormProps) {
    return (
        <FormContext.Provider value={{ errors }}>
            <form {...props} className="space-y-4">
                {children}
            </form>
        </FormContext.Provider>
    );
}

/**
 * =========================================================
 * FORM FIELD
 * =========================================================
 */
type FormFieldProps = {
    name: string;
    children: React.ReactNode;
    helperText?: string;
};

export function FormField({ name, children, helperText }: FormFieldProps) {
    const form = React.useContext(FormContext);
    const id = React.useId();

    const error = form?.errors?.[name];

    return (
        <FieldContext.Provider
            value={{
                name,
                id,
                error,
                helperText,
            }}
        >
            <div className="flex flex-col gap-1">{children}</div>
        </FieldContext.Provider>
    );
}

/**
 * =========================================================
 * FORM LABEL
 * =========================================================
 */
type FormLabelProps = {
    children: React.ReactNode;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

export function FormLabel({ children, ...props }: FormLabelProps) {
    const field = React.useContext(FieldContext);

    if (!field) return null;

    return (
        <label htmlFor={field.id} className="text-sm text-black" {...props}>
            {children}
        </label>
    );
}

/**
 * =========================================================
 * FORM CONTROL
 * =========================================================
 */
const controlStyles = cva(
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

type FormControlProps<T extends React.ElementType> = {
    as?: T;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
} & Omit<
    React.ComponentPropsWithoutRef<T>,
    'as' | 'size' | 'prefix' | 'suffix' | 'disabled'
> &
    VariantProps<typeof controlStyles>;

const FormControlInner = <T extends React.ElementType = 'input'>(
    props: FormControlProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const { as, prefix, suffix, size, state, disabled, id, ...rest } = props;

    const field = React.useContext(FieldContext);

    const Component = as || 'input';
    const generatedId = React.useId();
    const inputId = field?.id || id || generatedId;

    const currentState = disabled
        ? 'disabled'
        : field?.error
          ? 'error'
          : state || 'default';

    return (
        <div className={controlStyles({ size, state: currentState })}>
            {prefix && <div className="flex items-center">{prefix}</div>}

            <Component
                ref={ref}
                id={inputId}
                disabled={disabled}
                className={inputStyles({ size })}
                aria-invalid={!!field?.error}
                aria-describedby={
                    field?.error
                        ? `${inputId}-error`
                        : field?.helperText
                          ? `${inputId}-helper`
                          : undefined
                }
                {...rest}
            />

            {suffix && <div className="flex items-center">{suffix}</div>}
        </div>
    );
};

export const FormControl = React.forwardRef(FormControlInner) as <
    T extends React.ElementType = 'input',
>(
    props: FormControlProps<T> & { ref?: React.Ref<any> },
) => React.ReactElement;

/**
 * =========================================================
 * FORM MESSAGE
 * =========================================================
 */
type FormMessageProps = {
    children?: React.ReactNode;
};

export function FormMessage({ children }: FormMessageProps) {
    const field = React.useContext(FieldContext);

    if (!field) return null;

    if (field.error) {
        return (
            <span id={`${field.id}-error`} className="text-sm text-black">
                {field.error}
            </span>
        );
    }

    if (children || field.helperText) {
        return (
            <span id={`${field.id}-helper`} className="text-sm text-black">
                {children || field.helperText}
            </span>
        );
    }

    return null;
}
