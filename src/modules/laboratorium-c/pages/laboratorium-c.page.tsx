import * as React from 'react';
import LaboratoriumCLayout from '../layouts/laboratorium-c.layout';
import useLaboratoriumCStore from '../store';
import LabStatistik from '../../laboratory-shared/components/lab.statistik';
import LabQueue from '../../laboratory-shared/components/lab.queue';
import LaboratoriumCSkeleton from '../components/skeletons/laboratorium-c.skeleton';
import { normalizeLabStatus } from '../../laboratory-shared/lab.utils';
import useGlobalStore from '../../../shared/stores/global.store';

export default function LaboratoriumCPage() {
    const { state: globalUser } = useGlobalStore();
    const {
        items,
        getItems,
        setPetugas,
        advanceStatus,
        submitTestingStep,
        isLoading,
        isSubmitting,
    } = useLaboratoriumCStore();

    React.useEffect(() => {
        setPetugas(globalUser.full_name, globalUser.nip);
        const unsubscribe = getItems();
        return () => unsubscribe();
    }, [getItems, globalUser.full_name, globalUser.nip, setPetugas]);

    const statistics = React.useMemo(
        () => ({
            pending: items.filter(
                (item) => normalizeLabStatus(item) === 'Pending',
            ).length,
            process: items.filter(
                (item) => normalizeLabStatus(item) === 'Diproses',
            ).length,
            finished: items.filter(
                (item) => normalizeLabStatus(item) === 'Selesai',
            ).length,
        }),
        [items],
    );

    if (isLoading && items.length === 0) return <LaboratoriumCSkeleton />;

    return (
        <LaboratoriumCLayout>
            <LabStatistik
                pendingCounter={statistics.pending}
                processCounter={statistics.process}
                finishedCounter={statistics.finished}
            />
            <LabQueue
                title="Laboratorium C"
                data={items}
                serviceType="laboratorium-c"
                onAdvanceStatus={advanceStatus}
                onSubmitResult={submitTestingStep}
                isSubmitting={isSubmitting}
            />
        </LaboratoriumCLayout>
    );
}
