import { Skeleton } from '../../../../shared/components';
import LaboratoriumUmumLayout from '../../layouts/laboratorium-umum.layout';

export default function LaboratoriumUmumSkeleton() {
    return (
        <LaboratoriumUmumLayout>
            <div className="w-full flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <Skeleton className="min-h-32 w-full" />
                <Skeleton className="min-h-32 w-full" />
                <Skeleton className="min-h-32 w-full" />
            </div>
            <div className="w-full space-y-4">
                <div className="w-full flex gap-4">
                    <Skeleton className="min-h-8 w-24" />
                    <Skeleton className="min-h-8 w-24" />
                    <Skeleton className="min-h-8 w-24" />
                </div>
                <div className="w-full space-y-4">
                    <Skeleton className="min-h-14 w-full" />
                    <Skeleton className="min-h-14 w-full" />
                    <Skeleton className="min-h-14 w-full" />
                </div>
            </div>
        </LaboratoriumUmumLayout>
    );
}
