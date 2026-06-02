import { MenuItem } from '../../../../shared/components';

import { RiUserSettingsFill } from 'react-icons/ri';
import { MdOutlinePassword } from 'react-icons/md';

export default function SettingMenuList() {
    return (
        <>
            <MenuItem
                title="Pengaturan Akun"
                description="Ubah informasi akun, seperti nama, email, dan lainnya"
                icon={<RiUserSettingsFill size={32} className="text-black" />}
                href="/settings/profile"
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
            <MenuItem
                title="Ubah Password"
                description="Ganti password akun Anda untuk menjaga keamanan"
                icon={<MdOutlinePassword size={32} className="text-black" />}
                href="/settings/password"
                className="hover:shadow-lg hover:bg-slate-100 transition-all duration-200"
            />
        </>
    );
}
