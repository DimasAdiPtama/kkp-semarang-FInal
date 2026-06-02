import * as React from 'react';
import { Modal } from '../../../shared/components';

import TraderLayout from '../layouts/trader.layout';
import CreateTraderForm from '../components/forms/create.trader.form';
import TraderTable from '../components/tables/trader.table';
import useTraderStore, { type TraderForm } from '../store';
import { readExcelRows } from '../../../shared/lib/excel';

import { FaFileExcel, FaRegPlusSquare } from 'react-icons/fa';

export default function TraderPage() {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const { importTraders } = useTraderStore();

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const rows = await readExcelRows(file);
        const payload = rows.map((row) => ({
            kode_trader: String(row.kode_trader || row.kode || '').trim(),
            nama_trader: String(row.nama_trader || row.nama || '').trim(),
            npwp: String(row.npwp || '').trim(),
            alamat_trader: String(row.alamat_trader || row.alamat || '').trim(),
        })) satisfies TraderForm[];

        await importTraders(payload);
        event.target.value = '';
    };

    return (
        <TraderLayout>
            <div className="flex flex-wrap gap-3">
                <Modal
                    title="Tambah Trader"
                    trigger={
                        <button className="h-9 px-2 border rounded-sm flex justify-center items-center gap-2 hover:cursor-pointer bg-black text-white">
                            <FaRegPlusSquare className="w-4 h-4" />
                            <span className="text-sm">Tambah Trader</span>
                        </button>
                    }
                >
                    <CreateTraderForm />
                </Modal>
                <button
                    className="h-9 px-3 border rounded-sm flex justify-center items-center gap-2 hover:cursor-pointer bg-white text-black"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FaFileExcel className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">Import Excel</span>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImport}
                />
            </div>
            <TraderTable />
        </TraderLayout>
    );
}
