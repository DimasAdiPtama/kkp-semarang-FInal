import { create } from 'zustand';
import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

// ================= Types =================
export type CSData = {
    token: string;
    type: string;
    userName: string;
    nomorHp: string;
    npwp: string;
    keluhan: string;
    status: string;
    subStatus: string;
    queueNo: number;
};

export type CustomerServiceDetail = {
    queueNo: number;
    userName: string;
    token: string;
    npwp: string;
    keluhan: string;
};

type Petugas = {
    nama: string;
    nip: string;
};

type CSState = {
    customer_service: CSData[];
    customer_service_detail: CustomerServiceDetail | null;
    petugas: Petugas;
    isLoading: boolean;
    error: string | null;
};

type CSAction = {
    getCustomerService: () => () => void;
    getCustomerServiceByToken: (token: string) => Promise<void>;
    updateCustomerServiceHandle: (
        token: string,
        catatan?: string,
    ) => Promise<boolean>;
    updateCustomerServiceStatus: (
        token: string,
        status: string,
    ) => Promise<boolean>;
    setPetugas: (nama: string, nip: string) => void;
    setField: <K extends keyof CSState>(key: K, value: CSState[K]) => void;
};

const initialState: CSState = {
    customer_service: [],
    customer_service_detail: null,
    petugas: { nama: '', nip: '' },
    isLoading: false,
    error: null,
};

// ================= Store =================
const useCustomerServiceOfflineStore = create<CSState & CSAction>(
    (set, get) => ({
        ...initialState,

        setField: (key, value) => set((state) => ({ ...state, [key]: value })),

        setPetugas: (nama, nip) => {
            set((state) => ({
                petugas: { ...state.petugas, nama, nip },
            }));
        },

        // 1. Ambil Antrean Customer Service (Realtime)
        getCustomerService: () => {
            set({ isLoading: true });

            return onSnapshot(
                collection(db, 'CustomerService'),
                (snap) => {
                    const data = snap.docs.map((doc) => ({
                        token: doc.id,
                        type: 'Customer Service',
                        userName:
                            doc.data().userNama ||
                            doc.data().userName ||
                            'Tanpa Nama',
                        nomorHp: doc.data().nomorHp || '-',
                        npwp: doc.data().npwp || '-',
                        keluhan:
                            doc.data().keluhan ||
                            doc.data().details?.keluhan ||
                            '-',
                        status: doc.data().status,
                        subStatus: doc.data().subStatus,
                        queueNo: doc.data().queueNo,
                    }));
                    set({ customer_service: data, isLoading: false });
                },
                (err) => {
                    set({ error: err.message, isLoading: false });
                    console.error('CS Stream Error:', err);
                },
            );
        },

        // 2. Ambil Detail Antrean CS Berdasarkan Token
        getCustomerServiceByToken: async (token: string) => {
            set({
                isLoading: true,
                error: null,
                customer_service_detail: null,
            });
            try {
                const docSnap = await getDoc(doc(db, 'CustomerService', token));
                if (docSnap.exists()) {
                    const d = docSnap.data();
                    const details = d.details || {};
                    set({
                        customer_service_detail: {
                            token,
                            userName: d.userNama || d.userName || 'Tanpa Nama',
                            queueNo: d.queueNo,
                            npwp: d.npwp || '-',
                            keluhan: d.keluhan || details.keluhan || '-',
                        },
                    });
                } else {
                    throw new Error('Data antrean CS tidak ditemukan.');
                }
            } catch (err: any) {
                set({ error: err.message });
                alert(err.message);
            } finally {
                set({ isLoading: false });
            }
        },

        // 3. Selesaikan Antrean CS (Update Status & Simpan Catatan)
        updateCustomerServiceHandle: async (token, catatan) => {
            const { petugas } = get();

            if (!petugas.nama || !petugas.nip) {
                alert('Identitas petugas belum diatur.');
                return false;
            }

            set({ isLoading: true });
            try {
                // Update status antrean di Firestore
                await updateDoc(doc(db, 'CustomerService', token), {
                    subStatus: 'Selesai',
                    status: 'active',
                    updatedAt: Date.now(),
                });

                // Simpan catatan audit petugas
                await setDoc(doc(db, 'officer_notes', token), {
                    nama_petugas: petugas.nama,
                    nip_petugas: petugas.nip,
                    catatan: catatan || '',
                    layanan: 'Customer Service',
                    timestamp: Date.now(),
                });

                alert('Layanan CS berhasil diselesaikan.');
                return true;
            } catch (err: any) {
                alert('Gagal menutup layanan CS: ' + err.message);
                return false;
            } finally {
                set({ isLoading: false });
            }
        },

        // 4. Update Sub-Status (Misal: Dipanggil, Menunggu, dll)
        updateCustomerServiceStatus: async (token, status) => {
            try {
                await updateDoc(doc(db, 'CustomerService', token), {
                    subStatus: status,
                });
                return true;
            } catch (err: any) {
                alert('Gagal memperbarui status CS: ' + err.message);
                return false;
            }
        },
    }),
);

export default useCustomerServiceOfflineStore;
