import * as React from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosAdd, IoIosRemove, IoIosRefresh, IoIosSave, IoIosSync } from 'react-icons/io';
import { toast } from 'sonner';

import { db } from '../../../shared/configs/firebase';
import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';
import { Button, TextInput } from '../../../shared/components';

export default function KendaliAntreanPage() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [onlineValue, setOnlineValue] = React.useState<number | null>(null);
    const [localValue, setLocalValue] = React.useState<number>(20);
    const [autoSync, setAutoSync] = React.useState<boolean>(true);

    React.useEffect(() => {
        const docRef = doc(db, 'metadata', 'queue_settings');

        const unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const val = typeof data.LayananOffline === 'number' ? data.LayananOffline : 20;
                    setOnlineValue(val);
                    setLocalValue(val);
                } else {
                    // Document doesn't exist yet, initialize it
                    setOnlineValue(20);
                    setLocalValue(20);
                }
                setLoading(false);
            },
            (error) => {
                toast.error('Gagal memuat data antrean dari server');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // 2. Function to update Firestore
    const updateFirestoreValue = async (val: number) => {
        setSaving(true);
        try {
            const docRef = doc(db, 'metadata', 'queue_settings');
            await setDoc(docRef, { LayananOffline: Number(val) }, { merge: true });
            toast.success(`Antrean berhasil diperbarui menjadi ${val}`);
        } catch (error) {
            console.error('Error updating LayananOffline:', error);
            toast.error('Gagal memperbarui antrean di server');
        } finally {
            setSaving(false);
        }
    };

    // 3. Handle Local adjustments
    const handleAdjust = (adjustment: number) => {
        const newVal = Math.max(0, localValue + adjustment);
        setLocalValue(newVal);
        if (autoSync) {
            updateFirestoreValue(newVal);
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Number(e.target.value);
        setLocalValue(newVal);
        if (autoSync) {
            updateFirestoreValue(newVal);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '') {
            setLocalValue(0);
            return;
        }
        const newVal = Math.max(0, parseInt(valStr, 10) || 0);
        setLocalValue(newVal);
        if (autoSync) {
            updateFirestoreValue(newVal);
        }
    };

    const handleSaveManual = () => {
        updateFirestoreValue(localValue);
    };

    const handleQuickSet = (val: number) => {
        setLocalValue(val);
        if (autoSync) {
            updateFirestoreValue(val);
        }
    };

    const hasChanges = onlineValue !== localValue;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <p className="text-slate-600 text-sm animate-pulse">Menghubungkan ke database...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <main className="flex-1 p-8">
                <div className="mx-auto max-w-3xl rounded-sm border bg-white p-8 space-y-8 shadow-sm">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                Kendali Antrean Hari Ini
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Kelola jumlah parameter dan nomor antrean Layanan Offline secara real-time.
                            </p>
                        </div>
                        {/* Auto-Sync Toggle Indicator */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-sm self-start">
                            <IoIosSync className={`text-slate-600 ${autoSync ? 'animate-spin' : ''}`} size={18} />
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 select-none cursor-pointer flex items-center gap-2">
                                Auto-Sync
                                <input
                                    type="checkbox"
                                    checked={autoSync}
                                    onChange={(e) => setAutoSync(e.target.checked)}
                                    className="w-4 h-4 accent-black cursor-pointer rounded-sm"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Main Control Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Counter Display & Direct Actions */}
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-6">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Nomor Layanan Offline Saat Ini
                                </h3>
                                {/* Premium animated counter */}
                                <div className="flex justify-center items-center py-8 relative overflow-hidden bg-white border border-slate-200 rounded-sm">
                                    <div className="absolute inset-0 bg-linear-to-tr from-slate-50 to-transparent opacity-50" />
                                    <AnimatePresence mode="popLayout">
                                        <motion.span
                                            key={localValue}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className="text-6xl font-black text-slate-900 z-10"
                                        >
                                            {localValue}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Adjustment Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => handleAdjust(-1)}
                                    prefix={<IoIosRemove size={18} />}
                                >
                                    Kurangi 1
                                </Button>
                                <Button
                                    variant="solid"
                                    fullWidth
                                    onClick={() => handleAdjust(1)}
                                    prefix={<IoIosAdd size={18} />}
                                >
                                    Tambah 1
                                </Button>
                            </div>
                        </div>

                        {/* Settings & Configuration Controls */}
                        <div className="space-y-6 flex flex-col justify-between">
                            {/* Range Slider Control */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <span>Skala Range Antrean</span>
                                    <span className="text-black bg-slate-200 px-2 py-0.5 rounded-sm">{localValue}</span>
                                </div>
                                <div className="relative pt-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={localValue}
                                        onChange={handleSliderChange}
                                        className="w-full h-2 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-black"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
                                        <span>0 (Reset)</span>
                                        <span>100</span>
                                        <span>200 (Maks)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Input manual */}
                            <div className="space-y-2">
                                <TextInput
                                    label="Input Manual Antrean"
                                    type="number"
                                    min="0"
                                    value={localValue}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nomor antrean..."
                                    suffix={
                                        <span className="text-xs text-slate-400 font-bold uppercase mr-1">
                                            Nomor
                                        </span>
                                    }
                                />
                            </div>

                            {/* Quick Set Preset Buttons */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                    Set Nomor Cepat
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleQuickSet(0)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded-sm border border-slate-200 transition-colors"
                                    >
                                        Reset (0)
                                    </button>
                                    <button
                                        onClick={() => handleQuickSet(5)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded-sm border border-slate-200 transition-colors"
                                    >
                                        5
                                    </button>
                                    <button
                                        onClick={() => handleQuickSet(10)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded-sm border border-slate-200 transition-colors"
                                    >
                                        10
                                    </button>
                                    <button
                                        onClick={() => handleQuickSet(25)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded-sm border border-slate-200 transition-colors"
                                    >
                                        25
                                    </button>
                                    <button
                                        onClick={() => handleQuickSet(50)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded-sm border border-slate-200 transition-colors"
                                    >
                                        50
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions / Non-Auto Sync Manual Save */}
                    {!autoSync && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-4 border-t border-slate-100"
                        >
                            <Button
                                className="w-full h-12"
                                onClick={handleSaveManual}
                                disabled={saving || !hasChanges}
                                prefix={<IoIosSave size={18} />}
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan Nomor Antrean'}
                            </Button>
                        </motion.div>
                    )}

                    {/* Status Info panel */}
                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-xs text-slate-500 space-y-1">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Informasi Sinkronisasi Firestore:
                        </span>
                        <p>• Database: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded-sm">firebase/firestore</span></p>
                        <p>• Lokasi Koleksi: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded-sm">metadata</span></p>
                        <p>• Lokasi Dokumen: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded-sm">queue_settings</span></p>
                        <p>• Field Target: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded-sm">LayananOffline</span> (Tipe: <span className="font-bold uppercase text-slate-700">number</span>)</p>
                    </div>
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
