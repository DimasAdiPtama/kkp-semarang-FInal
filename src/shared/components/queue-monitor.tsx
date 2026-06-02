import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva } from 'class-variance-authority';
import {
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineCheckCircle,
    HiOutlinePlay,
} from 'react-icons/hi2';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export type ServiceType =
    | 'smkhp-offline'
    | 'customer-service-offline'
    | 'laboratorium-umum'
    | 'laboratorium-official';

export type QueueStatus = 'Menunggu' | 'Diproses' | 'Dipanggil';

export type QueueItem = {
    id: string;
    queueNo: number;
    userName: string;
    serviceType: ServiceType;
    status: QueueStatus;
};

type ServiceDataMap = Partial<Record<ServiceType, QueueItem[]>>;

type Props = Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    data: ServiceDataMap;
    defaultFilter?: ServiceType | 'ALL';
    onItemClick?: (item: QueueItem) => void;
};

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

const SERVICE_CONFIG: Record<
    ServiceType,
    { prefix: string; label: string; color: string }
> = {
    'smkhp-offline': {
        prefix: 'A',
        label: 'SMKHP Offline',
        color: 'bg-indigo-600',
    },
    'customer-service-offline': {
        prefix: 'C',
        label: 'CS Offline',
        color: 'bg-emerald-600',
    },
    'laboratorium-umum': {
        prefix: 'B',
        label: 'Lab Umum',
        color: 'bg-blue-600',
    },
    'laboratorium-official': {
        prefix: 'B',
        label: 'Lab Official',
        color: 'bg-orange-600',
    },
};

/**
 * =========================================================
 * UTILS
 * =========================================================
 */

const formatQueue = (type: ServiceType, num?: number) => {
    const prefix = SERVICE_CONFIG[type]?.prefix ?? '';
    return `${prefix}${String(num ?? 0).padStart(3, '0')}`;
};

/**
 * =========================================================
 * VARIANTS
 * =========================================================
 */

const statusVariants = cva(
    'text-xs font-bold uppercase px-3 py-1 rounded-full border shadow-sm',
    {
        variants: {
            status: {
                Menunggu: 'bg-slate-100 text-slate-600 border-slate-200',
                Diproses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                Dipanggil:
                    'bg-amber-100 text-amber-700 border-amber-200 animate-pulse',
            },
        },
    },
);

/**
 * =========================================================
 * ANIMATION
 * =========================================================
 */

const containerMotion = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemMotion = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
};

/**
 * =========================================================
 * SUB COMPONENTS
 * =========================================================
 */

function Clock() {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-end">
            <div className="text-4xl font-black tracking-tighter text-white tabular-nums">
                {time.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })}
            </div>
            <div className="text-sm font-medium text-indigo-200 uppercase tracking-widest">
                {time.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    colorClass,
}: {
    label: string;
    value: number;
    icon: any;
    colorClass: string;
}) {
    return (
        <motion.div
            variants={itemMotion}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center gap-5"
        >
            <div
                className={`p-4 rounded-xl ${colorClass} text-white shadow-lg`}
            >
                <Icon size={28} />
            </div>
            <div>
                <p className="text-sm font-semibold uppercase text-indigo-100/60 tracking-wider">
                    {label}
                </p>
                <p className="text-4xl font-black text-white mt-1 tabular-nums tracking-tight">
                    {value}
                </p>
            </div>
        </motion.div>
    );
}

