import { create } from 'zustand';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

export type UserNoAju = {
    noAju: string;
    expiredAju: string;
};

export type HistoryUser = {
    id: string;
    uid: string;
    nama: string;
    namaTrader: string;
    email: string;
    nomorHp: string;
    npwp: string;
    nik: string;
    createdAt: string;
    updatedAt: string;
    noAjuList: UserNoAju[];
};

export type UserActivity = {
    id: string;
    sourceCollection: string;
    serviceLabel: string;
    channel: string;
    type: string;
    status: string;
    subStatus: string;
    npwp: string;
    uid: string;
    email: string;
    userName: string;
    title: string;
    description: string;
    dateLabel: string;
    timestamp: number;
    raw: Record<string, any>;
};

type LoadedMap = Record<string, boolean>;

type HistoryState = {
    users: HistoryUser[];
    activities: UserActivity[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
};

type HistoryAction = {
    subscribe: () => () => void;
    updateNoAjuList: (
        userId: string,
        noAjuList: UserNoAju[],
    ) => Promise<{ success: boolean; message?: string }>;
};

const COLLECTION_KEYS = [
    'users',
    'history',
    'historyLabUmum',
    'historyLabOfficial',
    'historySMKHPOnline',
    'historyCSOnline',
] as const;

const getSafeTimestamp = (...values: Array<string | number | undefined>) => {
    for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string' && value.trim()) {
            const parsed = Date.parse(value);
            if (!Number.isNaN(parsed)) return parsed;
        }
    }

    return 0;
};

