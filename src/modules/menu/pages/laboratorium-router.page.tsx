import MenuLayout from '../layouts/menu.layout';
import LaboratoriumMenuList from '../components/menus/laboratorium.menu.list';
import RoleGuard from '../../../shared/auth/role-guard';

export default function LaboratoriumRouterPage() {
    return (
        <RoleGuard feature="laboratorium">
            <MenuLayout>
                <LaboratoriumMenuList />
            </MenuLayout>
        </RoleGuard>
    );
}
