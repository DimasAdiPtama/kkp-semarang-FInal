import * as React from 'react';
import { cva } from 'class-variance-authority';
import useQueueCaller from '../../../../../useQueueCaller';

import { ItemQueue, Modal } from '../../../../shared/components';
import SMKHPOfflineForm from '../forms/smkhp-offline.form';

import useSMKHPOfflineStore, { type SMKHPData } from '../../store';

type QueueStatus = 'Pending' | 'Menunggu' | 'Diproses';

type QueueItem = {
    token: string;
    queue: number;
    name: string;
    subtitle: string;
    status: QueueStatus;
};

type SMKHPOfflineQueueListProps = Omit<
    React.ComponentPropsWithoutRef<'div'>,
    'children'
> & {
    data: SMKHPData[];
    defaultFilter?: QueueStatus | 'All';
};

const normalizeStatus = (item: SMKHPData): QueueStatus => {
    if (item.status === 'inactive') return 'Pending';
    if (item.subStatus === 'Menunggu') return 'Menunggu';
    if (item.subStatus === 'Diproses') return 'Diproses';
    return 'Pending';
};

const filterButtonVariants = cva(
    'px-3 py-2 text-[10px] font-black uppercase border rounded-sm transition-all',
    {
        variants: {
            active: {
                true: 'bg-black text-white border-black',
                false: 'bg-white text-black border-slate-300 hover:border-black',
            },
        },
    },
);

export default function SMKHPOfflineQueue(props: SMKHPOfflineQueueListProps) {
    const { data, defaultFilter = 'All', className, ...rest } = props;
    const { updateSMKHPStatus } = useSMKHPOfflineStore();
    const { callQueue } = useQueueCaller();

    const safeData: QueueItem[] = React.useMemo(() => {
        return data.map((item) => ({
            token: item.token,
            queue: item.queueNo,
            name: item.userName,
            subtitle: `NPWP: ${item.npwp || '-'}`,
            status: normalizeStatus(item),
        }));
    }, [data]);

    const [filter, setFilter] = React.useState<QueueStatus | 'All'>(
        defaultFilter,
    );

    const filteredData = React.useMemo(() => {
        if (filter === 'All') return safeData;
        return safeData.filter((item) => item.status === filter);
    }, [safeData, filter]);

    const handleStartProcess = async (item: QueueItem) => {
        const success = await updateSMKHPStatus(item.token, 'Diproses');
        if (success) {
            callQueue(item.name, item.queue, 'SMKHP');
        }
    };

    const handleRecall = (item: QueueItem) => {
        callQueue(item.name, item.queue, 'SMKHP');
    };

    return (
        <div
            className={`w-full flex flex-col gap-4 ${className ?? ''}`}
            {...rest}
        >
            <div className="flex gap-2">
                {(['All', 'Pending', 'Menunggu', 'Diproses'] as const).map(
                    (item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={filterButtonVariants({
                                active: filter === item,
                            })}
                        >
                            {item}
                        </button>
                    ),
                )}
            </div>

            <div className="flex flex-col gap-3">
                {filteredData.length === 0 && (
                    <div className="text-[12px] font-bold text-slate-400 text-center py-6 border border-slate-200 rounded-sm">
                        Tidak ada data
                    </div>
                )}

                {filteredData.map((item) => (
                    <ItemQueue
                        key={item.token}
                        token={item.token}
                        queue={item.queue}
                        name={item.name}
                        subtitle={item.subtitle}
                        serviceType="smkhp-offline"
                        status={item.status}
                        onAction={
                            item.status === 'Pending' ? (
                                <button
                                    onClick={() =>
                                        updateSMKHPStatus(
                                            item.token,
                                            'Menunggu',
                                        )
                                    }
                                    className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                >
                                    AKTIFKAN
                                </button>
                            ) : item.status === 'Menunggu' ? (
                                <button
                                    onClick={() =>
                                        void handleStartProcess(item)
                                    }
                                    className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                >
                                    PROSES
                                </button>
                            ) : item.status === 'Diproses' ? (
                                <Modal
                                    title="DETAIL ANTREAN SMKHP"
                                    trigger={
                                        <button className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm">
                                            DETAIL
                                        </button>
                                    }
                                >
                                    <SMKHPOfflineForm id={item.token} />
                                </Modal>
                            ) : null
                        }
                        onRecall={() => handleRecall(item)}
                    />
                ))}
            </div>
        </div>
    );
}
