import { LAB_TEST_CATALOG } from './lab.constants';
import type { LabQueueStatus, LabResultItem, LabSample } from './lab.types';

export type LabFilterKey =
    | 'All'
    | 'Pending'
    | 'Sampel Diterima'
    | 'Pengujian'
    | 'LHU Terbit'
    | 'LHU yang akan di ambil'
    | 'Selesai';

const LAB_INITIAL_FLOW = [
    'Menunggu Persetujuan',
    'Permohonan Uji Diterima',
    'Sampel Diterima',
] as const;

const LAB_FINAL_FLOW = [
    'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya',
    'Ambil LHU fisik di BPPMHKP Semarang',
    'Selesai',
] as const;

const normalizeString = (value: string) =>
    value.toLowerCase().replace(/\s+/g, ' ').replace(/[().]/g, '').trim();

export const parseSelectedTests = (raw: string | string[] | undefined) => {
    if (Array.isArray(raw)) {
        return raw.map((item) => item.trim()).filter(Boolean);
    }

    return (raw || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

export const findTestCatalog = (testName: string) => {
    const normalized = normalizeString(testName);

    return (
        LAB_TEST_CATALOG.find((item) => {
            if (normalizeString(item.label) === normalized) return true;

            return item.aliases.some(
                (alias) => normalizeString(alias) === normalized,
            );
        }) || {
            key: normalized.replace(/\s+/g, '_'),
            label: testName,
            satuan: '-',
            tarif: 0,
        }
    );
};

export const getTestingStatusLabel = (testName: string) => {
    const catalog = findTestCatalog(testName);

    switch (catalog.key) {
        case 'alt':
            return 'Pengujian Angka Lempeng Total (ALT)';
        case 'coliform_produk_kerang':
            return 'Pengujian Coliform Produk Kerang';
        case 'coliform':
            return 'Pengujian Coliform';
        case 'escherichia_coli':
            return 'Pengujian Escherichia Coli';
        case 'escherichia_coli_produk_kerang':
            return 'Pengujian Escherichia Coli Produk Kerang';
        case 'salmonella':
            return 'Pengujian Salmonela';
        case 'sensori':
            return 'Pengujian Sensori';
        case 'formalin':
            return 'Pengujian Formalin';
        default:
            return `Pengujian ${catalog.label}`;
    }
};

export const getLabWorkflow = (item: Pick<LabSample, 'selectedTests'>) => {
    return [
        ...LAB_INITIAL_FLOW,
        ...item.selectedTests.map(getTestingStatusLabel),
        ...LAB_FINAL_FLOW,
    ];
};

export const getNextLabStatus = (
    item: Pick<LabSample, 'status' | 'selectedTests'>,
) => {
    const workflow = getLabWorkflow(item);
    const currentIndex = workflow.indexOf(
        item.status as (typeof workflow)[number],
    );

    if (currentIndex === -1) return workflow[0];

    return workflow[currentIndex + 1] || workflow[currentIndex];
};

export const isTestingStage = (status: string) => {
    return status.startsWith('Pengujian ');
};

export const isPublishStage = (status: string) => {
    return (
        status === 'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya'
    );
};

export const isPickupStage = (status: string) => {
    return status === 'Ambil LHU fisik di BPPMHKP Semarang';
};

export const isCompletedStage = (status: string) => {
    return status === 'Selesai';
};

export const isSampleReceivedStage = (status: string) => {
    return status === 'Sampel Diterima';
};

export const getCurrentTestingResult = (
    item: Pick<LabSample, 'status' | 'hasilUji'>,
) => {
    if (!isTestingStage(item.status)) return null;

    return (
        item.hasilUji.find(
            (result) => getTestingStatusLabel(result.testName) === item.status,
        ) || null
    );
};

export const normalizeLabStatus = (
    item: Pick<LabSample, 'status' | 'hasilUji'>,
): LabQueueStatus => {
    if (isCompletedStage(item.status)) return 'Selesai';
    if (
        item.status === 'Menunggu Persetujuan' ||
        item.status === 'Permohonan Uji Diterima'
    ) {
        return 'Pending';
    }

    return 'Diproses';
};

export const getLabFilterKey = (status: string): LabFilterKey => {
    if (
        status === 'Menunggu Persetujuan' ||
        status === 'Permohonan Uji Diterima'
    ) {
        return 'Pending';
    }

    if (isSampleReceivedStage(status)) {
        return 'Sampel Diterima';
    }

    if (isTestingStage(status)) {
        return 'Pengujian';
    }

    if (isPublishStage(status)) {
        return 'LHU Terbit';
    }

    if (isPickupStage(status)) {
        return 'LHU yang akan di ambil';
    }

    return 'Selesai';
};

export const getLabActionLabel = (status: string) => {
    switch (status) {
        case 'Menunggu Persetujuan':
            return 'TERIMA PERMOHONAN';
        case 'Permohonan Uji Diterima':
            return 'TERIMA SAMPEL';
        case 'Sampel Diterima':
            return 'MULAI PENGUJIAN';
        case 'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya':
            return 'KONFIRMASI AMBIL';
        case 'Ambil LHU fisik di BPPMHKP Semarang':
            return 'SELESAIKAN';
        default:
            if (isTestingStage(status)) return 'INPUT HASIL UJI';
            if (isCompletedStage(status)) return 'VIEW LHU';
            return 'LANJUTKAN';
    }
};

export const getTestingFilterLabel = (status: string) => {
    if (!isTestingStage(status)) return 'Semua Pengujian';

    return status.replace(/^Pengujian\s+/i, '');
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

export const getResultItemsFromTests = (
    tests: string[],
    existingResults: LabResultItem[],
) => {
    return tests.map((testName) => {
        const catalog = findTestCatalog(testName);
        const existing = existingResults.find(
            (item) =>
                item.testKey === catalog.key || item.testName === testName,
        );

        return {
            testName: catalog.label,
            testKey: catalog.key,
            result: existing?.result || '',
            tarif: existing?.tarif ?? catalog.tarif,
        } satisfies LabResultItem;
    });
};

export const getTotalTarif = (items: LabResultItem[]) => {
    return items.reduce((total, item) => total + Number(item.tarif || 0), 0);
};

export const formatLongDate = (value: string) => {
    if (!value) return '-';

    const [day, month, year] = value.split('/');
    const parsed = new Date(`${year}-${month}-${day}T00:00:00+07:00`);

    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    }).format(parsed);
};
