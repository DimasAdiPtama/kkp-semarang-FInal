import { MenuItem } from '../../../../shared/components';
import { IoFlaskOutline, IoWaterOutline } from 'react-icons/io5';

export default function LaboratoriumMenuList() {
    return (
        <>
            <MenuItem
                badge="LAB"
                title="Laboratorium Umum"
                description="Kelola pengujian sampel laboratorium umum, input hasil uji, tarif, dan LHU"
                icon={<IoFlaskOutline size={32} className="text-black" />}
                href="/laboratorium-umum"
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
            <MenuItem
                badge="LAB C"
                title="Laboratorium C"
                description="Kelola pengujian sampel Lab OC / official, hasil uji, history, dan laporan"
                icon={<IoWaterOutline size={32} className="text-black" />}
                href="/laboratorium-c"
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
        </>
    );
}
