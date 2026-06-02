import * as React from 'react';
import { cva } from 'class-variance-authority';
import { ItemQueue, Modal } from '../../../shared/components';
import type { LabSample } from '../lab.types';
import {
    formatCurrency,
    getLabActionLabel,
    getLabFilterKey,
    getTestingFilterLabel,
    isCompletedStage,
    isPublishStage,
    isTestingStage,
    type LabFilterKey,
    normalizeLabStatus,
} from '../lab.utils';
import LabResultForm from './lab-result.form';
import { openLabReportPreview } from '../lab-report.preview';

type LabQueueProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    data: LabSample[];
    title: string;
    serviceType:
        | 'smkhp-offline'
        | 'smkhp-online'
        | 'customer-service-offline'
        | 'customer-service-online'
        | 'laboratorium-umum'
        | 'laboratorium-c';
    onAdvanceStatus: (
        token: string,
    ) => Promise<{ success: boolean; message?: string }>;
    onSubmitResult: (payload: {
        token: string;
        result?: string;
        tanggalPenerbitan?: string;
        namaPenanggungJawab?: string;
        nipPenanggungJawab?: string;
    }) => Promise<{ success: boolean; message?: string }>;
    isSubmitting: boolean;
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

export default function LabQueue({
    data,
    title,
    serviceType,
    onAdvanceStatus,
    onSubmitResult,
    isSubmitting,
    className,
    ...rest
}: LabQueueProps) {
    const [filter, setFilter] = React.useState<LabFilterKey>('All');
    const [testingFilter, setTestingFilter] =
        React.useState<string>('Semua Pengujian');
    const [selectedInput, setSelectedInput] = React.useState<LabSample | null>(
        null,
    );

    const testingFilterOptions = React.useMemo(() => {
        const labels = data
            .filter((item) => isTestingStage(item.status))
            .map((item) => getTestingFilterLabel(item.status));

        return ['Semua Pengujian', ...Array.from(new Set(labels))];
    }, [data]);

    // Adjust testingFilter if it's no longer valid based on the current options or filter
    const effectiveTestingFilter = React.useMemo(() => {
        if (filter !== 'Pengujian') return 'Semua Pengujian';
        if (!testingFilterOptions.includes(testingFilter))
            return 'Semua Pengujian';
        return testingFilter;
    }, [filter, testingFilter, testingFilterOptions]);

    const filteredData = React.useMemo(() => {
        if (filter === 'All') return data;

        const byStatus = data.filter(
            (item) => getLabFilterKey(item.status) === filter,
        );

        if (
            filter !== 'Pengujian' ||
            effectiveTestingFilter === 'Semua Pengujian'
        ) {
            return byStatus;
        }

        return byStatus.filter(
            (item) =>
                getTestingFilterLabel(item.status) === effectiveTestingFilter,
        );
    }, [data, filter, effectiveTestingFilter]);
    const filterOptions: LabFilterKey[] = [
        'All',
        'Pending',
        'Sampel Diterima',
        'Pengujian',
        'LHU Terbit',
        'LHU yang akan di ambil',
        'Selesai',
    ];

    return (
        <>
            <div
                className={`w-full flex flex-col gap-4 ${className ?? ''}`}
                {...rest}
            >
                <div className="flex gap-2 flex-wrap">
                    {filterOptions.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={filterButtonVariants({
                                active: filter === item,
                            })}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {filter === 'Pengujian' && testingFilterOptions.length > 1 && (
                    <div className="flex gap-2 flex-wrap border border-slate-200 rounded-sm p-3 bg-white">
                        {testingFilterOptions.map((item) => (
                            <button
                                key={item}
                                onClick={() => setTestingFilter(item)}
                                className={filterButtonVariants({
                                    active: testingFilter === item,
                                })}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {filteredData.length === 0 && (
                        <div className="text-[12px] font-bold text-slate-400 text-center py-6 border border-slate-200 rounded-sm">
                            Tidak ada sampel dalam kategori ini
                        </div>
                    )}

                    {filteredData.map((item, index) => {
                        const status = normalizeLabStatus(item);

                        return (
                            <ItemQueue
                                key={item.token}
                                token={item.token}
                                queue={index + 1}
                                name={item.namaSampel}
                                subtitle={`${item.lpp} | ${item.status} | Total ${formatCurrency(item.totalTarif)}`}
                                serviceType={serviceType}
                                status={status}
                                onAction={
                                    isCompletedStage(item.status) ? (
                                        <button
                                            onClick={() =>
                                                openLabReportPreview({
                                                    item,
                                                    title,
                                                })
                                            }
                                            className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                        >
                                            {getLabActionLabel(item.status)}
                                        </button>
                                    ) : isPublishStage(item.status) ? (
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    setSelectedInput(item)
                                                }
                                                className="px-3 py-2 text-[10px] font-black uppercase border border-slate-300 text-black hover:border-black transition-all rounded-sm"
                                            >
                                                EDIT DATA LHU
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openLabReportPreview({
                                                        item,
                                                        title,
                                                    })
                                                }
                                                className="px-3 py-2 text-[10px] font-black uppercase border border-slate-300 text-black hover:border-black transition-all rounded-sm"
                                            >
                                                PREVIEW LHU
                                            </button>
                                            <button
                                                onClick={() =>
                                                    void onAdvanceStatus(
                                                        item.token,
                                                    )
                                                }
                                                className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                            >
                                                KONFIRMASI AMBIL
                                            </button>
                                        </div>
                                    ) : isTestingStage(item.status) ? (
                                        <button
                                            onClick={() =>
                                                setSelectedInput(item)
                                            }
                                            className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                        >
                                            {getLabActionLabel(item.status)}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                void onAdvanceStatus(item.token)
                                            }
                                            className="px-3 py-2 text-[10px] font-black uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-all rounded-sm"
                                        >
                                            {getLabActionLabel(item.status)}
                                        </button>
                                    )
                                }
                            />
                        );
                    })}
                </div>
            </div>

            <Modal
                title={`INPUT HASIL UJI ${title.toUpperCase()}`}
                open={!!selectedInput}
                onOpenChange={(open) => {
                    if (!open) setSelectedInput(null);
                }}
            >
                {selectedInput && (
                    <LabResultForm
                        key={selectedInput.token}
                        item={selectedInput}
                        onSubmitResult={onSubmitResult}
                        isSubmitting={isSubmitting}
                        onSuccess={() => setSelectedInput(null)}
                    />
                )}
            </Modal>
        </>
    );
}
