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
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    value?: string[];
    onChange?: (tags: string[]) => void;
    placeholder?: string;
};

type TagInputProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

type TagInputComponent = (<T extends React.ElementType = 'div'>(
    props: TagInputProps<T>,
) => React.ReactElement | null) & { displayName?: string };

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva('w-full flex flex-col gap-1');

const fieldWrapperStyles = cva(
    'flex flex-wrap items-center gap-2 rounded-sm border bg-white px-2 py-1 focus-within:border-black',
    {
        variants: {
            size: {
                sm: 'min-h-8 text-sm',
                md: 'min-h-10 text-sm',
                lg: 'min-h-12 text-base',
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
    'flex-1 min-w-[80px] bg-transparent outline-none text-black placeholder:text-black/50',
);

const tagStyles = cva(
    'flex items-center gap-1 border border-slate-300 rounded-sm px-2 py-[2px] text-sm bg-white text-black',
);

const removeBtnStyles = cva('cursor-pointer text-black text-xs');

const labelStyles = cva('text-sm text-black');

const helperTextStyles = cva('text-xs text-black');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const TagInputInner = <T extends React.ElementType = 'div'>(
    props: TagInputProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        label,
        helperText,
        error,
        disabled,
        size,
        value,
        onChange,
        placeholder,
        id,
        ...rest
    } = props;

    const Component = (as || 'div') as React.ElementType;
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const [internalTags, setInternalTags] = React.useState<string[]>([]);
    const [inputValue, setInputValue] = React.useState('');

    const tags = value ?? internalTags;

    const updateTags = (newTags: string[]) => {
        if (!value) setInternalTags(newTags);
        onChange?.(newTags);
    };

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (tags.includes(trimmed)) return;
        updateTags([...tags, trimmed]);
        setInputValue('');
    };

    const removeTag = (index: number) => {
        updateTags(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }

        if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

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
                {tags.map((tag, index) => (
                    <div key={index} className={tagStyles()}>
                        <span>{tag}</span>
                        <span
                            className={removeBtnStyles()}
                            onClick={() => removeTag(index)}
                        >
                            ✕
                        </span>
                    </div>
                ))}

                <input
                    id={inputId}
                    ref={ref}
                    disabled={disabled}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={inputStyles()}
                    {...rest}
                />
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

export const TagInput = React.forwardRef(TagInputInner) as TagInputComponent;
TagInput.displayName = 'TagInput';
