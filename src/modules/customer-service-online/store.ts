import { create } from 'zustand';
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

export type CustomerServiceOnlineStatus = 'pending' | 'di proses' | 'Selesai';

export type CustomerServiceOnlineData = {
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
    nik: string;
    queueNo: number;
    rating: number;
    status: CustomerServiceOnlineStatus;
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

type CustomerServiceOnlineState = {
    customer_service_online: CustomerServiceOnlineData[];
    petugas: Petugas;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
};

type CustomerServiceOnlineAction = {
    getCustomerServiceOnline: () => () => void;
    scheduleMeeting: (
        payload: ScheduleMeetingPayload,
    ) => Promise<{ success: boolean; message?: string }>;
    finishMeeting: (
        token: string,
        catatan?: string,
    ) => Promise<{ success: boolean; message?: string }>;
    setPetugas: (nama: string, nip: string) => void;
};

const initialState: CustomerServiceOnlineState = {
    customer_service_online: [],
    petugas: { nama: '', nip: '' },
    isLoading: false,
    isSubmitting: false,
    error: null,
};

const normalizeStatus = (status?: string): CustomerServiceOnlineStatus => {
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

const useCustomerServiceOnlineStore = create<
    CustomerServiceOnlineState & CustomerServiceOnlineAction
>()((set, get) => ({
    ...initialState,

    setPetugas: (nama, nip) => {
        set((state) => ({
            petugas: { ...state.petugas, nama, nip },
        }));
    },

    getCustomerServiceOnline: () => {
        set({ isLoading: true, error: null });

        return onSnapshot(
            query(collection(db, 'onlineCS'), orderBy('queueNo', 'asc')),
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
                        nik: value.nik || value.NIK || '',
                        queueNo: Number(value.queueNo || 0),
                        rating: Number(value.rating || 0),
                        status: normalizeStatus(value.status),
                        subStatus: value.subStatus || '',
                        timestamp: Number(value.timestamp || 0),
                        type: value.type || '',
                        uuid: value.uuid || value.uid || '',
                        userEmail: value.userEmail || value.email || '',
                        username:
                            value.userNama ||
                            value.username ||
                            value.nama ||
                            value.name ||
                            'Tanpa Nama',
                        nama_petugas: value.nama_petugas || '',
                        nip_petugas: value.nip_petugas || '',
                        catatan_petugas:
                            value.catatan_petugas || value.comment || '',
                    } satisfies CustomerServiceOnlineData;
                });

                set({
                    customer_service_online: data,
                    isLoading: false,
                    error: null,
                });
            },
            (error) => {
                console.error('Customer Service Online Stream Error:', error);
                set({
                    isLoading: false,
                    error: error.message,
                });
            },
        );
    },

    scheduleMeeting: async ({ token, linkmeet, timemeet }) => {
        const item = get().customer_service_online.find(
            (queue) => queue.token === token,
        );

        if (!item) {
            const message = 'Data antrean online tidak ditemukan.';
            alert(message);
            return { success: false, message };
        }

        const normalizedTime = normalizeTime(timemeet);

        const isConflict = get().customer_service_online.some((queue) => {
            return (
                queue.token !== token &&
                queue.status === 'di proses' &&
                queue.details.tanggal === item.details.tanggal &&
                normalizeTime(queue.details.timemeet) === normalizedTime
            );
        });

        if (isConflict) {
            const message =
                'Jadwal meeting bentrok dengan antrean lain di tanggal dan jam yang sama.';
            alert(message);
            return { success: false, message };
        }

        set({ isSubmitting: true, error: null });

        try {
            await updateDoc(doc(db, 'onlineCS', token), {
                'details.linkmeet': linkmeet.trim(),
                'details.timemeet': normalizedTime,
                status: 'di proses',
                subStatus: 'Telah Dikonfirmasi',
                updatedAt: Date.now(),
            });

            return { success: true };
        } catch (error: any) {
            const message =
                error?.message || 'Gagal menyimpan jadwal meeting online.';
            alert(message);
            return { success: false, message };
        } finally {
            set({ isSubmitting: false });
        }
    },

    finishMeeting: async (token, catatan) => {
        const item = get().customer_service_online.find(
            (queue) => queue.token === token,
        );
        const { petugas } = get();

        if (!item) {
            const message = 'Data antrean online tidak ditemukan.';
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
            const batch = writeBatch(db);

            const activeRef = doc(db, 'onlineCS', token);
            const notesRef = doc(db, 'officer_notes', token);
            const historyRef = doc(db, 'historyCSOnline', token);

            // 1. Write to officer_notes
            batch.set(notesRef, {
                nama_petugas: petugas.nama,
                nip_petugas: petugas.nip,
                catatan: catatan?.trim() || '',
                layanan: 'Customer Service Online',
                token,
                nomor_antrian: item.details.formattedNo || token,
                jadwal_meeting: {
                    tanggal: item.details.tanggal || '',
                    jam: item.details.timemeet || '',
                    link: item.details.linkmeet || '',
                },
                timestamp: Date.now(),
            });

            // 2. Write to historyCSOnline
            batch.set(historyRef, {
                token,
                formattedNo: item.details.formattedNo || token,
                email: item.userEmail || '',
                name: item.username || '',
                nik: matchedUser?.nik || matchedUser?.NIK || item.nik || '',
                npwp: item.npwp || matchedUser?.npwp || '',
                nomorHp: item.nomorHp || '',
                kebutuhan: item.details.kebutuhan || '',
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

            // 3. Delete from active queues (onlineCS)
            batch.delete(activeRef);

            // Commit transaction
            await batch.commit();

            return { success: true };
        } catch (error: any) {
            const message =
                error?.message || 'Gagal menyelesaikan meeting online.';
            alert(message);
            return { success: false, message };
        } finally {
            set({ isSubmitting: false });
        }
    },
}));

export default useCustomerServiceOnlineStore;
