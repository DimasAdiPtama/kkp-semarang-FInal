import { useEffect, useState } from 'react';
import { Form, TextInput, Button } from '../../../../shared/components';
import useCustomerServiceOfflineStore from '../../store';
import useGlobalStore from '../../../../shared/stores/global.store';

export default function CustomerServiceOfflineForm({ id }: { id: string }) {
    const [catatan, setCatatan] = useState('');
    const { state: globalUser } = useGlobalStore();
    const {
        customer_service_detail,
        getCustomerServiceByToken,
        updateCustomerServiceHandle,
        setPetugas,
        isLoading,
    } = useCustomerServiceOfflineStore();

    useEffect(() => {
        setPetugas(globalUser.full_name, globalUser.nip);
        void getCustomerServiceByToken(id);
    }, [
        getCustomerServiceByToken,
        globalUser.full_name,
        globalUser.nip,
        id,
        setPetugas,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateCustomerServiceHandle(id, catatan);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput
                name="no_antrian"
                label="Nomor Antrian"
                value={customer_service_detail?.queueNo ?? ''}
                required
                disabled
            />
            <TextInput
                name="nama"
                label="Nama"
                value={customer_service_detail?.userName ?? ''}
                required
                disabled
            />
            <TextInput
                name="no_npwp"
                label="Nomor NPWP"
                value={customer_service_detail?.npwp ?? ''}
                required
                disabled
            />
            <TextInput
                name="keluhan"
                label="Keluhan"
                value={customer_service_detail?.keluhan ?? ''}
                required
                disabled
            />
            <TextInput
                name="nama_petugas"
                label="Nama Petugas"
                value={globalUser.full_name}
                required
                disabled
            />
            <TextInput
                name="nip_petugas"
                label="NIP Petugas"
                value={globalUser.nip}
                required
                disabled
            />
            <TextInput
                name="catatan_petugas"
                label="Catatan Petugas"
                value={catatan}
                onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    setCatatan(target.value);
                }}
                required
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Submit dan Selesaikan'}
            </Button>
        </Form>
    );
}
