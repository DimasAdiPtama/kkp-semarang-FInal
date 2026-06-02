// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import SMKHPOfflineSkeleton from './components/skeletons/smkhp-offline.skeleton';

// pages
const SMKHPOfflinePage = lazy(() => import('./pages/smkhp-offline.page'));

export default function SMKHPOfflineRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="smkhp-offline">
                        <Suspense fallback={<SMKHPOfflineSkeleton />}>
                            <SMKHPOfflinePage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
