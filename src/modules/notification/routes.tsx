// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// pages
const NotificationPage = lazy(() => import('./pages/notification.page'));

export default function NotificationRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="notification">
                        <Suspense fallback={'Loading...'}>
                            <NotificationPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
