import { create } from 'zustand';
import {
    collection,
    onSnapshot,
    query,
    doc,
    deleteDoc,
    setDoc,
    getDoc,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

export interface Trader {
    id: string;
    nama_trader: string;
    kode_trader: string;
    npwp: string;
    alamat_trader: string;
}

export type TraderForm = Omit<Trader, 'id'>;

type TraderState = {
    traders: Trader[];
    trader: Trader | null;
    isLoading: boolean;
    error: string | null;
};

type TraderAction = {
    getTraders: () => () => void;
    getTraderById: (id: string) => Promise<void>;
    addTrader: (data: TraderForm) => Promise<boolean>;
    importTraders: (rows: TraderForm[]) => Promise<{
        success: boolean;
        message: string;
    }>;
    updateTrader: (oldId: string, data: TraderForm) => Promise<boolean>;
    deleteTrader: (id: string) => Promise<boolean>;
    clearState: () => void;
};

// ================= Store =================
const useTraderStore = create<TraderState & TraderAction>((set) => ({
    traders: [],
    trader: null,
    isLoading: false,
    error: null,

    clearState: () => set({ error: null, trader: null, isLoading: false }),

    getTraders: () => {
        set({ isLoading: true, error: null });
        const q = query(collection(db, 'traders'));

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Trader[];
                set({ traders: data, isLoading: false });
            },
            (err) => {
                set({
                    error: 'Koneksi terputus: ' + err.message,
                    isLoading: false,
                });
            },
        );

        return unsubscribe;
    },

    getTraderById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const docSnap = await getDoc(doc(db, 'traders', id));
            if (docSnap.exists()) {
                set({
                    trader: { id: docSnap.id, ...docSnap.data() } as Trader,
                    isLoading: false,
                });
            } else {
                throw new Error('Trader tidak ditemukan di database.');
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addTrader: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const rawNPWP = String(data.npwp).trim();
            if (!rawNPWP) throw new Error('NPWP wajib diisi.');

            const docRef = doc(db, 'traders', rawNPWP);
            const checkDoc = await getDoc(docRef);

            if (checkDoc.exists()) throw new Error('NPWP sudah terdaftar.');

            await setDoc(docRef, {
                ...data,
                npwp: rawNPWP,
                id: rawNPWP,
                created_at: new Date().toISOString(),
            });

            set({ isLoading: false });
            alert('Trader berhasil didaftarkan.');
            return true;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            alert('Gagal menambah trader: ' + err.message);
            return false;
        }
    },

    importTraders: async (rows) => {
        set({ isLoading: true, error: null });
        try {
            const cleanedRows = rows
                .map((row) => ({
                    kode_trader: String(row.kode_trader || '').trim(),
                    nama_trader: String(row.nama_trader || '').trim(),
                    npwp: String(row.npwp || '').trim(),
                    alamat_trader: String(row.alamat_trader || '').trim(),
                }))
                .filter(
                    (row) =>
                        row.kode_trader &&
                        row.nama_trader &&
                        row.npwp &&
                        row.alamat_trader,
                );

            if (cleanedRows.length === 0) {
                throw new Error('Tidak ada data trader valid di file Excel.');
            }

            await Promise.all(
                cleanedRows.map((row) =>
                    setDoc(
                        doc(db, 'traders', row.npwp),
                        {
                            ...row,
                            id: row.npwp,
                            updated_at: new Date().toISOString(),
                        },
                        { merge: true },
                    ),
                ),
            );

            const message = `${cleanedRows.length} data trader berhasil diimport.`;
            set({ isLoading: false });
            alert(message);
            return { success: true, message };
        } catch (err: any) {
            const message = err?.message || 'Gagal import data trader.';
            set({ error: message, isLoading: false });
            alert(message);
            return { success: false, message };
        }
    },

    updateTrader: async (oldId, data) => {
        set({ isLoading: true, error: null });
        try {
            const newId = String(data.npwp).trim();
            if (!newId) throw new Error('NPWP tidak boleh kosong.');

            if (oldId !== newId) {
                // Skenario: NPWP berubah, pindahkan dokumen (Delete old, Create new)
                const batch = writeBatch(db);
                const oldDocRef = doc(db, 'traders', oldId);
                const newDocRef = doc(db, 'traders', newId);

                const checkNew = await getDoc(newDocRef);
                if (checkNew.exists())
                    throw new Error(
                        'NPWP baru sudah digunakan oleh trader lain.',
                    );

                batch.set(newDocRef, { ...data, npwp: newId, id: newId });
                batch.delete(oldDocRef);
                await batch.commit();
            } else {
                // Skenario: NPWP tetap, hanya update data
                const docRef = doc(db, 'traders', oldId);
                await setDoc(docRef, { ...data, npwp: newId }, { merge: true });
            }

            set({ isLoading: false });
            alert('Data trader berhasil diperbarui.');
            return true;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            alert('Gagal memperbarui data: ' + err.message);
            return false;
        }
    },

    deleteTrader: async (id) => {
        if (!confirm('Hapus data trader ini dari sistem?')) return false;

        set({ isLoading: true, error: null });
        try {
            await deleteDoc(doc(db, 'traders', id));
            set({ isLoading: false });
            alert('Data trader berhasil dihapus.');
            return true;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            alert('Gagal menghapus data.');
            return false;
        }
    },
}));

export default useTraderStore;
