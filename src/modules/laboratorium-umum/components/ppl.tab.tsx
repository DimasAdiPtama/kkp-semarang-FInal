import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Table, Button } from '../../../shared/components';
import usePPLStore, { type PPLData } from '../ppl.store';

const formatFirestoreTimestamp = (timestamp: any) => {
    if (!timestamp) return '-';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
    }).format(date);
};

export default function PPLTab() {
    const {
        pplItems,
        getPPLItems,
        acceptPPL,
        rejectPPL,
        isLoading,
        isSubmitting,
    } = usePPLStore();

    React.useEffect(() => {
        const unsubscribe = getPPLItems();
        return () => unsubscribe();
    }, [getPPLItems]);

    const columns = React.useMemo<ColumnDef<PPLData>[]>(
        () => [
            {
                accessorKey: 'ticketNumber',
                header: 'Ticket Number',
            },
            {
                accessorKey: 'nama',
                header: 'Nama',
            },
            {
                accessorKey: 'npwp',
                header: 'NPWP',
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'nomorHp',
                header: 'Nomor HP',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <span
                            className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase ${
                                status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : status === 'ditolak'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'timestamp',
                header: 'Waktu',
                cell: ({ row }) =>
                    formatFirestoreTimestamp(row.original.timestamp),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => {
                    const item = row.original;
                    const canAction =
                        item.status !== 'active' && item.status !== 'ditolak';

                    return (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => acceptPPL(item.id)}
                                disabled={isSubmitting || !canAction}
                            >
                                Terima
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectPPL(item.id)}
                                disabled={isSubmitting || !canAction}
                            >
                                Tolak
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [acceptPPL, rejectPPL, isSubmitting],
    );

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 border border-slate-200 rounded-sm">
                <h2 className="text-sm font-black uppercase">Data PPL</h2>
                <p className="text-xs text-slate-500">
                    Daftar pengajuan PPL untuk Laboratorium Umum.
                </p>
            </div>
            {isLoading && pplItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm border border-slate-200 rounded-sm bg-white">
                    Memuat data PPL...
                </div>
            ) : (
                <Table columns={columns} data={pplItems} />
            )}
        </div>
    );
}
