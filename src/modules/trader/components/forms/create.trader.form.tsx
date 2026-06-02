import { Form, TextInput, Button } from '../../../../shared/components';
import useTraderStore, { type TraderForm } from '../../store';

export default function CreateTraderForm() {
    // 1. Ambil action dan loading state dari store
    const { addTrader, isLoading } = useTraderStore();

    // 2. Handler untuk submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data: TraderForm = {
            kode_trader: formData.get('kode_trader') as string,
            nama_trader: formData.get('nama_trader') as string,
            npwp: formData.get('npwp') as string,
            alamat_trader: formData.get('alamat_trader') as string,
        };

        const success = await addTrader(data);
        if (success) {
            e.currentTarget.reset();
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput
                name="kode_trader"
                label="Kode Trader"
                placeholder="Masukkan kode trader"
                required
                disabled={isLoading}
            />
            <TextInput
                name="nama_trader"
                label="Nama Trader"
                placeholder="Masukkan nama trader"
                required
                disabled={isLoading}
            />
            <TextInput
                name="npwp"
                label="NPWP"
                placeholder="Masukkan NPWP trader"
                required
                disabled={isLoading}
            />
            <TextInput
                name="alamat_trader"
                label="Alamat"
                placeholder="Masukkan alamat trader"
                required
                disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Tambah Trader'}
            </Button>
        </Form>
    );
}
