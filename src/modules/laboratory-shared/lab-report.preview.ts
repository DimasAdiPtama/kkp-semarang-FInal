import type { LabHistoryItem, LabSample } from './lab.types';

const STORAGE_PREFIX = 'kkp-lhu-preview:';

export type LabReportPreviewPayload = {
    item: LabSample | LabHistoryItem;
    title: string;
};

export const saveLabReportPreview = (payload: LabReportPreviewPayload) => {
    const key = `${STORAGE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(key, JSON.stringify(payload));
    return key;
};

export const readLabReportPreview = (key: string) => {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as LabReportPreviewPayload;
    } catch (error) {
        console.error('Failed to parse lab report preview payload', error);
        return null;
    }
};

export const openLabReportPreview = (payload: LabReportPreviewPayload) => {
    const key = saveLabReportPreview(payload);
    window.open(`/lhu-preview?key=${encodeURIComponent(key)}`, '_blank');
};
