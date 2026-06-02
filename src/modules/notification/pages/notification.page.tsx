import * as React from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../shared/configs/firebase';
import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';
import {
    Button,
    TextInput,
    CheckboxInput,
    DateInput,
    TimeInput,
} from '../../../shared/components';

// Helper to convert YYYY-MM-DD to DD/MM/YYYY
const toIDDate = (date: string) => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length !== 3) return date;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
const fromIDDate = (date: string) => {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length !== 3) return date;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
};

// Helper to parse "DD/MM/YYYY HH:mm" to { date: "YYYY-MM-DD", time: "HH:mm" }
const parseDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return { date: '', time: '' };
    const [datePart, timePart] = dateTimeStr.split(' ');
    return {
        date: fromIDDate(datePart),
        time: timePart || '00:00',
    };
};

// Helper to combine "YYYY-MM-DD" and "HH:mm" to "DD/MM/YYYY HH:mm"
const combineDateTime = (date: string, time: string) => {
    if (!date) return '';
    const formattedDate = toIDDate(date);
    const formattedTime = time || '00:00';
    return `${formattedDate} ${formattedTime}`;
};

export default function NotificationPage() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [data, setData] = React.useState({
        Keterangan: '',
        heading: '',
        status: false,
        timestop: '',
        type: 'formal', // Default type
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'notification', 'Jadwal');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();
                    setData({
                        Keterangan: fetchedData.Keterangan || '',
                        heading: fetchedData.heading || '',
                        status: !!fetchedData.status,
                        timestop: fetchedData.timestop || '',
                        type: fetchedData.type || 'formal',
                    });
                }
            } catch (error) {
                console.error('Error fetching Jadwal:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ... (rest of the handleSave and render logic updated below)
    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'notification', 'Jadwal');
            await setDoc(docRef, data, { merge: true });
            alert('Jadwal berhasil diperbarui');
        } catch (error) {
            console.error('Error updating Jadwal:', error);
            alert('Gagal memperbarui jadwal');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <HeaderNavigation />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <p>Memuat data...</p>
                </main>
                <FooterNavigation />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <main className="flex-1 p-8">
                <div className="mx-auto max-w-3xl rounded-sm border bg-white p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase">
                            Pengaturan Jadwal
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Kelola pemberitahuan dan jadwal operasional sistem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <TextInput
                            label="Heading"
                            value={data.heading}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setData((prev) => ({
                                    ...prev,
                                    heading: e.target.value,
                                }))
                            }
                            placeholder="Masukkan heading..."
                        />

                        <TextInput
                            label="Keterangan"
                            value={data.Keterangan}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setData((prev) => ({
                                    ...prev,
                                    Keterangan: e.target.value,
                                }))
                            }
                            placeholder="Masukkan keterangan..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <DateInput
                                label="Tanggal Selesai (Time Stop)"
                                value={parseDateTime(data.timestop).date}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    const { time } = parseDateTime(data.timestop);
                                    setData((prev) => ({
                                        ...prev,
                                        timestop: combineDateTime(e.target.value, time),
                                    }));
                                }}
                            />
                            <TimeInput
                                label="Waktu Selesai"
                                value={parseDateTime(data.timestop).time}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    const { date } = parseDateTime(data.timestop);
                                    setData((prev) => ({
                                        ...prev,
                                        timestop: combineDateTime(date, e.target.value),
                                    }));
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">
                                Tipe Pemberitahuan
                            </label>
                            <select
                                className="w-full h-12 px-4 border border-slate-300 rounded-sm"
                                value={data.type}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        type: e.target.value,
                                    }))
                                }
                            >
                                <option value="formal">Formal</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckboxInput
                                label="Status Aktif"
                                checked={data.status}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                    setData((prev) => ({
                                        ...prev,
                                        status: e.target.checked,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full h-12"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                        </Button>
                    </div>
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
