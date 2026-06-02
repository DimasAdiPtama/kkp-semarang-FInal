// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// skeleton
import LoginSkeleton from './components/skeletons/login.skeleton';
import RegisterSkeleton from './components/skeletons/register.skeleton';

// pages
const LoginPage = lazy(() => import('./pages/login.page'));
const RegisterPage = lazy(() => import('./pages/register.page'));

// routes
export default function AuthRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <Suspense fallback={<LoginSkeleton />}>
                        <LoginPage />
                    </Suspense>
                }
            />
            <Route
                path="/register"
                element={
                    <Suspense fallback={<RegisterSkeleton />}>
                        <RegisterPage />
                    </Suspense>
                }
            />
        </Routes>
    );
}
