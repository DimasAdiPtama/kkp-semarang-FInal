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
export type SMKHPData = {
    token: string;
    userName: string;
    nomorHp: string;
    npwp: string;
    status: string;
    subStatus: string;
    queueNo: number;
};

export type SMKHPDetail = {
    queueNo: number;
    userName: string;
    token: string;
    npwp: string;
};

type SMKHPOfflineState = {
    smkhp: SMKHPData[];
    smkhp_detail: SMKHPDetail | null;
    petugas: {
        nama: string;
        nip: string;
    };
    isLoading: boolean;
    error: string | null;
};

type SMKHPOfflineAction = {
    getSMKHP: () => () => void;
    getSMKHPByToken: (token: string) => Promise<void>;
    updateSMKHPHandle: (token: string, catatan?: string) => Promise<boolean>;
    updateSMKHPStatus: (token: string, status: string) => Promise<boolean>;
    setPetugas: (nama: string, nip: string) => void;
    setField: <K extends keyof SMKHPOfflineState>(
        key: K,
        value: SMKHPOfflineState[K],
    ) => void;
};

const initialState: SMKHPOfflineState = {
    smkhp: [],
    smkhp_detail: null,
    petugas: { nama: '', nip: '' },
    isLoading: false,
    error: null,
};

// ================= Store =================
const useSMKHPOfflineStore = create<SMKHPOfflineState & SMKHPOfflineAction>(
    (set, get) => ({
        ...initialState,

        setField: (key, value) => set((state) => ({ ...state, [key]: value })),

        setPetugas: (nama, nip) => {
            set((state) => ({
                petugas: { ...state.petugas, nama, nip },
            }));
        },

        // 1. Ambil Antrean SMKHP (Realtime)
        getSMKHP: () => {
            set({ isLoading: true });

            return onSnapshot(
                collection(db, 'SMKHP'),
                (snap) => {
                    const data = snap.docs.map((doc) => ({
                        token: doc.id,
                        userName:
                            doc.data().userNama ||
                            doc.data().userName ||
                            'Tanpa Nama',
                        nomorHp: doc.data().nomorHp || '-',
                        npwp: doc.data().npwp || '-',
                        status: doc.data().status,
                        subStatus: doc.data().subStatus,
                        queueNo: doc.data().queueNo,
                    }));
                    set({ smkhp: data, isLoading: false });
                },
                (err) => {
                    set({ error: err.message, isLoading: false });
                    console.error('SMKHP Stream Error:', err);
                },
            );
        },

        // 2. Ambil Detail Antrean Berdasarkan Token
        getSMKHPByToken: async (token: string) => {
            set({ isLoading: true, error: null, smkhp_detail: null });
            try {
                const docSnap = await getDoc(doc(db, 'SMKHP', token));
                if (docSnap.exists()) {
                    const d = docSnap.data();
                    set({
                        smkhp_detail: {
                            queueNo: d.queueNo,
                            userName: d.userNama || d.userName || 'Tanpa Nama',
                            token: token,
                            npwp: d.npwp || '-',
                        },
                    });
                } else {
                    throw new Error('Data antrean tidak ditemukan.');
                }
            } catch (err: any) {
                set({ error: err.message });
                alert(err.message);
            } finally {
                set({ isLoading: false });
            }
        },

        // 3. Selesaikan Antrean (Update Status & Simpan Catatan Petugas)
        updateSMKHPHandle: async (token, catatan) => {
            const { petugas } = get();

            if (!petugas.nama || !petugas.nip) {
                alert('Identitas petugas belum diatur. Harap login kembali.');
                return false;
            }

            set({ isLoading: true });
            try {
                // Update status antrean di Firestore
                await updateDoc(doc(db, 'SMKHP', token), {
                    subStatus: 'Selesai',
                    status: 'active',
                    updatedAt: Date.now(),
                });

                // Simpan catatan audit petugas
                await setDoc(doc(db, 'officer_notes', token), {
                    nama_petugas: petugas.nama,
                    nip_petugas: petugas.nip,
                    catatan: catatan || '',
                    layanan: 'SMKHP',
                    timestamp: Date.now(),
                });

                alert('Antrean SMKHP berhasil diselesaikan.');
                return true;
            } catch (err: any) {
                alert('Gagal menyelesaikan antrean: ' + err.message);
                return false;
            } finally {
                set({ isLoading: false });
            }
        },

        // 4. Update Sub-Status (Misal: Dipanggil, Menunggu, dll)
        updateSMKHPStatus: async (token, status) => {
            try {
                await updateDoc(doc(db, 'SMKHP', token), { subStatus: status });
                return true;
            } catch (err: any) {
                alert('Gagal memperbarui status: ' + err.message);
                return false;
            }
        },
    }),
);

export default useSMKHPOfflineStore;
