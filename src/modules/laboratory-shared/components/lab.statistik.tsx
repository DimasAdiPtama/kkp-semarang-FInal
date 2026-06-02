import {
    MdAccessTime,
    MdAutorenew,
    MdOutlinePendingActions,
} from 'react-icons/md';
import { Stat } from '../../../shared/components';

export default function LabStatistik({
    pendingCounter,
    processCounter,
    finishedCounter,
}: {
    pendingCounter: number;
    processCounter: number;
    finishedCounter: number;
}) {
    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat
                icon={<MdOutlinePendingActions size={24} />}
                label="Pending"
                value={pendingCounter}
                description="Sampel yang masih menunggu diproses laboratorium"
            />
            <Stat
                icon={<MdAccessTime size={24} />}
                label="Diproses"
                value={processCounter}
                description="Sampel yang sedang dikerjakan petugas laboratorium"
            />
            <Stat
                icon={<MdAutorenew size={24} />}
                label="Selesai"
                value={finishedCounter}
                description="Sampel yang sudah memiliki hasil uji dan laporan"
            />
        </div>
    );
}
