import MenuLayout from '../../layouts/menu.layout';
import { Skeleton } from '../../../../shared/components';

export default function LayananOnlineMenuSkeleton() {
    return (
        <MenuLayout>
            <Skeleton className="min-h-48 w-full" />
            <Skeleton className="min-h-48 w-full" />
        </MenuLayout>
    );
}
