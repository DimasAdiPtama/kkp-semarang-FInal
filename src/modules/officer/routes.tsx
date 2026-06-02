// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import OfficerSkeleton from './components/skeletons/officer.skeleton';

// pages
const OfficerPage = lazy(() => import('./pages/officer.page'));

export default function OfficerRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="officers">
                        <Suspense fallback={<OfficerSkeleton />}>
                            <OfficerPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
