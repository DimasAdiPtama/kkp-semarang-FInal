// react
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '../../shared/auth/role-guard';

// pages
const TerminalPage = lazy(() => import('./pages/terminal.page'));

export default function TerminalRoutesWithSkeleton() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <RoleGuard feature="terminal">
                        <Suspense fallback={'Loading...'}>
                            <TerminalPage />
                        </Suspense>
                    </RoleGuard>
                }
            />
        </Routes>
    );
}
