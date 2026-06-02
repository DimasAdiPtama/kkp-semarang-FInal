import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button, Modal, Table } from '../../../../shared/components';
import { FaFilePdf } from 'react-icons/fa';
import { openLabReportPreview } from '../../../laboratory-shared/lab-report.preview';
import { openHistoryReportPrint } from '../../history-report';
import type { HistoryUser, UserActivity, UserNoAju } from '../../store';
import useHistoryStore from '../../store';

type UserRow = HistoryUser & {
    activityCount: number;
    lastActivityAt: number;
};

const formatDisplayDate = (value?: string | number) => {
    if (!value) return '-';

    if (typeof value === 'number') {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
        }).format(new Date(value));
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Jakarta',
            }).format(parsed);
        }
    }

    return value;
};

const formatNoAjuList = (items: UserNoAju[]) => {
    if (items.length === 0) return 'Belum ada noAju';

    return items
        .map((item) => {
            const expired = item.expiredAju
                ? `exp ${formatDisplayDate(item.expiredAju)}`
                : 'tanpa expired';
            return `${item.noAju} (${expired})`;
        })
        .join(', ');
};

const isSameUser = (user: HistoryUser, activity: UserActivity) => {
    const userNpwp = (user.npwp || '').trim();
    const activityNpwp = (activity.npwp || '').trim();
    if (userNpwp && userNpwp !== '-' && activityNpwp) {
        return userNpwp === activityNpwp;
    }

    if (user.uid && activity.uid) {
        return user.uid === activity.uid;
    }

    if (user.email && activity.email) {
        return user.email.toLowerCase() === activity.email.toLowerCase();
    }

    return false;
};

const isLabActivity = (activity: UserActivity) => {
    return (
        activity.sourceCollection === 'historyLabUmum' ||
        activity.sourceCollection === 'historyLabOfficial' ||
        activity.sourceCollection === 'historyOC'
    );
};

const getLabPreviewTitle = (activity: UserActivity) => {
    return activity.sourceCollection === 'historyLabOfficial' ||
        activity.sourceCollection === 'historyOC'
        ? 'Laboratorium C'
        : 'Laboratorium Umum';
};

