import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { FaMobileAlt, FaHeadset } from 'react-icons/fa';

type ServiceType =
    | 'smkhp-offline'
    | 'smkhp-online'
    | 'customer-service-offline'
    | 'customer-service-online'
    | 'laboratorium-umum'
    | 'laboratorium-c';

type QueueStatus = 'Pending' | 'Menunggu' | 'Diproses' | 'Meeting' | 'Selesai';

type BaseProps = {
    token: string;
    queue: number;
    name: string;
    subtitle: string;
    serviceType: ServiceType;
    status: QueueStatus;
    onAction?: (() => void) | React.ReactNode;
    onRecall?: () => void;
    disabled?: boolean;
};

type AsProp<T extends React.ElementType> = {
    as?: T;
};

type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P);

type PolymorphicComponentProps<
    T extends React.ElementType,
    Props = object,
> = Props &
    AsProp<T> &
    Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

type PolymorphicRef<T extends React.ElementType> =
    React.ComponentPropsWithRef<T>['ref'];

type ItemQueueComponent = <T extends React.ElementType = 'div'>(
    props: PolymorphicComponentProps<
        T,
        BaseProps & VariantProps<typeof containerVariants>
    > & {
        ref?: PolymorphicRef<T>;
    },
) => React.ReactElement | null;

const containerVariants = cva(
    'relative flex items-center justify-between border p-3 transition-all overflow-hidden group rounded-sm',
    {
        variants: {
            state: {
                idle: 'bg-white border-slate-200 hover:border-slate-400',
                active: 'bg-black border-black text-white',
            },
        },
        defaultVariants: {
            state: 'idle',
        },
    },
);

const badgeVariants = cva(
    'text-[9px] font-bold px-2 py-0.5 uppercase rounded-sm border',
    {
        variants: {
            variant: {
                default: 'bg-white border-slate-200 text-black',
                muted: 'bg-white border-slate-300 text-black',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const baseServiceConfig = {
    smkhp: {
        icon: <FaMobileAlt />,
        prefix: 'A',
        label: 'SMKHP',
    },
    'customer-service': {
        icon: <FaHeadset />,
        prefix: 'C',
        label: 'Customer Service',
    },
    laboratorium: {
        icon: <FaMobileAlt />,
        prefix: 'L',
        label: 'Laboratorium',
    },
} as const;

const parseService = (type: ServiceType) => {
    if (type === 'laboratorium-umum') {
        return { service: 'laboratorium' as const, channel: 'umum' as const };
    }

    if (type === 'laboratorium-c') {
        return { service: 'laboratorium' as const, channel: 'c' as const };
    }

    const isOffline = type.endsWith('-offline');
    const channel = isOffline ? 'offline' : 'online';
    const service = type.replace(
        /-(offline|online)$/,
        '',
    ) as keyof typeof baseServiceConfig;
    return { service, channel };
};

const getServiceMeta = (type: ServiceType) => {
    const { service, channel } = parseService(type);
    const base = baseServiceConfig[service];

    return {
        icon: base.icon,
        prefix: base.prefix,
        label:
            channel === 'umum'
                ? `${base.label} Umum`
                : channel === 'c'
                  ? `${base.label} C`
                  : `${base.label} ${channel === 'offline' ? 'Offline' : 'Online'}`,
        channel,
    };
};

const ItemQueueBase = (
    props: PolymorphicComponentProps<
        'div',
        BaseProps & VariantProps<typeof containerVariants>
    >,
    ref: React.ForwardedRef<any>,
) => {
    const {
        as: Component = 'div',
        queue,
        name,
        subtitle,
        serviceType,
        status,
        onAction,
        onRecall,
        className,
        state,
        disabled,
        ...rest
    } = props;

    const current = getServiceMeta(serviceType);

    const isPending = status === 'Pending';
    const isWaiting = status === 'Menunggu';
    const isProcessing = status === 'Diproses';
    const isMeeting = status === 'Meeting';
    const isCustomAction = React.isValidElement(onAction);

    return (
        <Component
            ref={ref}
            className={containerVariants({ state, className })}
            {...rest}
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-black" />

            <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 w-16 h-16 shrink-0 rounded-sm">
                    <span className="text-[10px] font-bold text-slate-400">
                        REF
                    </span>
                    <span className="text-lg font-black text-black">
                        {current.prefix}
                        {queue.toString().padStart(3, '0')}
                    </span>
                </div>

                <div className="min-w-0">
                    <h4 className="text-xs font-black uppercase text-black truncate">
                        {name}
                    </h4>

                    <p className="text-[10px] font-bold text-slate-400 mb-2 truncate">
                        {subtitle}
                    </p>

                    <div className="flex gap-1">
                        <span className={badgeVariants()}>{current.label}</span>
                        <span className={badgeVariants({ variant: 'muted' })}>
                            {status}
                        </span>
                        <span className={badgeVariants({ variant: 'muted' })}>
                            {current.channel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                {isPending && isCustomAction && onAction}
                {!isPending && (
                    <>
                        {(isProcessing || isMeeting) && onRecall && (
                            <button
                                onClick={onRecall}
                                disabled={disabled}
                                className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                            >
                                RE-CALL
                            </button>
                        )}

                        {isCustomAction ? (
                            onAction
                        ) : (
                            <button
                                onClick={onAction as () => void}
                                disabled={disabled}
                                className={`px-4 py-2 text-[10px] font-black uppercase border transition-all rounded-sm ${
                                    isWaiting
                                        ? 'bg-black text-white border-black hover:bg-white hover:text-black'
                                        : 'border-slate-300 text-black hover:border-black'
                                }`}
                            >
                                {isWaiting ? 'START PROSES' : 'VIEW DATA'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </Component>
    );
};

export const ItemQueue = React.forwardRef(ItemQueueBase) as ItemQueueComponent;
