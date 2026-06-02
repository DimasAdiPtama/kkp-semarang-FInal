import { IoIosDocument, IoIosHeadset } from 'react-icons/io';
import { MenuItem } from '../../../../shared/components';
import useGlobalStore from '../../../../shared/stores/global.store';
import { canAccessFeature } from '../../../../shared/auth/authorization';

export default function LayananOnlineMenuList() {
    const role = useGlobalStore((state) => state.state.role);

    return (
        <>
            {canAccessFeature(role, 'smkhp-online') && (
                <MenuItem
                    badge={5}
                    title="SMKHP"
                    description="Dokumen resmi KKP yang menjamin produk perikanan Indonesia memenuhi standar keamanan pangan internasional"
                    icon={<IoIosDocument size={32} className="text-black" />}
                    href="/smkhp-online"
                    className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
                />
            )}
            {canAccessFeature(role, 'customer-service-online') && (
                <MenuItem
                    badge={1}
                    title="Customer Service"
                    description="Layanan untuk membantu pengajuan SMKHP bagi yang belum memilikinya"
                    icon={<IoIosHeadset size={32} className="text-black" />}
                    href="/customer-service-online"
                    className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
                />
            )}
        </>
    );
}
