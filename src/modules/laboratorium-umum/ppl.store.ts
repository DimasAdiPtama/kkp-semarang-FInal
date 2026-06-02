import { create } from 'zustand';
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../../shared/configs/firebase';

export type PPLData = {
    id: string;
    alamat: string;
    email: string;
    nama: string;
    nomorHp: string;
    npwp: string;
    status: string;
    ticketNumber: string;
    timestamp: any;
    uid: string;
};

type PPLState = {
    pplItems: PPLData[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
};

type PPLAction = {
    getPPLItems: () => () => void;
    acceptPPL: (id: string) => Promise<{ success: boolean; message?: string }>;
    rejectPPL: (id: string) => Promise<{ success: boolean; message?: string }>;
};

const usePPLStore = create<PPLState & PPLAction>((set) => ({
    pplItems: [],
    isLoading: false,
    isSubmitting: false,
    error: null,

    getPPLItems: () => {
        set({ isLoading: true });
        const q = query(collection(db, 'PPL'), orderBy('timestamp', 'desc'));
        return onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as PPLData[];
                set({ pplItems: items, isLoading: false });
            },
            (error) => {
                set({ error: error.message, isLoading: false });
            },
        );
    },

    acceptPPL: async (id) => {
        set({ isSubmitting: true });
        try {
            await updateDoc(doc(db, 'PPL', id), { status: 'active' });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        } finally {
            set({ isSubmitting: false });
        }
    },

    rejectPPL: async (id) => {
        set({ isSubmitting: true });
        try {
            await updateDoc(doc(db, 'PPL', id), { status: 'ditolak' });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        } finally {
            set({ isSubmitting: false });
        }
    },
}));

export default usePPLStore;
