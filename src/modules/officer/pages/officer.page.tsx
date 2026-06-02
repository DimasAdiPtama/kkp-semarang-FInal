import * as React from 'react';
import { useEffect, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Modal, Table } from '../../../shared/components';

import OfficerLayout from '../layouts/officer.layout';
import CreateOfficerForm from '../components/forms/create.officer.form';
import EditOfficerForm from '../components/forms/edit.officer.form';

import { FaFileExcel, FaRegPlusSquare } from 'react-icons/fa';
import useOfficerManagementStore, { type Officer } from '../store';
import { readExcelRows } from '../../../shared/lib/excel';

const normalizeRole = (value: string) => {
    const safeValue = value.trim().toLowerCase();

    const roleMap: Record<string, string> = {
        'admin operator': 'admin-operator',
        'admin-operator': 'admin-operator',
        'smkhp operator': 'smkhp-operator',
        'smkhp-operator': 'smkhp-operator',
        'lab umum operator': 'lab-umum-operator',
        'lab-umum-operator': 'lab-umum-operator',
        'lab oficial operator': 'lab-oficial-operator',
        'lab official operator': 'lab-oficial-operator',
        'lab-oficial-operator': 'lab-oficial-operator',
        'cs operator': 'cs-operator',
        'cs-operator': 'cs-operator',
    };

    return roleMap[safeValue] || safeValue;
};

export default function OfficerPage() {
    const { get_officers, officers, delete_officer, import_officers } =
        useOfficerManagementStore();
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        get_officers();
    }, [get_officers]);

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const rows = await readExcelRows(file);
        await import_officers(
            rows.map((row) => ({
                full_name: String(
                    row.full_name || row.nama_petugas || row.nama || '',
                ).trim(),
                nip: String(row.nip || '').trim(),
                role: normalizeRole(
                    String(row.role || row.hak_akses || '').trim(),
                ),
                email: String(row.email || '').trim(),
            })),
        );
        event.target.value = '';
    };

    const columns = useMemo<ColumnDef<Officer>[]>(
        () => [
            {
                accessorKey: 'full_name',
                header: 'Nama Petugas',
                enableColumnFilter: true,
            },
            {
                accessorKey: 'nip',
                header: 'NIP',
                enableColumnFilter: true,
            },
            {
                accessorKey: 'role',
                header: 'Role',
                enableColumnFilter: true,
                cell: ({ row }) => {
                    const officer = row.original;
                    return (
                        <>
                            {officer.role === 'admin-operator' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    Admin Operator
                                </span>
                            )}
                            {officer.role === 'smkhp-operator' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    SMKHP Operator
                                </span>
                            )}
                            {officer.role === 'lab-umum-operator' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                    Lab Umum Operator
                                </span>
                            )}
                            {officer.role === 'lab-oficial-operator' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                    Lab Oficial Operator
                                </span>
                            )}
                            {officer.role === 'cs-operator' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                    CS Operator
                                </span>
                            )}
                        </>
                    );
                },
            },
            {
                id: 'action',
                header: 'Action',
                cell: ({ row }) => {
                    const officer = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Modal
                                title="Edit Petugas"
                                trigger={
                                    <button className="hover:cursor-pointer text-blue-600 font-medium">
                                        Edit
                                    </button>
                                }
                            >
                                <EditOfficerForm id={officer.id} />
                            </Modal>
                            <span className="text-gray-300">|</span>
                            <button
                                className="hover:cursor-pointer text-red-600 font-medium"
                                onClick={() => delete_officer(officer.id)}
                            >
                                Hapus
                            </button>
                        </div>
                    );
                },
            },
        ],
        [delete_officer],
    );

    return (
        <OfficerLayout>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                    <Modal
                        title="Tambah Petugas"
                        trigger={
                            <button className="h-9 px-4 border rounded-sm flex justify-center items-center gap-2 hover:cursor-pointer bg-black text-white transition-opacity hover:opacity-80">
                                <FaRegPlusSquare className="w-4 h-4" />
                                <span className="text-sm">Tambah Petugas</span>
                            </button>
                        }
                    >
                        <CreateOfficerForm />
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
                <Table columns={columns} data={officers} />
            </div>
        </OfficerLayout>
    );
}
