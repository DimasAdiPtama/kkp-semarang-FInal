import MenuLayout from '../layouts/menu.layout';
import SettingMenuList from '../components/menus/setting.menu.list';
import RoleGuard from '../../../shared/auth/role-guard';

export default function SettingRouterPage() {
    return (
        <RoleGuard feature="settings">
            <MenuLayout>
                <SettingMenuList />
            </MenuLayout>
        </RoleGuard>
    );
}
