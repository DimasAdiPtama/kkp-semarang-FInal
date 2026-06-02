import React, { type ElementType } from 'react';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Step = {
    id: string;
    label: string;
};

interface BaseWizardProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (index: number) => void;
    disabled?: boolean;
}

type FormWizardProps<T extends ElementType = 'div'> = {
    as?: T;
    ref?: React.Ref<unknown>;
} & BaseWizardProps &
    Omit<
        React.ComponentPropsWithoutRef<T>,
        keyof BaseWizardProps | 'as' | 'children'
    >;

type FormWizardComponent = (<T extends ElementType = 'div'>(
    props: FormWizardProps<T>,
) => React.ReactElement | null) & { displayName?: string };

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const wrapperStyles = cva('w-full flex flex-col gap-4');

const stepItemStyles = cva(
    'flex items-center gap-2 cursor-pointer select-none',
    {
        variants: {
            state: {
                active: 'text-black',
                inactive: 'text-black opacity-50',
                completed: 'text-black',
            },
            disabled: {
                true: 'pointer-events-none opacity-40',
                false: '',
            },
        },
        defaultVariants: {
            state: 'inactive',
            disabled: false,
        },
    },
);

const circleStyles = cva(
    'flex items-center justify-center rounded-sm border text-sm font-medium w-6 h-6',
    {
        variants: {
            state: {
                active: 'bg-black text-white border-black',
                inactive: 'bg-white text-black border-slate-300',
                completed: 'bg-black text-white border-black',
            },
        },
        defaultVariants: {
            state: 'inactive',
        },
    },
);

const lineStyles = cva('flex-1 h-[1px] mx-2', {
    variants: {
        state: {
            active: 'bg-black',
            inactive: 'bg-slate-300',
            completed: 'bg-black',
        },
    },
    defaultVariants: {
        state: 'inactive',
    },
});

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const FormWizardInner = ({
    as,
    steps,
    currentStep,
    onStepClick,
    disabled,
    ref,
    ...rest
}: FormWizardProps<ElementType>) => {
    const Component = (as || 'div') as ElementType;

    const renderSteps = (isMobile: boolean) => (
        <div
            className={
                isMobile
                    ? 'flex md:hidden flex-col gap-2'
                    : 'hidden md:flex items-center w-full'
            }
        >
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const state = isActive
                    ? 'active'
                    : isCompleted
                      ? 'completed'
                      : 'inactive';

                return (
                    <React.Fragment key={step.id}>
                        <div
                            className={stepItemStyles({ state, disabled })}
                            onClick={() => onStepClick?.(index)}
                        >
                            <div className={circleStyles({ state })}>
                                {index + 1}
                            </div>
                            <span className="text-sm">{step.label}</span>
                        </div>

                        {!isMobile && index !== steps.length - 1 && (
                            <div
                                className={lineStyles({
                                    state:
                                        index < currentStep
                                            ? 'completed'
                                            : 'inactive',
                                })}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    return (
        <Component ref={ref} className={wrapperStyles()} {...rest}>
            {renderSteps(false)}
            {renderSteps(true)}
        </Component>
    );
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const FormWizard = FormWizardInner as unknown as FormWizardComponent;

FormWizard.displayName = 'FormWizard';
