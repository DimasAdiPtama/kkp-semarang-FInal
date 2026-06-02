import MenuLayout from '../layouts/menu.layout';
import LayananOnlineMenuList from '../components/menus/layanan-online.menu.list';
import RoleGuard from '../../../shared/auth/role-guard';

export default function LayananOnlineRouterPage() {
    return (
        <RoleGuard feature="layanan-online">
            <MenuLayout>
                <LayananOnlineMenuList />
            </MenuLayout>
        </RoleGuard>
    );
}
