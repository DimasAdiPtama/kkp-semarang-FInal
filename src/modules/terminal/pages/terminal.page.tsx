import * as React from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../shared/configs/firebase';
import QueueMonitor, {
    type ServiceType,
    type QueueItem,
    type QueueStatus,
} from '../../../shared/components/queue-monitor';

const COLLECTIONS_MAP: Record<string, ServiceType> = {
    SMKHP: 'smkhp-offline',
    CustomerService: 'customer-service-offline',
};

const normalizeStatus = (status: string): QueueStatus => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'menunggu') return 'Menunggu';
    if (
        s === 'di proses' ||
        s === 'meeting' ||
        s === 'diproses' ||
        s === 'pengujian'
    )
        return 'Diproses';
    if (s === 'dipanggil') return 'Dipanggil';
    return 'Menunggu';
};

export default function TerminalPage() {
    const [queueData, setQueueData] = React.useState<
        Partial<Record<ServiceType, QueueItem[]>>
    >({});

    React.useEffect(() => {
        const unsubscribers: (() => void)[] = [];
        const cache: Record<string, QueueItem[]> = {};

        const flush = () => {
            const result: Partial<Record<ServiceType, QueueItem[]>> = {};
            Object.entries(cache).forEach(([collName, items]) => {
                const serviceType = COLLECTIONS_MAP[collName];
                if (serviceType) {
                    result[serviceType] = [
                        ...(result[serviceType] || []),
                        ...items,
                    ];
                }
            });
            setQueueData(result);
        };

        Object.keys(COLLECTIONS_MAP).forEach((collName) => {
            const q = query(
                collection(db, collName),
                orderBy('queueNo', 'asc'),
            );
            const unsub = onSnapshot(
                q,
                (snapshot) => {
                    cache[collName] = snapshot.docs
                        .map((doc) => {
                            const data = doc.data();
                            const details = (data.details || {}) as any;

                            return {
                                id: doc.id,
                                queueNo: Number(data.queueNo || 0),
                                userName:
                                    data.username ||
                                    data.name ||
                                    data.nama ||
                                    details.userName ||
                                    'Tanpa Nama',
                                serviceType: COLLECTIONS_MAP[collName],
                                status: normalizeStatus(data.status),
                            } satisfies QueueItem;
                        })
                        .filter((item) => item.status !== ('Selesai' as any)); // Only active queues

                    flush();
                },
                (error) => {
                    console.error(
                        `Error fetching ${collName} for terminal:`,
                        error,
                    );
                },
            );
            unsubscribers.push(unsub);
        });

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }, []);

    return (
        <div className="min-h-screen">
            <QueueMonitor
                data={queueData}
                onItemClick={(item) => {
                    console.log('Clicked item:', item);
                }}
            />
        </div>
    );
}
