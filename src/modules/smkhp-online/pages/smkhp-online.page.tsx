import SMKHPOnlineLayout from '../layouts/smkhp-online.layout';
import * as React from 'react';

import SMKHPOnlineStatistik from '../components/statistik/smkhp-online.statistik';
import SMKHPOnlineQueue from '../components/queues/smkhp-online.queue';
import SMKHPOnlineSkeleton from '../components/skeletons/smkhp-online.skeleton';
import useSMKHPOnlineStore from '../store';

const getTodayRegistrationDate = () => {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date());
};

export default function SMKHPOnlinePage() {
    const { smkhp_online, getSMKHPOnline, isLoading } = useSMKHPOnlineStore();

    React.useEffect(() => {
        const unsubscribe = getSMKHPOnline();
        return () => unsubscribe();
    }, [getSMKHPOnline]);

    const today = getTodayRegistrationDate();

    const statistics = React.useMemo(
        () => ({
            pending: smkhp_online.filter((item) => item.status === 'pending')
                .length,
            meeting: smkhp_online.filter(
                (item) =>
                    item.status === 'di proses' &&
                    item.details.tanggal === today,
            ).length,
            finished: smkhp_online.filter((item) => item.status === 'Selesai')
                .length,
        }),
        [smkhp_online, today],
    );

    if (isLoading && smkhp_online.length === 0) {
        return <SMKHPOnlineSkeleton />;
    }

    return (
        <SMKHPOnlineLayout>
            <SMKHPOnlineStatistik
                pending_counter={statistics.pending}
                meeting_counter={statistics.meeting}
                finished_counter={statistics.finished}
            />
            <SMKHPOnlineQueue data={smkhp_online} />
        </SMKHPOnlineLayout>
    );
}
