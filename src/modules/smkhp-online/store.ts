import { create } from 'zustand';
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

export type SMKHPOnlineStatus = 'pending' | 'di proses' | 'Selesai';

export type SMKHPOnlineData = {
    token: string;
    details: {
        formattedNo: string;
        isOnline: boolean;
        kebutuhan: string;
        linkmeet: string;
        tanggal: string;
        timemeet: string;
        typeOnline: string;
    };
    nomorHp: string;
    npwp: string;
    queueNo: number;
    rating: number;
    status: SMKHPOnlineStatus;
    subStatus: string;
    timestamp: number;
    type: string;
    uuid: string;
    userEmail: string;
    username: string;
    // Fields for officer notes
    nama_petugas?: string;
    nip_petugas?: string;
    catatan_petugas?: string;
};

type Petugas = {
    nama: string;
    nip: string;
};

type ScheduleMeetingPayload = {
    token: string;
    linkmeet: string;
    timemeet: string;
};

type SMKHPOnlineState = {
    smkhp_online: SMKHPOnlineData[];
    petugas: Petugas;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
};

type SMKHPOnlineAction = {
    getSMKHPOnline: () => () => void;
    scheduleMeeting: (
        payload: ScheduleMeetingPayload,
    ) => Promise<{ success: boolean; message?: string }>;
    finishMeeting: (
        token: string,
        catatan?: string,
    ) => Promise<{ success: boolean; message?: string }>;
    setPetugas: (nama: string, nip: string) => void;
};

const initialState: SMKHPOnlineState = {
    smkhp_online: [],
    petugas: { nama: '', nip: '' },
    isLoading: false,
    isSubmitting: false,
    error: null,
};

const normalizeStatus = (status?: string): SMKHPOnlineStatus => {
    const s = (status || '').toLowerCase();
    if (s === 'di proses' || s === 'meeting') return 'di proses';
    if (s === 'selesai' || s === 'completed') return 'Selesai';
    return 'pending';
};

