// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// skeleton
import SMKHPOnlineSkeleton from './components/skeletons/smkhp-online.skeleton';

// pages
const SMKHPOnlinePage = lazy(() => import('./pages/smkhp-online.page'));

export default function SMKHPOnlineRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="smkhp-online">
                        <Suspense fallback={<SMKHPOnlineSkeleton />}>
                            <SMKHPOnlinePage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
