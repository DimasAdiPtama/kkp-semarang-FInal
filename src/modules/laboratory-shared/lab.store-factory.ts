import { create } from 'zustand';
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';
import type { LabHistoryItem, LabModuleConfig, LabSample } from './lab.types';
import {
    getCurrentTestingResult,
    getNextLabStatus,
    getResultItemsFromTests,
    getTotalTarif,
    isPickupStage,
    isTestingStage,
    parseSelectedTests,
} from './lab.utils';

type Petugas = {
    nama: string;
    nip: string;
};

type CompletePayload = {
    token: string;
    result?: string;
    namaLatin?: string;
    tanggalPenerbitan?: string;
    namaPenanggungJawab?: string;
    nipPenanggungJawab?: string;
};

type LabState = {
    items: LabSample[];
    histories: LabHistoryItem[];
    petugas: Petugas;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
};

type LabAction = {
    getItems: () => () => void;
    getHistories: () => () => void;
    setPetugas: (nama: string, nip: string) => void;
    advanceStatus: (
        token: string,
    ) => Promise<{ success: boolean; message?: string }>;
    submitTestingStep: (
        payload: CompletePayload,
    ) => Promise<{ success: boolean; message?: string }>;
};

const normalizeItem = (
    id: string,
    value: Record<string, any>,
    config: LabModuleConfig,
): LabSample => {
    const selectedTests = parseSelectedTests(value.selectedTests);
    const hasilUji = getResultItemsFromTests(
        selectedTests,
        value.hasilUji || [],
    );

    return {
        token: id,
        email: value.email || '',
        isOc: Boolean(value.isOc ?? config.isOc),
        jumlahKg: String(value.jumlahKg || ''),
        lhuUrl: value.lhuUrl || '',
        lpp: value.lpp || id,
        namaSampel: value.namaSampel || '-',
        namaLatin: value.namaLatin || '',
        nip: value.nip || '-',
        rawSelectedTests: Array.isArray(value.selectedTests)
            ? value.selectedTests.join(', ')
            : value.selectedTests || '',
        selectedTests,
        status: value.status || 'Menunggu Persetujuan',
        tanggalPengujian: value.tanggalPengujian || '',
        timestamp: Number(value.timestamp || 0),
        uid: value.uid || '',
        namaPetugas: value.namaPetugas || value.nama_petugas || '',
        nipPetugas: value.nipPetugas || value.nip_petugas || '',
        tanggalPenerbitan: value.tanggalPenerbitan || '',
        namaPenanggungJawab: value.namaPenanggungJawab || '',
        nipPenanggungJawab: value.nipPenanggungJawab || '',
        hasilUji,
        totalTarif: Number(value.totalTarif || getTotalTarif(hasilUji)),
    };
};