export default function HistoryTable() {
    const {
        users,
        activities,
        isLoading,
        isSaving,
        subscribe,
        updateNoAjuList,
    } = useHistoryStore();
    const [selectedUser, setSelectedUser] = React.useState<HistoryUser | null>(
        null,
    );
    const [editingUser, setEditingUser] = React.useState<HistoryUser | null>(
        null,
    );
    const [draftNoAjuList, setDraftNoAjuList] = React.useState<UserNoAju[]>([]);

    React.useEffect(() => {
        const unsubscribe = subscribe();
        return () => unsubscribe();
    }, [subscribe]);

    const rows = React.useMemo<UserRow[]>(() => {
        return users.map((user) => {
            const matchedActivities = activities.filter((activity) =>
                isSameUser(user, activity),
            );

            return {
                ...user,
                activityCount: matchedActivities.length,
                lastActivityAt: matchedActivities[0]?.timestamp || 0,
            };
        });
    }, [activities, users]);

    const selectedUserActivities = React.useMemo(() => {
        if (!selectedUser) return [];
        return activities.filter((activity) =>
            isSameUser(selectedUser, activity),
        );
    }, [activities, selectedUser]);

    const columns: ColumnDef<UserRow>[] = [
        {
            accessorKey: 'nama',
            header: 'Nama User',
            enableColumnFilter: true,
        },
        {
            accessorKey: 'namaTrader',
            header: 'Nama Trader',
            enableColumnFilter: true,
        },
        {
            accessorKey: 'npwp',
            header: 'NPWP',
            enableColumnFilter: true,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableColumnFilter: true,
        },
        {
            accessorKey: 'noAjuList',
            header: 'No Aju',
            enableColumnFilter: false,
            cell: ({ row }) => formatNoAjuList(row.original.noAjuList),
        },
        {
            accessorKey: 'activityCount',
            header: 'Total History',
            enableColumnFilter: false,
        },
        {
            accessorKey: 'lastActivityAt',
            header: 'Aktivitas Terakhir',
            enableColumnFilter: false,
            cell: ({ row }) => formatDisplayDate(row.original.lastActivityAt),
        },
        {
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    <button
                        className="font-bold hover:cursor-pointer"
                        onClick={() => setSelectedUser(row.original)}
                    >
                        View History
                    </button>
                    <button
                        className="font-bold hover:cursor-pointer"
                        onClick={() => {
                            setEditingUser(row.original);
                            setDraftNoAjuList(
                                row.original.noAjuList.length > 0
                                    ? row.original.noAjuList
                                    : [{ noAju: '', expiredAju: '' }],
                            );
                        }}
                    >
                        Edit noAju
                    </button>
                </div>
            ),
        },
    ];

    const handleDraftChange = (
        index: number,
        key: keyof UserNoAju,
        value: string,
    ) => {
        setDraftNoAjuList((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const handleAddNoAjuRow = () => {
        setDraftNoAjuList((current) => [
            ...current,
            { noAju: '', expiredAju: '' },
        ]);
    };

    const handleRemoveNoAjuRow = (index: number) => {
        setDraftNoAjuList((current) => current.filter((_, i) => i !== index));
    };

    const handleSaveNoAju = async () => {
        if (!editingUser) return;

        const cleaned = draftNoAjuList
            .map((item) => ({
                noAju: item.noAju.trim(),
                expiredAju: item.expiredAju,
            }))
            .filter((item) => item.noAju);

        const result = await updateNoAjuList(editingUser.id, cleaned);
        if (!result.success) {
            alert(result.message || 'Gagal menyimpan noAju.');
            return;
        }

        setEditingUser(null);
        alert('noAju user berhasil diperbarui.');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    className="h-9 px-3 border rounded-sm flex items-center gap-2 bg-black text-white hover:cursor-pointer"
                    onClick={() => openHistoryReportPrint(activities, users)}
                >
                    <FaFilePdf className="h-4 w-4" />
                    <span className="text-sm">Export PDF History</span>
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">
                        Total User
                    </p>
                    <p className="mt-2 text-2xl font-black">{rows.length}</p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">
                        Total Aktivitas
                    </p>
                    <p className="mt-2 text-2xl font-black">
                        {activities.length}
                    </p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">
                        User Dengan noAju
                    </p>
                    <p className="mt-2 text-2xl font-black">
                        {
                            rows.filter((item) => item.noAjuList.length > 0)
                                .length
                        }
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-sm border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Memuat data users dan history...
                </div>
            ) : (
                <Table columns={columns} data={rows} />
            )}

            <Modal
                title={`HISTORY USER ${selectedUser?.nama?.toUpperCase() || ''}`}
                open={!!selectedUser}
                onOpenChange={(open) => {
                    if (!open) setSelectedUser(null);
                }}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm">
                            <div className="grid gap-2 md:grid-cols-2">
                                <p>
                                    <span className="font-bold">User:</span>{' '}
                                    {selectedUser.nama}
                                </p>
                                <p>
                                    <span className="font-bold">Trader:</span>{' '}
                                    {selectedUser.namaTrader}
                                </p>
                                <p>
                                    <span className="font-bold">NPWP:</span>{' '}
                                    {selectedUser.npwp}
                                </p>
                                <p>
                                    <span className="font-bold">Email:</span>{' '}
                                    {selectedUser.email}
                                </p>
                                <p className="md:col-span-2">
                                    <span className="font-bold">No Aju:</span>{' '}
                                    {formatNoAjuList(selectedUser.noAjuList)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {selectedUserActivities.length === 0 && (
                                <div className="rounded-sm border border-slate-200 bg-white p-4 text-sm text-slate-500">
                                    Belum ada history untuk user ini.
                                </div>
                            )}

                            {selectedUserActivities.map((activity) => (
                                <div
                                    key={`${activity.sourceCollection}-${activity.id}`}
                                    className="rounded-sm border border-slate-200 bg-white p-4 space-y-2"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-bold uppercase text-slate-400">
                                                {activity.serviceLabel}
                                            </p>
                                            <p className="text-sm font-black">
                                                {activity.title}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-slate-500">
                                            <p>
                                                {formatDisplayDate(
                                                    activity.timestamp,
                                                )}
                                            </p>
                                            <p>{activity.channel}</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-2 text-sm md:grid-cols-2">
                                        <p>
                                            <span className="font-bold">
                                                Type:
                                            </span>{' '}
                                            {activity.type}
                                        </p>
                                        <p>
                                            <span className="font-bold">
                                                Status:
                                            </span>{' '}
                                            {activity.status}
                                        </p>
                                        <p>
                                            <span className="font-bold">
                                                Sub Status:
                                            </span>{' '}
                                            {activity.subStatus}
                                        </p>
                                        <p>
                                            <span className="font-bold">
                                                Tanggal:
                                            </span>{' '}
                                            {activity.dateLabel}
                                        </p>
                                        <p className="md:col-span-2">
                                            <span className="font-bold">
                                                Ringkasan:
                                            </span>{' '}
                                            {activity.description}
                                        </p>
                                    </div>
                                    {isLabActivity(activity) && (
                                        <div className="pt-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    openLabReportPreview({
                                                        item: activity.raw as any,
                                                        title: getLabPreviewTitle(
                                                            activity,
                                                        ),
                                                    })
                                                }
                                            >
                                                View LHU
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title={`EDIT NO AJU ${editingUser?.nama?.toUpperCase() || ''}`}
                open={!!editingUser}
                onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                }}
            >
                {editingUser && (
                    <div className="space-y-4">
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 text-sm">
                            <p>
                                <span className="font-bold">User:</span>{' '}
                                {editingUser.nama}
                            </p>
                            <p>
                                <span className="font-bold">NPWP:</span>{' '}
                                {editingUser.npwp}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {draftNoAjuList.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-sm border border-slate-200 p-3"
                                >
                                    <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
                                        <label className="flex flex-col gap-1 text-sm">
                                            <span>No Aju {index + 1}</span>
                                            <input
                                                className="h-10 rounded-sm border border-slate-300 px-3 outline-none"
                                                value={item.noAju}
                                                onChange={(event) =>
                                                    handleDraftChange(
                                                        index,
                                                        'noAju',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan nomor aju"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1 text-sm">
                                            <span>Expired Aju</span>
                                            <input
                                                type="date"
                                                className="h-10 rounded-sm border border-slate-300 px-3 outline-none"
                                                value={
                                                    item.expiredAju
                                                        ? item.expiredAju.slice(
                                                              0,
                                                              10,
                                                          )
                                                        : ''
                                                }
                                                onChange={(event) =>
                                                    handleDraftChange(
                                                        index,
                                                        'expiredAju',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleRemoveNoAjuRow(index)
                                            }
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-between gap-2">
                            <Button
                                variant="outline"
                                onClick={handleAddNoAjuRow}
                            >
                                Tambah noAju
                            </Button>
                            <Button
                                loading={isSaving}
                                onClick={handleSaveNoAju}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
