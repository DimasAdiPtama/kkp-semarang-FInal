import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type GlobalState = {
    state: {
        id: string;
        email: string;
        full_name: string;
        nip: string;
        role: string;
    };
};

type GlobalAction = {
    set_global_state: (data: GlobalState['state']) => void;
    reset_global_state: () => void;
};

const initialState: GlobalState = {
    state: {
        id: '',
        email: '',
        full_name: '',
        nip: '',
        role: '',
    },
};

const useGlobalStore = create<GlobalState & GlobalAction>()(
    persist(
        (set) => ({
            ...initialState,
            set_global_state: (data) => set({ state: data }),
            reset_global_state: () => set(initialState),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

export default useGlobalStore;
