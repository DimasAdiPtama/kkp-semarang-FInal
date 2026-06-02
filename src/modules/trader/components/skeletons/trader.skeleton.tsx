import OfficerLayout from '../../layouts/trader.layout';
import { Skeleton } from '../../../../shared/components';

export default function TraderSkeleton() {
    return (
        <OfficerLayout>
            <Skeleton className="min-h-12 w-1/4" />
            <Skeleton className="min-h-12 w-full" />
            <Skeleton className="min-h-32 w-full" />
            <div className="w-full flex justify-between items-center">
                <Skeleton className="min-h-12 w-1/4" />
                <Skeleton className="min-h-12 w-1/4" />
            </div>
        </OfficerLayout>
    );
}
