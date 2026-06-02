import SMKHPOfflineLayout from '../../layouts/smkhp-offline.layout';
import { Skeleton } from '../../../../shared/components';

export default function SMKHPOfflineSkeleton() {
    return (
        <SMKHPOfflineLayout>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </SMKHPOfflineLayout>
    );
}
