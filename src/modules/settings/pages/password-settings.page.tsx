import * as React from 'react';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import { Button } from '../../../shared/components';
import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';
import { auth } from '../../../shared/configs/firebase';

export default function PasswordSettingsPage() {
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) return alert('Sesi login tidak ditemukan.');
        if (newPassword.length < 6)
            return alert('Password minimal 6 karakter.');
        if (newPassword !== confirmPassword)
            return alert('Konfirmasi password tidak cocok.');

        setIsSaving(true);
        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword,
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            alert('Password berhasil diperbarui.');
        } catch (error) {
            console.error(error);
            alert('Gagal memperbarui password. Pastikan password lama benar.');
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
                        Ubah Password
                    </h1>
                    <input
                        type="password"
                        className="h-10 w-full rounded-sm border border-slate-300 px-3"
                        placeholder="Password saat ini"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        className="h-10 w-full rounded-sm border border-slate-300 px-3"
                        placeholder="Password baru"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        className="h-10 w-full rounded-sm border border-slate-300 px-3"
                        placeholder="Konfirmasi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Update Password'}
                    </Button>
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
