import HeaderNavigation from '../../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../../shared/navigations/footer.navigation';
import { Skeleton } from '../../../../shared/components';

export default function KendaliAntreanSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <main className="flex-1 p-8">
                <div className="mx-auto max-w-3xl rounded-sm border bg-white p-6 space-y-6">
                    {/* Header skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" variant="rect" />
                        <Skeleton className="h-4 w-96" variant="rect" />
                    </div>

                    <hr className="border-slate-200" />

                    {/* Main content skeleton */}
                    <div className="space-y-6">
                        {/* Control card skeleton */}
                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-6 space-y-4">
                            <Skeleton className="h-5 w-40" variant="rect" />
                            <div className="flex justify-center items-center py-6">
                                <Skeleton className="h-24 w-48 rounded-md" variant="rect" />
                            </div>
                            <div className="flex justify-center gap-4">
                                <Skeleton className="h-10 w-24" variant="rect" />
                                <Skeleton className="h-10 w-24" variant="rect" />
                            </div>
                        </div>

                        {/* Slider / range control skeleton */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" variant="rect" />
                            <Skeleton className="h-8 w-full" variant="rect" />
                        </div>

                        {/* Text input skeleton */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" variant="rect" />
                            <Skeleton className="h-12 w-full" variant="rect" />
                        </div>
                    </div>

                    {/* Button skeleton */}
                    <div className="pt-4">
                        <Skeleton className="h-12 w-full" variant="rect" />
                    </div>
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
