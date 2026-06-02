import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';
import LaboratoriumUmumSkeleton from './components/skeletons/laboratorium-umum.skeleton';

const LaboratoriumUmumPage = lazy(
    () => import('./pages/laboratorium-umum.page'),
);

export default function LaboratoriumUmumRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="laboratorium">
                        <Suspense fallback={<LaboratoriumUmumSkeleton />}>
                            <LaboratoriumUmumPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
