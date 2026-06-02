import AuthLayout from '../../layouts/auth.layout';
import { Skeleton } from '../../../../shared/components';

export default function RegisterSkeleton() {
    return (
        <AuthLayout>
            <div className="w-full space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </AuthLayout>
    );
}
