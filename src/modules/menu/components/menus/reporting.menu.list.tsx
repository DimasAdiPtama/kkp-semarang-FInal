import { IoIosDocument, IoIosFlask, IoIosHeadset } from 'react-icons/io';
import { MenuItem } from '../../../../shared/components';

export default function ReportingMenuList() {
    return (
        <>
            <MenuItem
                title="SMKHP Reporting"
                description="Rekapitulasi pengajuan sertifikat harian hingga bulanan untuk monitoring status kepatuhan ekspor."
                icon={<IoIosDocument size={32} className="text-black" />}
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
            <MenuItem
                title="Laboratorium Reporting"
                description="Log pengujian sampel dan tren hasil uji berkala untuk memantau konsistensi mutu produk perikanan."
                icon={<IoIosFlask size={32} className="text-black" />}
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
            <MenuItem
                title="Customer Service Reporting"
                description="Statistik performa asistensi pengguna dan ringkasan penyelesaian kendala teknis secara periodik."
                icon={<IoIosHeadset size={32} className="text-black" />}
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
        </>
    );
}
