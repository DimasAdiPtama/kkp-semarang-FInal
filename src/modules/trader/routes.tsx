// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import TraderSkeleton from './components/skeletons/trader.skeleton';

// pages
const TraderPage = lazy(() => import('./pages/trader.page'));

export default function TraderRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="traders">
                        <Suspense fallback={<TraderSkeleton />}>
                            <TraderPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
