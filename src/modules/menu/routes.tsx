// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// skeletons
import MainMenuSkeleton from './components/skeletons/main.menu.skeleton';
import LayananOnlineMenuSkeleton from './components/skeletons/layanan-online.menu.skeleton';
import ReportingMenuSkeleton from './components/skeletons/reporting.menu.skeleton';
import SettingMenuSkeleton from './components/skeletons/setting.menu.skeleton';
import LaboratoriumMenuSkeleton from './components/skeletons/laboratorium.menu.skeleton';

// pages
const MainRouterPage = lazy(() => import('./pages/main-router.page'));
const LayananOnlineRouterPage = lazy(
    () => import('./pages/layanan-online-router.page'),
);
const ReportingRouterPage = lazy(() => import('./pages/reporting-router.page'));
const LaboratoriumRouterPage = lazy(
    () => import('./pages/laboratorium-router.page'),
);
const SettingRouterPage = lazy(() => import('./pages/setting-router.page'));
const ProfileSettingsPage = lazy(
    () => import('../settings/pages/profile-settings.page'),
);
const PasswordSettingsPage = lazy(
    () => import('../settings/pages/password-settings.page'),
);

export default function MenuRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Suspense fallback={<MainMenuSkeleton />}>
                        <MainRouterPage />
                    </Suspense>
                }
            />
            <Route
                path="/layanan-online"
                element={
                    <Suspense fallback={<LayananOnlineMenuSkeleton />}>
                        <LayananOnlineRouterPage />
                    </Suspense>
                }
            />
            <Route
                path="/reporting"
                element={
                    <Suspense fallback={<ReportingMenuSkeleton />}>
                        <ReportingRouterPage />
                    </Suspense>
                }
            />
            <Route
                path="/settings"
                element={
                    <Suspense fallback={<SettingMenuSkeleton />}>
                        <SettingRouterPage />
                    </Suspense>
                }
            />
            <Route
                path="/settings/profile"
                element={
                    <Suspense fallback={<SettingMenuSkeleton />}>
                        <ProfileSettingsPage />
                    </Suspense>
                }
            />
            <Route
                path="/settings/password"
                element={
                    <Suspense fallback={<SettingMenuSkeleton />}>
                        <PasswordSettingsPage />
                    </Suspense>
                }
            />
            <Route
                path="/laboratorium"
                element={
                    <Suspense fallback={<LaboratoriumMenuSkeleton />}>
                        <LaboratoriumRouterPage />
                    </Suspense>
                }
            />
        </Routes>
    );
}
