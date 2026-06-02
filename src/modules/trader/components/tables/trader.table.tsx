import { useEffect, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Modal, Table } from '../../../../shared/components';
import EditTraderForm from '../forms/edit.trader.form';

import useTraderStore, { type Trader } from '../../store';

export default function TraderTable() {
    const { traders, getTraders, deleteTrader } = useTraderStore();
    useEffect(() => {
        const unsubscribe = getTraders();
        return () => unsubscribe();
    }, [getTraders]);

    const columns = useMemo<ColumnDef<Trader>[]>(
        () => [
            {
                accessorKey: 'kode_trader',
                header: 'Kode',
                enableColumnFilter: true,
            },
            {
                accessorKey: 'nama_trader',
                header: 'Nama',
                enableColumnFilter: true,
            },
            {
                accessorKey: 'npwp',
                header: 'NPWP',
                enableColumnFilter: true,
            },
            {
                accessorKey: 'alamat_trader',
                header: 'Alamat',
                enableColumnFilter: true,
            },
            {
                id: 'action',
                header: 'Action',
                cell: ({ row }) => {
                    const trader = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Modal
                                title="Edit Trader"
                                trigger={
                                    <button className="hover:cursor-pointer text-blue-600 font-medium">
                                        Edit
                                    </button>
                                }
                            >
                                <EditTraderForm id={trader.id} />
                            </Modal>
                            <span className="text-gray-300">|</span>
                            <button
                                className="hover:cursor-pointer text-red-600 font-medium"
                                onClick={() => deleteTrader(trader.id)}
                            >
                                Hapus
                            </button>
                        </div>
                    );
                },
            },
        ],
        [deleteTrader],
    );

    return (
        <div className="w-full">
            <Table columns={columns} data={traders} />
        </div>
    );
}