const normalizeTime = (time?: string) => {
    if (!time) return '';

    const [hour = '', minute = ''] = time.split(':');
    if (!hour || !minute) return time;

    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

const findUserByEmail = async (email: string) => {
    if (!email) return null;

    const snapshot = await getDocs(
        query(collection(db, 'users'), where('email', '==', email)),
    );

    const docSnap = snapshot.docs[0];
    return docSnap ? docSnap.data() : null;
};

const useSMKHPOnlineStore = create<SMKHPOnlineState & SMKHPOnlineAction>()(
    (set, get) => ({
        ...initialState,

        setPetugas: (nama, nip) => {
            set((state) => ({
                petugas: { ...state.petugas, nama, nip },
            }));
        },

        getSMKHPOnline: () => {
            set({ isLoading: true, error: null });

            return onSnapshot(
                query(collection(db, 'onlineSMKHP'), orderBy('queueNo', 'asc')),
                (snapshot) => {
                    const data = snapshot.docs.map((item) => {
                        const value = item.data();
                        const details = (value.details || {}) as any;

                        return {
                            token: item.id,
                            details: {
                                formattedNo: details.formattedNo || item.id,
                                isOnline: !!details.isOnline,
                                kebutuhan: details.kebutuhan || '-',
                                linkmeet: details.linkmeet || '',
                                tanggal: details.tanggal || '',
                                timemeet: normalizeTime(details.timemeet),
                                typeOnline: details.typeOnline || '',
                            },
                            nomorHp: value.nomorHp || value.nomerHp || '-',
                            npwp: value.npwp || '-',
                            queueNo: Number(value.queueNo || 0),
                            rating: Number(value.rating || 0),
                            status: normalizeStatus(value.status),
                            subStatus: value.subStatus || '',
                            timestamp: Number(value.timestamp || 0),
                            type: value.type || '',
                            uuid: value.uuid || value.uid || '',
                            userEmail: value.userEmail || value.email || '',
                            username:
                                value.username || value.nama || 'Tanpa Nama',
                            nama_petugas: value.nama_petugas || '',
                            nip_petugas: value.nip_petugas || '',
                            catatan_petugas:
                                value.catatan_petugas || value.comment || '',
                        } satisfies SMKHPOnlineData;
                    });

                    set({
                        smkhp_online: data,
                        isLoading: false,
                        error: null,
                    });
                },
                (error) => {
                    console.error('SMKHP Online Stream Error:', error);
                    set({
                        isLoading: false,
                        error: error.message,
                    });
                },
            );
        },

        scheduleMeeting: async ({ token, linkmeet, timemeet }) => {
            const item = get().smkhp_online.find(
                (queue) => queue.token === token,
            );

            if (!item) {
                const message = 'Data antrean SMKHP online tidak ditemukan.';
                alert(message);
                return { success: false, message };
            }

            const normalizedTime = normalizeTime(timemeet);

            const isConflict = get().smkhp_online.some((queue) => {
                return (
                    queue.token !== token &&
                    queue.status === 'di proses' &&
                    queue.details.tanggal === item.details.tanggal &&
                    normalizeTime(queue.details.timemeet) === normalizedTime
                );
            });

            if (isConflict) {
                const message =
                    'Jadwal meeting bentrok dengan antrean SMKHP online lain di tanggal dan jam yang sama.';
                alert(message);
                return { success: false, message };
            }

            set({ isSubmitting: true, error: null });

            try {
                await updateDoc(doc(db, 'onlineSMKHP', token), {
                    'details.linkmeet': linkmeet.trim(),
                    'details.timemeet': normalizedTime,
                    status: 'di proses',
                    subStatus: 'Telah Dikonfirmasi',
                    updatedAt: Date.now(),
                });

                return { success: true };
            } catch (error: any) {
                const message =
                    error?.message ||
                    'Gagal menyimpan jadwal meeting SMKHP online.';
                alert(message);
                return { success: false, message };
            } finally {
                set({ isSubmitting: false });
            }
        },

        finishMeeting: async (token, catatan) => {
            const item = get().smkhp_online.find(
                (queue) => queue.token === token,
            );
            const { petugas } = get();

            if (!item) {
                const message = 'Data antrean SMKHP online tidak ditemukan.';
                alert(message);
                return { success: false, message };
            }

            if (!petugas.nama || !petugas.nip) {
                const message = 'Data petugas login belum tersedia.';
                alert(message);
                return { success: false, message };
            }

            set({ isSubmitting: true, error: null });

            try {
                const matchedUser = await findUserByEmail(item.userEmail);

                await updateDoc(doc(db, 'onlineSMKHP', token), {
                    status: 'Selesai',
                    nama_petugas: petugas.nama,
                    nip_petugas: petugas.nip,
                    catatan_petugas: catatan?.trim() || '',
                    updatedAt: Date.now(),
                });

                await setDoc(doc(db, 'officer_notes', token), {
                    nama_petugas: petugas.nama,
                    nip_petugas: petugas.nip,
                    catatan: catatan?.trim() || '',
                    layanan: 'SMKHP Online',
                    token,
                    nomor_antrian: item.details.formattedNo || token,
                    nomor_aju: item.npwp || '', // SMKHP online usually uses NPWP or similar
                    jadwal_meeting: {
                        tanggal: item.details.tanggal || '',
                        jam: item.details.timemeet || '',
                        link: item.details.linkmeet || '',
                    },
                    timestamp: Date.now(),
                });

                await setDoc(doc(db, 'historySMKHPOnline', token), {
                    token,
                    formattedNo: item.details.formattedNo || token,
                    email: item.userEmail || '',
                    nama: item.username || '',
                    nik: '', // From schema provided, nik is not explicit but could be present
                    npwp: item.npwp || matchedUser?.npwp || '',
                    nomorHp: item.nomorHp || '',
                    queueNo: item.queueNo || 0,
                    status: 'Selesai',
                    subStatus: 'Selesai',
                    tanggalRegistrasi: item.details.tanggal || '',
                    timemeet: item.details.timemeet || '',
                    linkmeet: item.details.linkmeet || '',
                    nama_petugas: petugas.nama,
                    nip_petugas: petugas.nip,
                    catatan_petugas: catatan?.trim() || '',
                    uid: matchedUser?.uid || item.uuid || '',
                    timestamp: Date.now(),
                    updatedAt: Date.now(),
                });

                return { success: true };
            } catch (error: any) {
                const message =
                    error?.message ||
                    'Gagal menyelesaikan meeting SMKHP online.';
                alert(message);
                return { success: false, message };
            } finally {
                set({ isSubmitting: false });
            }
        },
    }),
);

export default useSMKHPOnlineStore;
