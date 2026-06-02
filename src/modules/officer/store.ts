import { create } from 'zustand';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import {
    doc,
    updateDoc,
    collection,
    getDocs,
    deleteDoc,
    setDoc,
    getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../../shared/configs/firebase';

export type Officer = {
    id: string;
    full_name: string;
    nip: string;
    role: string;
    email?: string;
};

type OfficerManagementState = {
    officers: Officer[];
    id: string;
    full_name: string;
    nip: string;
    role: string;
    is_loading: boolean;
    is_error: boolean;
    message: string;
};

type OfficerManagementAction = {
    set_field: <K extends keyof OfficerManagementState>(
        key: K,
        value: OfficerManagementState[K],
    ) => void;
    get_officers: () => Promise<void>;
    update_officer: (id: string) => Promise<void>;
    create_officer: () => Promise<void>;
    import_officers: (
        rows: Array<{
            full_name: string;
            nip: string;
            role: string;
            email?: string;
        }>,
    ) => Promise<{ success: boolean; message: string }>;
    get_officer_by_id: (id: string) => Promise<void>;
    delete_officer: (id: string) => Promise<void>;
    reset_form: () => void;
};

const initialState: Omit<
    OfficerManagementState,
    'is_loading' | 'is_error' | 'message'
> = {
    officers: [],
    id: '',
    full_name: '',
    nip: '',
    role: '',
};

const generateEmail = (name: string) => {
    const firstName = name.trim().split(' ')[0].toLowerCase();
    return `${firstName}.${Math.floor(Math.random() * 1000)}@company.com`;
};

const createImportEmail = (name: string, nip: string) => {
    const baseName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.|\.$/g, '');
    const safeNip = nip.replace(/\s+/g, '');

    return `${baseName || 'officer'}.${safeNip}@company.com`;
};

const useOfficerManagementStore = create<
    OfficerManagementState & OfficerManagementAction
>()((set, get) => ({
    ...initialState,
    is_loading: false,
    is_error: false,
    message: '',

    set_field: (key, value) => set((state) => ({ ...state, [key]: value })),

    reset_form: () => set({ id: '', full_name: '', nip: '', role: '' }),

    get_officers: async () => {
        set({ is_loading: true, is_error: false, message: '' });
        try {
            const snapshot = await getDocs(collection(db, 'officers'));
            const officersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Officer[];
            set({ officers: officersData, is_loading: false });
        } catch (error: any) {
            set({ is_loading: false, is_error: true, message: error.message });
            alert('Gagal mengambil daftar petugas: ' + error.message);
        }
    },

    create_officer: async () => {
        const { full_name, nip, role } = get();

        if (!full_name || !nip || !role) {
            alert('Semua field harus diisi!');
            return;
        }

        set({ is_loading: true, is_error: false, message: '' });

        try {
            const email = generateEmail(full_name);
            // NIP digunakan sebagai password (minimal 6 karakter untuk Firebase)
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                nip,
            );
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'officers', uid), {
                full_name,
                nip,
                role,
                email,
                created_at: new Date().toISOString(),
            });

            alert('Petugas berhasil ditambahkan!');
            get().reset_form();
            await get().get_officers();
        } catch (error: any) {
            set({ is_loading: false, is_error: true, message: error.message });
            alert('Gagal membuat petugas: ' + error.message);
        }
    },

    import_officers: async (rows) => {
        set({ is_loading: true, is_error: false, message: '' });

        const normalizedRows = rows
            .map((row) => ({
                full_name: String(row.full_name || '').trim(),
                nip: String(row.nip || '').trim(),
                role: String(row.role || '').trim(),
                email: String(row.email || '').trim(),
            }))
            .filter((row) => row.full_name && row.nip && row.role);

        if (normalizedRows.length === 0) {
            const message = 'Tidak ada data petugas valid di file Excel.';
            set({ is_loading: false, is_error: true, message });
            alert(message);
            return { success: false, message };
        }

        const secondaryApp = initializeApp(
            firebaseConfig,
            `officer-import-${Date.now()}`,
        );
        const secondaryAuth = getAuth(secondaryApp);

        try {
            for (const row of normalizedRows) {
                const email =
                    row.email || createImportEmail(row.full_name, row.nip);
                const userCredential = await createUserWithEmailAndPassword(
                    secondaryAuth,
                    email,
                    row.nip,
                );

                await setDoc(doc(db, 'officers', userCredential.user.uid), {
                    full_name: row.full_name,
                    nip: row.nip,
                    role: row.role,
                    email,
                    created_at: new Date().toISOString(),
                });
            }

            await get().get_officers();
            const message = `${normalizedRows.length} data petugas berhasil diimport.`;
            alert(message);
            return { success: true, message };
        } catch (error: any) {
            const message = error?.message || 'Gagal import data petugas.';
            set({ is_error: true, message });
            alert(message);
            return { success: false, message };
        } finally {
            await secondaryAuth.signOut().catch(() => undefined);
            await deleteApp(secondaryApp).catch(() => undefined);
            set({ is_loading: false });
        }
    },

    update_officer: async (id) => {
        const { full_name, nip, role } = get();
        set({ is_loading: true, is_error: false, message: '' });

        try {
            await updateDoc(doc(db, 'officers', id), { full_name, nip, role });
            alert('Data petugas berhasil diperbarui!');
            get().reset_form();
            await get().get_officers();
        } catch (error: any) {
            set({ is_loading: false, is_error: true, message: error.message });
            alert('Gagal memperbarui data: ' + error.message);
        }
    },

    get_officer_by_id: async (id) => {
        set({ is_loading: true, is_error: false, message: '' });
        try {
            const snapshot = await getDoc(doc(db, 'officers', id));
            if (snapshot.exists()) {
                const data = snapshot.data();
                set({
                    id: snapshot.id,
                    full_name: data.full_name,
                    nip: data.nip,
                    role: data.role,
                    is_loading: false,
                });
            }
        } catch (error: any) {
            set({ is_loading: false, is_error: true, message: error.message });
            alert('Gagal mengambil data: ' + error.message);
        }
    },

    delete_officer: async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus petugas ini?')) return;

        set({ is_loading: true, is_error: false, message: '' });
        try {
            await deleteDoc(doc(db, 'officers', id));
            set((state) => ({
                officers: state.officers.filter((off) => off.id !== id),
                is_loading: false,
            }));
            alert('Petugas berhasil dihapus.');
        } catch (error: any) {
            set({ is_loading: false, is_error: true, message: error.message });
            alert('Gagal menghapus petugas: ' + error.message);
        }
    },
}));

export default useOfficerManagementStore;