export const createLabStore = (config: LabModuleConfig) =>
    create<LabState & LabAction>()((set, get) => ({
        items: [],
        histories: [],
        petugas: { nama: '', nip: '' },
        isLoading: false,
        isSubmitting: false,
        error: null,

        setPetugas: (nama, nip) =>
            set((state) => ({
                petugas: { ...state.petugas, nama, nip },
            })),

        getItems: () => {
            set({ isLoading: true, error: null });

            return onSnapshot(
                query(
                    collection(db, config.collectionName),
                    orderBy('timestamp', 'desc'),
                ),
                (snapshot) => {
                    const items = snapshot.docs.map((item) =>
                        normalizeItem(item.id, item.data(), config),
                    );

                    set({ items, isLoading: false, error: null });
                },
                (error) => {
                    console.error(`${config.title} stream error:`, error);
                    set({ isLoading: false, error: error.message });
                },
            );
        },

        getHistories: () => {
            return onSnapshot(
                query(
                    collection(db, config.historyCollectionName),
                    orderBy('timestamp', 'desc'),
                ),
                (snapshot) => {
                    const histories = snapshot.docs.map((item) => {
                        const normalized = normalizeItem(
                            item.id,
                            item.data(),
                            config,
                        );
                        return {
                            ...normalized,
                            sourceCollection: config.collectionName,
                            historyCollection: config.historyCollectionName,
                        } satisfies LabHistoryItem;
                    });

                    set({ histories });
                },
                (error) => {
                    console.error(
                        `${config.historyCollectionName} stream error:`,
                        error,
                    );
                },
            );
        },

        advanceStatus: async (token) => {
            const item = get().items.find((queue) => queue.token === token);

            if (!item) {
                const message = 'Data sampel laboratorium tidak ditemukan.';
                alert(message);
                return { success: false, message };
            }

            if (isTestingStage(item.status)) {
                const message =
                    'Pengujian yang sedang berjalan harus diisi hasilnya terlebih dahulu.';
                alert(message);
                return { success: false, message };
            }

            try {
                if (isPickupStage(item.status)) {
                    const { petugas } = get();

                    if (
                        !item.tanggalPenerbitan ||
                        !item.namaPenanggungJawab ||
                        !item.nipPenanggungJawab
                    ) {
                        const message =
                            'Data penerbitan LHU belum lengkap. Lengkapi sebelum menyelesaikan.';
                        alert(message);
                        return { success: false, message };
                    }

                    const sourcePayload = {
                        email: item.email,
                        isOc: item.isOc,
                        jumlahKg: item.jumlahKg,
                        lhuUrl: item.lhuUrl || '',
                        lpp: item.lpp,
                        namaSampel: item.namaSampel,
                        namaLatin: item.namaLatin || '',
                        nip: item.nip,
                        selectedTests: item.rawSelectedTests,
                        status: 'Selesai',
                        tanggalPengujian: item.tanggalPengujian,
                        timestamp: item.timestamp || Date.now(),
                        uid: item.uid,
                        hasilUji: item.hasilUji,
                        totalTarif:
                            item.totalTarif || getTotalTarif(item.hasilUji),
                        namaPetugas: petugas.nama || item.namaPetugas,
                        nipPetugas: petugas.nip || item.nipPetugas,
                        tanggalPenerbitan: item.tanggalPenerbitan,
                        namaPenanggungJawab: item.namaPenanggungJawab,
                        nipPenanggungJawab: item.nipPenanggungJawab,
                        updatedAt: Date.now(),
                    };

                    await updateDoc(
                        doc(db, config.collectionName, token),
                        sourcePayload,
                    );
                    await setDoc(doc(db, config.historyCollectionName, token), {
                        ...sourcePayload,
                        sourceCollection: config.collectionName,
                        historyCollection: config.historyCollectionName,
                        reportLabel: config.reportLabel,
                        timestamp: Date.now(),
                    });

                    return { success: true };
                }

                const nextStatus = getNextLabStatus(item);

                await updateDoc(doc(db, config.collectionName, token), {
                    status: nextStatus,
                    updatedAt: Date.now(),
                });

                return { success: true };
            } catch (error: any) {
                const message =
                    error?.message ||
                    `Gagal memperbarui status ${config.title}.`;
                alert(message);
                return { success: false, message };
            }
        },

        submitTestingStep: async ({
            token,
            result,
            namaLatin,
            tanggalPenerbitan,
            namaPenanggungJawab,
            nipPenanggungJawab,
        }) => {
            const item = get().items.find((queue) => queue.token === token);
            const { petugas } = get();

            if (!item) {
                const message = 'Data sampel laboratorium tidak ditemukan.';
                alert(message);
                return { success: false, message };
            }

            if (!petugas.nama || !petugas.nip) {
                const message = 'Data petugas login belum tersedia.';
                alert(message);
                return { success: false, message };
            }

            set({ isSubmitting: true, error: null });

            const currentTestingResult = getCurrentTestingResult(item);
            const isTesting = isTestingStage(item.status);
            const nextStatus = isTesting ? getNextLabStatus(item) : item.status;

            const results = item.hasilUji.map((entry) => {
                if (entry.testKey === currentTestingResult?.testKey) {
                    return { ...entry, result: result?.trim() || entry.result };
                }

                return entry;
            });
            const totalTarif = getTotalTarif(results);

            if (isTesting && !result?.trim()) {
                const message = 'Hasil uji untuk tahap saat ini wajib diisi.';
                alert(message);
                set({ isSubmitting: false });
                return { success: false, message };
            }

            if (
                isTesting &&
                nextStatus ===
                    'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya' &&
                (!tanggalPenerbitan ||
                    !namaPenanggungJawab ||
                    !nipPenanggungJawab)
            ) {
                const message =
                    'Tanggal penerbitan dan data penanggung jawab wajib diisi saat LHU diterbitkan.';
                alert(message);
                set({ isSubmitting: false });
                return { success: false, message };
            }

            const sourcePayload = {
                email: item.email,
                isOc: item.isOc,
                jumlahKg: item.jumlahKg,
                lhuUrl: item.lhuUrl || '',
                lpp: item.lpp,
                namaSampel: item.namaSampel,
                namaLatin: namaLatin?.trim() || item.namaLatin || '',
                nip: item.nip,
                selectedTests: item.rawSelectedTests,
                status: nextStatus,
                tanggalPengujian: item.tanggalPengujian,
                timestamp: item.timestamp || Date.now(),
                uid: item.uid,
                hasilUji: results,
                totalTarif,
                namaPetugas: petugas.nama,
                nipPetugas: petugas.nip,
                tanggalPenerbitan:
                    tanggalPenerbitan || item.tanggalPenerbitan || '',
                namaPenanggungJawab:
                    namaPenanggungJawab || item.namaPenanggungJawab || '',
                nipPenanggungJawab:
                    nipPenanggungJawab || item.nipPenanggungJawab || '',
                updatedAt: Date.now(),
            };

            try {
                await updateDoc(
                    doc(db, config.collectionName, token),
                    sourcePayload,
                );

                return { success: true };
            } catch (error: any) {
                const message =
                    error?.message ||
                    `Gagal menyimpan hasil uji ${config.title}.`;
                alert(message);
                return { success: false, message };
            } finally {
                set({ isSubmitting: false });
            }
        },
    }));
