import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type TabItem = {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
};

type BaseProps = {
    tabs: TabItem[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
};

type MenuTabProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseProps | 'as' | 'children'
    >;

// Perbaikan: Tambahkan signature displayName ke dalam tipe komponen
type MenuTabComponent = {
    <T extends React.ElementType = 'div'>(
        props: MenuTabProps<T> & {
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

const wrapperStyles = cva(
    'flex items-center border border-slate-200 rounded-sm bg-white overflow-hidden',
);

const tabStyles = cva(
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

const iconStyles = cva('flex items-center justify-center');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */
const MenuTabInner = (
    props: MenuTabProps<React.ElementType>,
    ref: React.ForwardedRef<any>,
) => {
    const { as, tabs, value, onChange, disabled, ...rest } = props;

    const Component = (as || 'div') as React.ElementType;

    const [internalValue, setInternalValue] = React.useState(tabs[0]?.value);

    const activeValue = value ?? internalValue;

    const handleChange = (val: string) => {
        if (value === undefined) setInternalValue(val);
        onChange?.(val);
    };

    return (
        <Component ref={ref} className={wrapperStyles()} {...rest}>
            {tabs.map((tab) => {
                const isActive = tab.value === activeValue;

                return (
                    <div
                        key={tab.value}
                        className={tabStyles({
                            active: isActive,
                            disabled: disabled || tab.disabled,
                        })}
                        onClick={(e) => {
                            e.stopPropagation(); // ✨ hentikan propagation agar modal tidak close
                            handleChange(tab.value);
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // ✨ aman untuk modal yang mendeteksi mousedown
                    >
                        {tab.icon && (
                            <span className={iconStyles()}>{tab.icon}</span>
                        )}
                        <span>{tab.label}</span>
                    </div>
                );
            })}
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */
export const MenuTab = React.forwardRef(
    MenuTabInner as any,
) as MenuTabComponent;

MenuTab.displayName = 'MenuTab';
