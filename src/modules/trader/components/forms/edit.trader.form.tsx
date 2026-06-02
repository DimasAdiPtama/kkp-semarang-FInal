import { useEffect } from 'react';
import { Form, TextInput, Button } from '../../../../shared/components';
import useTraderStore from '../../store';

export default function EditTraderForm({ id }: { id: string }) {
    const { trader, getTraderById, updateTrader, isLoading, clearState } =
        useTraderStore();

    useEffect(() => {
        if (id) {
            getTraderById(id);
        }
        return () => clearState();
    }, [id, getTraderById, clearState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            kode_trader: formData.get('kode_trader') as string,
            nama_trader: formData.get('nama_trader') as string,
            npwp: formData.get('npwp') as string,
            alamat_trader: formData.get('alamat_trader') as string,
        };

        await updateTrader(id, data);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput
                name="kode_trader"
                label="Kode Trader"
                placeholder="Masukkan kode trader"
                defaultValue={trader?.kode_trader || ''}
                required
                disabled={isLoading}
            />
            <TextInput
                name="nama_trader"
                label="Nama Trader"
                placeholder="Masukkan nama trader"
                defaultValue={trader?.nama_trader || ''}
                required
                disabled={isLoading}
            />
            <TextInput
                name="npwp"
                label="NPWP"
                placeholder="Masukkan npwp trader"
                defaultValue={trader?.npwp || ''}
                required
                disabled={isLoading}
            />
            <TextInput
                name="alamat_trader"
                label="Alamat"
                placeholder="Masukkan alamat trader"
                defaultValue={trader?.alamat_trader || ''}
                required
                disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
        </Form>
    );
}
