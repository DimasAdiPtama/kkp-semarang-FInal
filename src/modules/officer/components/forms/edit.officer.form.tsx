import { useEffect } from 'react';
import {
    Form,
    TextInput,
    SelectInput,
    Button,
} from '../../../../shared/components';

import useOfficerManagementStore from '../../store';

export default function EditOfficerForm({ id }: { id: string }) {
    // 1. Ambil state dan actions dari store
    const {
        full_name,
        nip,
        role,
        set_field,
        get_officer_by_id,
        update_officer,
        is_loading,
        reset_form,
    } = useOfficerManagementStore();

    // 2. Fetch data petugas berdasarkan ID saat komponen dimuat
    useEffect(() => {
        if (id) {
            get_officer_by_id(id);
        }

        // Cleanup: Reset form saat modal ditutup agar tidak meninggalkan jejak data
        return () => reset_form();
    }, [id, get_officer_by_id, reset_form]);

    // 3. Handler untuk submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await update_officer(id);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput
                name="id"
                label="ID Petugas"
                value={id}
                disabled
                required
            />
            <TextInput
                name="full_name"
                label="Nama Petugas"
                placeholder="Masukkan nama petugas"
                value={full_name}
                onChange={(e) =>
                    set_field('full_name', (e.target as HTMLInputElement).value)
                }
                required
                disabled={is_loading}
            />
            <TextInput
                name="nip"
                label="NIP Petugas"
                placeholder="Masukkan NIP petugas"
                value={nip}
                onChange={(e) =>
                    set_field('nip', (e.target as HTMLInputElement).value)
                }
                required
                disabled={is_loading}
            />
            <SelectInput
                label="Hak Akses"
                placeholder="Pilih Hak Akses"
                value={role}
                onChange={(e: any) => set_field('role', e.target.value)}
                options={[
                    { label: 'Admin Operator', value: 'admin-operator' },
                    { label: 'SMKHP Operator', value: 'smkhp-operator' },
                    { label: 'Lab Umum Operator', value: 'lab-umum-operator' },
                    {
                        label: 'Lab Oficial Operator',
                        value: 'lab-oficial-operator',
                    },
                    { label: 'CS Operator', value: 'cs-operator' },
                ]}
            />
            <Button type="submit" disabled={is_loading}>
                {is_loading ? 'Memproses...' : 'Simpan Perubahan'}
            </Button>
        </Form>
    );
}
