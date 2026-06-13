import * as React from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
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
            // Filter out completed queues ('Selesai') directly at database level.
            // Avoid orderBy at DB level to prevent missing index errors (no composite index required).
            const q = query(
                collection(db, collName),
                where('subStatus', '!=', 'Selesai'),
            );
            const unsub = onSnapshot(
                q,
                (snapshot) => {
                    const items = snapshot.docs
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
                                status: normalizeStatus(data.subStatus || data.status),
                            } satisfies QueueItem;
                        });

                    // Sort by queueNo ascending in JS memory
                    items.sort((a, b) => a.queueNo - b.queueNo);
                    
                    cache[collName] = items;
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
