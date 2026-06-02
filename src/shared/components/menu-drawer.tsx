import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type MenuItem = {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
};

type Position =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'left-center'
    | 'right-center'
    | 'center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

type BaseProps = {
    trigger?: React.ReactNode;
    items: MenuItem[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    position?: Position;
};

type MenuDrawerProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

type MenuDrawerComponent = {
    <T extends React.ElementType = 'div'>(
        props: MenuDrawerProps<T> & { ref?: React.Ref<any> },
    ): React.ReactElement | null;
    displayName?: string;
};

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva('z-50', {
    variants: {
        position: {
            'top-left': 'fixed top-4 left-4',
            'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
            'top-right': 'fixed top-4 right-4',

            'left-center': 'fixed top-1/2 left-4 -translate-y-1/2',
            'right-center': 'fixed top-1/2 right-4 -translate-y-1/2',

            center: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',

            'bottom-left': 'fixed bottom-4 left-4',
            'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
            'bottom-right': 'fixed bottom-4 right-4',
        },
    },
    defaultVariants: {
        position: 'bottom-left',
    },
});

const triggerStyles = cva(
    'flex items-center gap-2 border border-slate-300 bg-white rounded-sm px-3 py-2 cursor-pointer',
);

const drawerStyles = cva(
    'absolute transform min-w-[160px] border border-slate-200 bg-white rounded-sm shadow-sm transition-all duration-150 ease-out',
    {
        variants: {
            direction: {
                up: 'bottom-full mb-2',
                down: 'top-full mt-2',
            },
            align: {
                left: 'left-0',
                center: 'left-1/2 -translate-x-1/2',
                right: 'right-0',
            },
        },
        defaultVariants: {
            direction: 'down',
            align: 'left',
        },
    },
);

const itemStyles = cva(
    'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none',
    {
        variants: {
            active: {
                true: 'bg-black text-white',
                false: 'bg-white text-black',
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

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

const isBottomPosition = (position: Position) => position.startsWith('bottom');

const getAlign = (position: Position): 'left' | 'center' | 'right' => {
    if (position.includes('center')) return 'center';
    if (position.includes('right')) return 'right';
    return 'left';
};

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const MenuDrawerInner = (
    props: MenuDrawerProps<React.ElementType>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        trigger,
        items,
        value,
        onChange,
        disabled,
        position = 'bottom-left',
        ...rest
    } = props;

    const Component = (as || 'div') as React.ElementType;

    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(items[0]?.value);

    const activeValue = value ?? internalValue;

    const wrapperRef = React.useRef<HTMLDivElement | null>(null);

    const handleSelect = (val: string) => {
        if (value === undefined) setInternalValue(val);
        onChange?.(val);
        setOpen(false);
    };

    const direction = isBottomPosition(position) ? 'up' : 'down';
    const align = getAlign(position);

    // close on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Component ref={ref} className={wrapperStyles({ position })} {...rest}>
            <div ref={wrapperRef}>
                {/* Trigger */}
                <div
                    className={triggerStyles()}
                    onClick={() => !disabled && setOpen((prev) => !prev)}
                >
                    {trigger ?? <span>Menu</span>}
                </div>

                {/* Drawer */}
                {open && (
                    <div
                        className={drawerStyles({
                            direction,
                            align,
                        })}
                    >
                        {items.map((item) => {
                            const isActive = item.value === activeValue;

                            return (
                                <div
                                    key={item.value}
                                    className={itemStyles({
                                        active: isActive,
                                        disabled: disabled || item.disabled,
                                    })}
                                    onClick={() => handleSelect(item.value)}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
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

export const MenuDrawer = React.forwardRef(
    MenuDrawerInner as any,
) as MenuDrawerComponent;

MenuDrawer.displayName = 'MenuDrawer';
