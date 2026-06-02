import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import KendaliAntreanSkeleton from './components/skeletons/kendali-antrean.skeleton';

// pages
const KendaliAntreanPage = lazy(() => import('./pages/kendali-antrean.page'));

export default function KendaliAntreanRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="kendali-antrean">
                        <Suspense fallback={<KendaliAntreanSkeleton />}>
                            <KendaliAntreanPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