const normalizeNoAjuDate = (value?: string) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T07:00`;
    return value;
};

const normalizeNoAjuList = (raw: unknown): UserNoAju[] => {
    if (!Array.isArray(raw)) return [];

    return raw
        .map((item) => {
            const value = item as Record<string, any>;
            const noAju = String(value.noAju || '').trim();
            const expiredAju = normalizeNoAjuDate(
                String(value.expiredAju || '').trim(),
            );

            if (!noAju) return null;

            return {
                noAju,
                expiredAju,
            } satisfies UserNoAju;
        })
        .filter(Boolean) as UserNoAju[];
};

const normalizeUser = (id: string, value: Record<string, any>): HistoryUser => {
    return {
        id,
        uid: value.uid || '',
        nama: value.nama || value.name || '-',
        namaTrader: value.namaTrader || value.userApi || '-',
        email: value.email || '-',
        nomorHp: value.nomorHp || '-',
        npwp: value.npwp || '-',
        nik: value.nik || id,
        createdAt: String(value.createdAt || ''),
        updatedAt: String(value.updatedAt || ''),
        noAjuList: normalizeNoAjuList(value.noAjuList),
    };
};

const normalizeHistory = (
    collectionName: string,
    id: string,
    value: Record<string, any>,
): UserActivity => {
    const details = (value.details || {}) as Record<string, any>;
    const serviceLabelMap: Record<string, string> = {
        history: details.type || value.type || 'Layanan Offline',
        historyLabUmum: 'Laboratorium Umum',
        historyLabOfficial: 'Laboratorium C',
        historySMKHPOnline: 'SMKHP Online',
        historyCSOnline: 'Customer Service Online',
    };

    const channelMap: Record<string, string> = {
        history: 'Offline',
        historyLabUmum: 'Laboratorium',
        historyLabOfficial: 'Laboratorium',
        historySMKHPOnline: 'Online',
        historyCSOnline: 'Online',
    };

    const titleMap: Record<string, string> = {
        history: `${details.type || value.type || 'Layanan'} ${details.token || value.token || id}`,
        historyLabUmum: `${value.lpp || id} - ${value.namaSampel || 'Lab Umum'}`,
        historyLabOfficial: `${value.lpp || id} - ${value.namaSampel || 'Lab C'}`,
        historySMKHPOnline: `${value.formattedNo || value.nomor_antrian || id} - SMKHP Online`,
        historyCSOnline: `${value.formattedNo || value.nomor_antrian || id} - Customer Service Online`,
    };

    const descriptionMap: Record<string, string> = {
        history: details.keluhan
            ? `Keluhan: ${details.keluhan}`
            : `Nomor HP: ${details.nomorHp || value.nomorHp || '-'}`,
        historyLabUmum: `Petugas: ${value.namaPetugas || '-'} | Penanggung jawab: ${value.namaPenanggungJawab || '-'}`,
        historyLabOfficial: `Petugas: ${value.namaPetugas || '-'} | Penanggung jawab: ${value.namaPenanggungJawab || '-'}`,
        historySMKHPOnline: `No Aju: ${value.noAju || value.nomor_aju || '-'} | Jadwal: ${value.tanggalRegistrasi || value.jadwalMeeting?.tanggal || '-'}`,
        historyCSOnline: `Kebutuhan: ${value.kebutuhan || '-'} | Jadwal: ${value.tanggalRegistrasi || value.jadwalMeeting?.tanggal || '-'}`,
    };

    return {
        id,
        sourceCollection: collectionName,
        serviceLabel: serviceLabelMap[collectionName] || collectionName,
        channel: channelMap[collectionName] || '-',
        type:
            details.type ||
            value.type ||
            (collectionName === 'historySMKHPOnline'
                ? 'SMKHP Online'
                : collectionName === 'historyCSOnline'
                    ? 'Customer Service Online'
                    : collectionName.toLowerCase().includes('lab')
                        ? 'Laboratorium'
                        : '-'),
        status: value.status || details.status || '-',
        subStatus: value.subStatus || details.subStatus || '-',
        npwp: details.npwp || value.npwp || '',
        uid: value.uid || details.uid || '',
        email: value.email || details.userEmail || '',
        userName:
            value.userName ||
            value.userNama ||
            details.userNama ||
            details.userName ||
            value.nama ||
            '-',
        title: titleMap[collectionName] || id,
        description: descriptionMap[collectionName] || '-',
        dateLabel:
            details.tanggal ||
            value.tanggalRegistrasi ||
            value.tanggalPengujian ||
            value.tanggalPenerbitan ||
            '-',
        timestamp: getSafeTimestamp(
            value.timestamp,
            details.timestamp,
            value.updatedAt,
            value.createdAt,
            details.appointmentTimeMillis,
        ),
        raw: {
            token: value.token || details.token || id,
            ...value,
        },
    };
};

const useHistoryStore = create<HistoryState & HistoryAction>()((set) => ({
    users: [],
    activities: [],
    isLoading: false,
    isSaving: false,
    error: null,

    subscribe: () => {
        set({ isLoading: true, error: null });

        const dataStore: Record<string, any[]> = {
            users: [],
            history: [],
            historyLabUmum: [],
            historyLabOfficial: [],
            historySMKHPOnline: [],
            historyCSOnline: [],
        };
        const loaded: LoadedMap = {};

        const flush = () => {
            const users = (dataStore.users || []) as HistoryUser[];
            const activities = [
                ...(dataStore.history || []),
                ...(dataStore.historyLabUmum || []),
                ...(dataStore.historyLabOfficial || []),
                ...(dataStore.historySMKHPOnline || []),
                ...(dataStore.historyCSOnline || []),
            ] as UserActivity[];

            set({
                users: users.sort((a, b) => {
                    return (
                        getSafeTimestamp(b.updatedAt, b.createdAt) -
                        getSafeTimestamp(a.updatedAt, a.createdAt)
                    );
                }),
                activities: activities.sort(
                    (a, b) => b.timestamp - a.timestamp,
                ),
                isLoading: COLLECTION_KEYS.some((key) => !loaded[key]),
            });
        };

        const unsubscribers = COLLECTION_KEYS.map((collectionName) =>
            onSnapshot(
                collection(db, collectionName),
                (snapshot) => {
                    dataStore[collectionName] = snapshot.docs.map((item) => {
                        const value = item.data();
                        return collectionName === 'users'
                            ? normalizeUser(item.id, value)
                            : normalizeHistory(collectionName, item.id, value);
                    });
                    loaded[collectionName] = true;
                    flush();
                },
                (error) => {
                    console.error(`${collectionName} stream error`, error);
                    loaded[collectionName] = true;
                    set({ error: error.message });
                    flush();
                },
            ),
        );

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    },

    updateNoAjuList: async (userId, noAjuList) => {
        set({ isSaving: true, error: null });

        try {
            await updateDoc(doc(db, 'users', userId), {
                noAjuList: noAjuList.map((item) => ({
                    noAju: item.noAju.trim(),
                    expiredAju: normalizeNoAjuDate(item.expiredAju),
                })),
                updatedAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error: any) {
            const message = error?.message || 'Gagal menyimpan noAju user.';
            set({ error: message });
            return { success: false, message };
        } finally {
            set({ isSaving: false });
        }
    },
}));

export default useHistoryStore;