function ServiceCard({
    type,
    current,
}: {
    type: ServiceType;
    current?: QueueItem;
}) {
    const config = SERVICE_CONFIG[type];

    return (
        <motion.div
            variants={itemMotion}
            className="group bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100"
        >
            <div
                className={`${config.color} p-6 text-white flex justify-between items-center`}
            >
                <span className="text-lg font-black uppercase tracking-widest opacity-90">
                    {config.label}
                </span>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <HiOutlinePlay size={24} />
                </div>
            </div>

            <div className="p-10 flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-b from-white to-slate-50">
                <div
                    className={`text-[7rem] leading-none font-black tracking-tighter mb-4 transition-colors duration-500 ${
                        current?.status === 'Dipanggil'
                            ? 'text-amber-500 animate-pulse'
                            : 'text-slate-900'
                    }`}
                >
                    {current ? formatQueue(type, current.queueNo) : '---'}
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-xl font-bold text-slate-400 uppercase tracking-widest">
                        {current?.status === 'Dipanggil'
                            ? 'DIPANGGIL KE LOKET'
                            : 'SEDANG DILAYANI'}
                    </div>
                    {current && (
                        <div className="px-6 py-2 bg-slate-100 rounded-full text-slate-600 font-bold text-lg animate-pulse">
                            {current.userName}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function FeedItem({
    item,
    onClick,
}: {
    item: QueueItem;
    onClick?: () => void;
}) {
    return (
        <motion.div
            layout
            variants={itemMotion}
            onClick={onClick}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-8 py-5 flex justify-between items-center cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
        >
            <div className="flex items-center gap-8">
                <div
                    className={`w-16 h-16 rounded-2xl ${SERVICE_CONFIG[item.serviceType]?.color ?? 'bg-slate-800'} flex items-center justify-center text-white text-2xl font-black shadow-inner`}
                >
                    {SERVICE_CONFIG[item.serviceType]?.prefix}
                </div>
                <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatQueue(item.serviceType, item.queueNo)}
                    </div>
                    <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                        {item.userName}
                    </div>
                </div>
            </div>

            <span
                className={statusVariants({
                    status: item.status as QueueStatus,
                })}
            >
                {item.status}
            </span>
        </motion.div>
    );
}

/**
 * =========================================================
 * MAIN COMPONENT
 * =========================================================
 */

export default function QueueMonitor({
    data,
    defaultFilter = 'ALL',
    onItemClick,
    className,
    ...rest
}: Props) {
    const [filter] = React.useState<ServiceType | 'ALL'>(defaultFilter);

    const allItems = React.useMemo(() => {
        return Object.values(data).filter(Boolean).flat() as QueueItem[];
    }, [data]);

    const filteredItems = React.useMemo(() => {
        if (filter === 'ALL') return allItems;
        return allItems.filter((i) => i.serviceType === filter);
    }, [allItems, filter]);

    const processingMap = React.useMemo(() => {
        const map: Partial<Record<ServiceType, QueueItem>> = {};
        allItems.forEach((item) => {
            // Prioritize 'Dipanggil' over 'Diproses'
            if (item.status === 'Dipanggil') {
                map[item.serviceType] = item;
            } else if (
                item.status === 'Diproses' &&
                (!map[item.serviceType] ||
                    map[item.serviceType]?.status !== 'Dipanggil')
            ) {
                map[item.serviceType] = item;
            }
        });
        return map;
    }, [allItems]);

    const stats = React.useMemo(() => {
        return {
            total: allItems.length,
            waiting: allItems.filter((i) => i.status === 'Menunggu').length,
            processing: allItems.filter((i) => i.status === 'Diproses').length,
            called: allItems.filter((i) => i.status === 'Dipanggil').length,
        };
    }, [allItems]);

    return (
        <div
            className={`w-full min-h-screen bg-indigo-950 text-white flex flex-col overflow-x-hidden ${
                className ?? ''
            }`}
            {...rest}
        >
            {/* TOP BAR / HEADER */}
            <header className="p-10 flex justify-between items-center bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">
                            Monitor Antrian
                        </h1>
                        <p className="text-lg font-medium text-indigo-300/80 uppercase tracking-widest">
                            KKP Kelas II Semarang
                        </p>
                    </div>
                </div>
                <Clock />
            </header>

            <main className="flex-1 p-10 flex flex-col gap-10">
                {/* STATS OVERVIEW */}
                <motion.div
                    className="grid grid-cols-4 gap-6"
                    variants={containerMotion}
                    initial="hidden"
                    animate="show"
                >
                    <StatCard
                        label="Total Antrian"
                        value={stats.total}
                        icon={HiOutlineUsers}
                        colorClass="bg-indigo-500"
                    />
                    <StatCard
                        label="Menunggu"
                        value={stats.waiting}
                        icon={HiOutlineClock}
                        colorClass="bg-amber-500"
                    />
                    <StatCard
                        label="Diproses"
                        value={stats.processing}
                        icon={HiOutlinePlay}
                        colorClass="bg-emerald-500"
                    />
                    <StatCard
                        label="Dipanggil"
                        value={stats.called}
                        icon={HiOutlineCheckCircle}
                        colorClass="bg-blue-500"
                    />
                </motion.div>

                <div className="grid grid-cols-12 gap-10 flex-1">
                    {/* LEFT SIDE: CURRENT PROCESSING */}
                    <div className="col-span-8 flex flex-col gap-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-8 w-2 bg-indigo-500 rounded-full" />
                            <h2 className="text-2xl font-black uppercase tracking-tight text-indigo-100">
                                Sedang Dilayani
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map(
                                (type) => (
                                    <ServiceCard
                                        key={type}
                                        type={type}
                                        current={processingMap[type]}
                                    />
                                ),
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: QUEUE FEED / LIST */}
                    <div className="col-span-4 flex flex-col gap-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-8 w-2 bg-emerald-500 rounded-full" />
                            <h2 className="text-2xl font-black uppercase tracking-tight text-indigo-100">
                                Daftar Tunggu
                            </h2>
                        </div>
                        <motion.div
                            className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-450px)] pr-4 custom-scrollbar"
                            variants={containerMotion}
                            initial="hidden"
                            animate="show"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredItems.filter(
                                    (i) => i.status === 'Menunggu',
                                ).length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        className="bg-white/5 border border-white/10 rounded-2xl py-20 flex flex-col items-center justify-center gap-4"
                                    >
                                        <div className="p-4 bg-white/5 rounded-full text-indigo-300">
                                            <HiOutlineUsers size={40} />
                                        </div>
                                        <p className="text-xl font-bold text-indigo-200/40 uppercase tracking-widest">
                                            Tidak ada antrian
                                        </p>
                                    </motion.div>
                                ) : (
                                    filteredItems
                                        .filter((i) => i.status === 'Menunggu')
                                        .slice(0, 6)
                                        .map((item) => (
                                            <FeedItem
                                                key={item.id}
                                                item={item}
                                                onClick={() =>
                                                    onItemClick?.(item)
                                                }
                                            />
                                        ))
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
