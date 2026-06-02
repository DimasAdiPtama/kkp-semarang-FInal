import * as React from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type BaseProps = {
    trigger?: React.ReactNode;
    title?: string;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
};

type ModalProps<T extends React.ElementType = 'div'> = {
    as?: T;
} & BaseProps &
    Omit<React.ComponentPropsWithoutRef<T>, keyof BaseProps | 'as'>;

type ModalComponent = {
    <T extends React.ElementType = 'div'>(
        props: ModalProps<T> & { ref?: React.Ref<any> },
    ): React.ReactElement | null;
    displayName?: string;
};

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const overlayStyles = cva(
    'fixed inset-0 bg-black/40 flex items-center justify-center z-50',
);

const contentStyles = cva(
    'bg-white border border-slate-200 rounded-sm w-full max-w-md p-4 flex flex-col gap-4',
);

const headerStyles = cva('flex items-center justify-between');

const titleStyles = cva('text-sm font-bold text-black');

const closeStyles = cva('text-black cursor-pointer text-sm');

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const ModalInner = <T extends React.ElementType = 'div'>(
    props: ModalProps<T>,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as,
        trigger,
        title,
        children,
        open,
        onOpenChange,
        disabled,
        ...rest
    } = props;

    const Component = (as || 'div') as React.ElementType;

    const [internalOpen, setInternalOpen] = React.useState(false);

    const isOpen = open ?? internalOpen;

    const setOpen = (val: boolean) => {
        if (open === undefined) setInternalOpen(val);
        onOpenChange?.(val);
    };

    return (
        <Component ref={ref} {...rest}>
            {/* Trigger */}
            {trigger && (
                <div
                    onClick={() => !disabled && setOpen(true)}
                    className="inline-block cursor-pointer"
                >
                    {trigger}
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className={overlayStyles()}>
                    <div className={contentStyles()}>
                        {/* Header */}
                        <div className={headerStyles()}>
                            {title && (
                                <span className={titleStyles()}>{title}</span>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setOpen(false)}
                                className={closeStyles()}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="max-h-[70vh] overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const Modal = React.forwardRef(ModalInner) as ModalComponent;

Modal.displayName = 'Modal';
