import MenuLayout from '../layouts/menu.layout';
import MainMenuList from '../components/menus/main.menu.list';
import RoleGuard from '../../../shared/auth/role-guard';

export default function MainRouterPage() {
    return (
        <RoleGuard feature="dashboard">
            <MenuLayout>
                <MainMenuList />
            </MenuLayout>
        </RoleGuard>
    );
}
