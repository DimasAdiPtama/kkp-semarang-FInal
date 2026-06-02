// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import HistorySkeleton from './components/skeletons/history.skeleton';

// pages
const HistoryPage = lazy(() => import('./pages/history.page'));

export default function HistoryRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="history">
                        <Suspense fallback={<HistorySkeleton />}>
                            <HistoryPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
