import { useEffect } from 'react';
import {
    Form,
    TextInput,
    SelectInput,
    Button,
} from '../../../../shared/components';

import useOfficerManagementStore from '../../store';

export default function CreateOfficerForm() {
    // 1. Ambil state dan actions dari store
    const {
        full_name,
        nip,
        role,
        set_field,
        create_officer,
        is_loading,
        reset_form,
    } = useOfficerManagementStore();

    // 2. Bersihkan form saat komponen pertama kali dibuka (mount)
    useEffect(() => {
        reset_form();
    }, [reset_form]);

    // 3. Handler untuk submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await create_officer();
    };

    return (
        <Form onSubmit={handleSubmit}>
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
                placeholder="Masukkan NIP petugas (Min. 6 Karakter)"
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
                disabled={is_loading}
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
                {is_loading ? 'Memproses...' : 'Tambah Petugas'}
            </Button>
        </Form>
    );
}
