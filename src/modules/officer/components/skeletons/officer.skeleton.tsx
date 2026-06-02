import OfficerLayout from '../../layouts/officer.layout';
import { Skeleton } from '../../../../shared/components';

export default function OfficerSkeleton() {
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
