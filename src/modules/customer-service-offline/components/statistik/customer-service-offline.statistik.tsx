import { Stat } from '../../../../shared/components';

import { MdOutlinePendingActions } from 'react-icons/md';
import { MdAccessTime } from 'react-icons/md';
import { MdAutorenew } from 'react-icons/md';

export default function CustomerServiceOfflineStatistik({
    pending_counter,
    processing_counter,
    waiting_counter,
}: {
    pending_counter: number;
    processing_counter: number;
    waiting_counter: number;
}) {
    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat
                icon={<MdOutlinePendingActions size={24} />}
                label="Pending"
                value={pending_counter}
                description="Antrean dengan status inactive"
            />
            <Stat
                icon={<MdAccessTime size={24} />}
                label="Menunggu Respons"
                value={waiting_counter}
                description="Antrean dengan subStatus Menunggu"
            />
            <Stat
                icon={<MdAutorenew size={24} />}
                label="Sedang Diproses"
                value={processing_counter}
                description="Antrean dengan subStatus Diproses"
            />
        </div>
    );
}
