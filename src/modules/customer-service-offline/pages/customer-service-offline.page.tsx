import { useEffect } from 'react';
import CustomerServiceOfflineLayout from '../layouts/customer-service-offline.layout';
import CustomerServiceOfflineStatistik from '../components/statistik/customer-service-offline.statistik';
import CustomerServiceOfflineQueue from '../components/queues/customer-service-offline.queue';
import useCustomerServiceOfflineStore from '../store';

export default function CustomerServiceOfflinePage() {
    const { customer_service, getCustomerService, isLoading } =
        useCustomerServiceOfflineStore();

    useEffect(() => {
        const unsubscribe = getCustomerService();
        return () => unsubscribe();
    }, [getCustomerService]);

    const activeQueues = customer_service.filter(
        (q) => q.subStatus !== 'Selesai',
    );

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
        <CustomerServiceOfflineLayout>
            <CustomerServiceOfflineStatistik
                pending_counter={pendingCount}
                processing_counter={processingCount}
                waiting_counter={waitingCount}
            />

            {isLoading && activeQueues.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                    Sinkronisasi data antrean...
                </div>
            )}

            <CustomerServiceOfflineQueue data={activeQueues} />
        </CustomerServiceOfflineLayout>
    );
}
