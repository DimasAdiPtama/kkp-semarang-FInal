import * as React from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '../../../shared/components';
import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';
import { auth, db } from '../../../shared/configs/firebase';
import useGlobalStore from '../../../shared/stores/global.store';

export default function ProfileSettingsPage() {
    const user = useGlobalStore((state) => state.state);
    const setGlobalState = useGlobalStore((state) => state.set_global_state);
    const [fullName, setFullName] = React.useState(user.full_name || '');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            alert('Nama tidak boleh kosong.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Sesi login tidak ditemukan. Silakan login ulang.');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile(currentUser, { displayName: fullName.trim() });
            if (user.id) {
                await updateDoc(doc(db, 'officers', user.id), {
                    full_name: fullName.trim(),
                    updated_at: new Date().toISOString(),
                });
            }
            setGlobalState({ ...user, full_name: fullName.trim() });
            alert('Nama berhasil diperbarui.');
        } catch (error) {
            console.error(error);
            alert('Gagal memperbarui nama.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <main className="flex-1 p-8">
                <div className="mx-auto max-w-3xl rounded-sm border bg-white p-6 space-y-4">
                    <h1 className="text-2xl font-black uppercase">
                        Pengaturan Akun
                    </h1>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>Nama</span>
                        <input
                            className="h-10 rounded-sm border border-slate-300 px-3"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                        <span>Email</span>
                        <input
                            className="h-10 rounded-sm border border-slate-300 px-3 bg-slate-100"
                            value={user.email}
                            disabled
                        />
                    </label>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
