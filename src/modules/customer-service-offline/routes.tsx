// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import CustomerServiceOfflineSkeleton from './components/skeletons/customer-service-offline.skeleton';

// pages
const CustomerServiceOfflinePage = lazy(
    () => import('./pages/customer-service-offline.page'),
);

export default function CustomerServiceOfflineRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="customer-service-offline">
                        <Suspense fallback={<CustomerServiceOfflineSkeleton />}>
                            <CustomerServiceOfflinePage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
