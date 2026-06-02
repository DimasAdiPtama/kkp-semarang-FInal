import { create } from 'zustand';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../shared/configs/firebase';

type AuthState = {
    email: string;
    password: string;
    is_loading: boolean;
    is_error: boolean;
    message: string;
    response: {
        id: string;
        email: string;
        full_name: string;
        nip: string;
        role: string;
    };
};

type AuthAction = {
    set_field: <K extends keyof AuthState>(key: K, value: AuthState[K]) => void;
    login: (e?: React.FormEvent) => Promise<{
        success: boolean;
        data?: AuthState['response'];
        message?: string;
    }>;
};

const initialState: AuthState = {
    email: '',
    password: '',
    is_loading: false,
    is_error: false,
    message: '',
    response: { id: '', email: '', full_name: '', nip: '', role: '' },
};

const useAuthStore = create<AuthState & AuthAction>()((set, get) => ({
    ...initialState,
    set_field: (key, value) => set((state) => ({ ...state, [key]: value })),

    login: async (e?: React.FormEvent) => {
        e?.preventDefault();
        const { email, password } = get();
        set({ is_loading: true, is_error: false, message: '' });

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );
            const uid = userCredential.user.uid;
            const officerDoc = await getDoc(doc(db, 'officers', uid));

            if (officerDoc.exists()) {
                const data = officerDoc.data();
                const userData = {
                    id: uid,
                    email: data.email || '',
                    full_name: data.full_name || '',
                    role: data.role || '',
                    nip: data.nip || '',
                };

                set({ response: userData, is_loading: false });
                return { success: true, data: userData };
            } else {
                throw new Error('User tidak ditemukan di Firestore.');
            }
        } catch (error: any) {
            let errMsg = error.message;
            if (error.code === 'auth/invalid-credential')
                errMsg = 'Email atau password salah.';
            set({ is_error: true, message: errMsg, is_loading: false });
            return { success: false, message: errMsg };
        }
    },
}));

export default useAuthStore;
