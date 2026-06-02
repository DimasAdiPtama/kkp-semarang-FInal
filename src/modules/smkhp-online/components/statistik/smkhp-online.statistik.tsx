import { Stat } from '../../../../shared/components';

import { MdOutlinePendingActions } from 'react-icons/md';
import { MdAccessTime } from 'react-icons/md';
import { MdAutorenew } from 'react-icons/md';

export default function SMKHPOnlineStatistik({
    pending_counter,
    meeting_counter,
    finished_counter,
}: {
    pending_counter: number;
    meeting_counter: number;
    finished_counter: number;
}) {
    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat
                icon={<MdOutlinePendingActions size={24} />}
                label="Pending"
                value={pending_counter}
                description="Antrean SMKHP online yang belum dijadwalkan meeting"
            />
            <Stat
                icon={<MdAccessTime size={24} />}
                label="Meeting Hari Ini"
                value={meeting_counter}
                description="Hanya meeting SMKHP online pada hari ini"
            />
            <Stat
                icon={<MdAutorenew size={24} />}
                label="Selesai"
                value={finished_counter}
                description="Meeting yang sudah selesai dan sudah tercatat petugasnya"
            />
        </div>
    );
}
