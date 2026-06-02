import * as React from 'react';

import { Form, TextInput, Button } from '../../../../shared/components';
import useGlobalStore from '../../../../shared/stores/global.store';
import useCustomerServiceOnlineStore, {
    type CustomerServiceOnlineData,
} from '../../store';

type CustomerServiceOnlineFormProps = {
    item: CustomerServiceOnlineData;
    mode: 'schedule' | 'detail';
    onSuccess?: () => void;
};

export default function CustomerServiceOnlineForm(
    props: CustomerServiceOnlineFormProps,
) {
    const { item, mode, onSuccess } = props;
    const [linkMeet, setLinkMeet] = React.useState(item.details.linkmeet || '');
    const [timeMeet, setTimeMeet] = React.useState(item.details.timemeet || '');
    const [catatan, setCatatan] = React.useState(item.catatan_petugas || '');
    const { state: globalUser } = useGlobalStore();
    const { setPetugas, scheduleMeeting, finishMeeting, isSubmitting } =
        useCustomerServiceOnlineStore();

    React.useEffect(() => {
        setPetugas(globalUser.full_name, globalUser.nip);
    }, [globalUser.full_name, globalUser.nip, setPetugas]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (mode === 'schedule') {
            if (!linkMeet.trim() || !timeMeet.trim()) {
                alert('Link Zoom dan jam meeting wajib diisi.');
                return;
            }

            const result = await scheduleMeeting({
                token: item.token,
                linkmeet: linkMeet,
                timemeet: timeMeet,
            });

            if (result.success) onSuccess?.();
            return;
        }

        if (item.status !== 'di proses') return;

        const result = await finishMeeting(item.token, catatan);
        if (result.success) onSuccess?.();
    };

    const isDetailMode = mode === 'detail';
    const isProcessingStatus = item.status === 'di proses';
    const isFinishedStatus = item.status === 'Selesai';

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput
                name="formatted_no"
                label="Nomor Antrian"
                value={item.details.formattedNo || item.token}
                required
                disabled
            />
            <TextInput
                name="queue_no"
                label="Queue No"
                value={item.queueNo}
                required
                disabled
            />
            <TextInput
                name="nama"
                label="Nama"
                value={item.username}
                required
                disabled
            />
            <TextInput
                name="npwp"
                label="NPWP"
                value={item.npwp}
                required
                disabled
            />
            <TextInput
                name="email"
                label="Email"
                value={item.userEmail}
                disabled
            />
            <TextInput
                name="nomor_hp"
                label="Nomor HP"
                value={item.nomorHp}
                required
                disabled
            />
            <TextInput
                name="kebutuhan"
                label="Kebutuhan"
                value={item.details.kebutuhan}
                required
                disabled
            />
            <TextInput
                name="tanggal_registrasi"
                label="Tanggal Registrasi"
                value={item.details.tanggal}
                required
                disabled
            />
            <TextInput
                name="status"
                label="Status"
                value={item.status}
                required
                disabled
            />

            <TextInput
                name="link_meet"
                label="Link Zoom / Meet"
                value={linkMeet}
                onChange={(event) => {
                    const target = event.target as HTMLInputElement;
                    setLinkMeet(target.value);
                }}
                disabled={isDetailMode}
                helperText={
                    mode === 'schedule'
                        ? 'Pastikan link meeting sudah final sebelum disimpan.'
                        : undefined
                }
                required
            />

            <TextInput
                name="time_meet"
                label="Jam Meeting"
                type="time"
                value={timeMeet}
                onChange={(event) => {
                    const target = event.target as HTMLInputElement;
                    setTimeMeet(target.value);
                }}
                disabled={isDetailMode}
                helperText={
                    mode === 'schedule'
                        ? 'Sistem akan menolak jadwal yang bentrok di tanggal yang sama.'
                        : undefined
                }
                required
            />

            {isDetailMode && (
                <>
                    <TextInput
                        name="nama_petugas"
                        label="Nama Petugas"
                        value={
                            isProcessingStatus
                                ? globalUser.full_name
                                : item.nama_petugas
                        }
                        disabled
                    />
                    <TextInput
                        name="nip_petugas"
                        label="NIP Petugas"
                        value={
                            isProcessingStatus
                                ? globalUser.nip
                                : item.nip_petugas
                        }
                        disabled
                    />
                    <TextInput
                        name="catatan_petugas"
                        label="Catatan Petugas"
                        value={catatan}
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;
                            setCatatan(target.value);
                        }}
                        disabled={isFinishedStatus}
                        helperText={
                            isProcessingStatus
                                ? 'Catatan ini akan disimpan saat meeting diselesaikan.'
                                : undefined
                        }
                    />
                </>
            )}

            {mode === 'schedule' && (
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi dan Jadwalkan'}
                </Button>
            )}

            {mode === 'detail' && isProcessingStatus && (
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyelesaikan...' : 'Selesaikan Meeting'}
                </Button>
            )}
        </Form>
    );
}
