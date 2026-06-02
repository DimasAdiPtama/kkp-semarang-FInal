import * as React from 'react';
import { Button, Form, TextInput } from '../../../shared/components';
import useGlobalStore from '../../../shared/stores/global.store';
import type { LabSample } from '../lab.types';
import {
    formatCurrency,
    getCurrentTestingResult,
    getNextLabStatus,
} from '../lab.utils';

const toInputDate = (value: string) => {
    if (!value) return '';
    if (value.includes('-')) return value;

    const [day, month, year] = value.split('/');
    if (!day || !month || !year) return '';

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const toDisplayDate = (value: string) => {
    if (!value) return '';
    if (value.includes('/')) return value;

    const [year, month, day] = value.split('-');
    if (!day || !month || !year) return value;

    return `${day}/${month}/${year}`;
};

type LabResultFormProps = {
    item: LabSample;
    onSubmitResult: (payload: {
        token: string;
        result?: string;
        namaLatin?: string;
        tanggalPenerbitan: string;
        namaPenanggungJawab: string;
        nipPenanggungJawab: string;
    }) => Promise<{ success: boolean; message?: string }>;
    isSubmitting: boolean;
    onSuccess?: () => void;
};

export default function LabResultForm({
    item,
    onSubmitResult,
    isSubmitting,
    onSuccess,
}: LabResultFormProps) {
    const { state: globalUser } = useGlobalStore();
    const currentTesting = getCurrentTestingResult(item);
    const nextStatus = getNextLabStatus(item);
    const isAlreadyPublished =
        item.status ===
        'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya';
    const requiresPublication =
        isAlreadyPublished ||
        nextStatus ===
            'LHU telah terbit cek dahulu sebelum mengambil LHU fisiknya';

    const [resultValue, setResultValue] = React.useState(
        currentTesting?.result || '',
    );
    const [tanggalPenerbitan, setTanggalPenerbitan] = React.useState(
        toInputDate(item.tanggalPenerbitan || item.tanggalPengujian || ''),
    );
    const [namaPenanggungJawab, setNamaPenanggungJawab] = React.useState(
        item.namaPenanggungJawab || globalUser.full_name || '',
    );
    const [nipPenanggungJawab, setNipPenanggungJawab] = React.useState(
        item.nipPenanggungJawab || globalUser.nip || '',
    );
    const [namaLatin, setNamaLatin] = React.useState(item.namaLatin || '');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isAlreadyPublished && !resultValue.trim()) {
            alert('Hasil uji untuk tahap saat ini wajib diisi.');
            return;
        }

        if (
            requiresPublication &&
            (!tanggalPenerbitan || !namaPenanggungJawab || !nipPenanggungJawab)
        ) {
            alert('Tanggal penerbitan dan data penanggung jawab wajib diisi.');
            return;
        }

        const response = await onSubmitResult({
            token: item.token,
            result: isAlreadyPublished ? undefined : resultValue,
            namaLatin,
            tanggalPenerbitan: requiresPublication
                ? toDisplayDate(tanggalPenerbitan)
                : '',
            namaPenanggungJawab,
            nipPenanggungJawab,
        });

        if (response.success) onSuccess?.();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <TextInput label="Nomor LPP" value={item.lpp} disabled />
            <TextInput label="Nama Sampel" value={item.namaSampel} disabled />
            <TextInput
                label="Nama Latin"
                value={namaLatin}
                onChange={(event) => {
                    const target = event.target as HTMLInputElement;
                    setNamaLatin(target.value);
                }}
                placeholder="Masukkan nama latin sampel"
            />
            <TextInput
                label="Tanggal Pengujian"
                value={item.tanggalPengujian}
                disabled
            />
            <TextInput
                label="Petugas Pengujian"
                value={item.namaPetugas || globalUser.full_name}
                disabled
            />
            <TextInput
                label="NIP Petugas"
                value={item.nipPetugas || globalUser.nip}
                disabled
            />
            <TextInput label="Status Saat Ini" value={item.status} disabled />
            {!isAlreadyPublished && (
                <>
                    <TextInput
                        label="Pengujian Aktif"
                        value={currentTesting?.testName || '-'}
                        disabled
                    />
                    <TextInput
                        label="Tarif Pengujian Aktif"
                        value={formatCurrency(currentTesting?.tarif || 0)}
                        disabled
                    />
                    <TextInput
                        label="Hasil Uji"
                        value={resultValue}
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;
                            setResultValue(target.value);
                        }}
                        required
                    />
                </>
            )}

            <TextInput
                label="Total Tarif"
                value={formatCurrency(item.totalTarif)}
                disabled
            />

            {requiresPublication && (
                <>
                    <TextInput
                        label="Tanggal Penerbitan"
                        type="date"
                        value={tanggalPenerbitan}
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;
                            setTanggalPenerbitan(target.value);
                        }}
                        required
                    />
                    <TextInput
                        label="Nama Penanggung Jawab"
                        value={namaPenanggungJawab}
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;
                            setNamaPenanggungJawab(target.value);
                        }}
                        required
                    />
                    <TextInput
                        label="NIP Penanggung Jawab"
                        value={nipPenanggungJawab}
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;
                            setNipPenanggungJawab(target.value);
                        }}
                        required
                    />
                </>
            )}

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                    ? 'Menyimpan...'
                    : isAlreadyPublished
                      ? 'Simpan Perubahan Data LHU'
                      : requiresPublication
                        ? 'Simpan Hasil dan Terbitkan LHU'
                        : 'Simpan Hasil dan Lanjutkan'}
            </Button>
        </Form>
    );
}
