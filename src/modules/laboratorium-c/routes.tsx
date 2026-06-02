import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';
import LaboratoriumCSkeleton from './components/skeletons/laboratorium-c.skeleton';

const LaboratoriumCPage = lazy(() => import('./pages/laboratorium-c.page'));

export default function LaboratoriumCRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="laboratorium">
                        <Suspense fallback={<LaboratoriumCSkeleton />}>
                            <LaboratoriumCPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
