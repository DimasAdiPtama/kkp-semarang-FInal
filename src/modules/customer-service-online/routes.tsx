// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import CustomerServiceOnlineSkeleton from './components/skeletons/customer-service-online.skeleton';

// pages
const CustomerServiceOnlinePage = lazy(
    () => import('./pages/customer-service-online.page'),
);

export default function CustomerServiceOnlineRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="customer-service-online">
                        <Suspense fallback={<CustomerServiceOnlineSkeleton />}>
                            <CustomerServiceOnlinePage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
