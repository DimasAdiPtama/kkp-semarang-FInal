import { useEffect } from 'react';
import SMKHPOfflineLayout from '../layouts/smkhp-offline.layout';
import SMKHPOfflineStatistik from '../components/statistik/smkhp-offline.statistik';
import SMKHPOfflineQueue from '../components/queues/smkhp-offline.queue';
import useSMKHPOfflineStore from '../store';

export default function SMKHPOfflinePage() {
    const { smkhp, getSMKHP, isLoading } = useSMKHPOfflineStore();

    useEffect(() => {
        const unsubscribe = getSMKHP();
        return () => unsubscribe();
    }, [getSMKHP]);

    const activeQueues = smkhp.filter((q) => q.subStatus !== 'Selesai');

    const pendingCount = activeQueues.filter(
        (q) => q.status === 'inactive',
    ).length;
    const waitingCount = activeQueues.filter(
        (q) => q.subStatus === 'Menunggu',
    ).length;
    const processingCount = activeQueues.filter(
        (q) => q.subStatus === 'Diproses',
    ).length;

    return (
        <SMKHPOfflineLayout>
            <SMKHPOfflineStatistik
                pending_counter={pendingCount}
                processing_counter={processingCount}
                waiting_counter={waitingCount}
            />

            {isLoading && activeQueues.length === 0 && (
                <div className="py-4 text-center text-sm text-gray-500 italic">
                    Menghubungkan ke server antrean...
                </div>
            )}
            <SMKHPOfflineQueue data={activeQueues} />
        </SMKHPOfflineLayout>
    );
}
