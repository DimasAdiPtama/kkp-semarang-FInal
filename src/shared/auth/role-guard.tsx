import { Navigate } from 'react-router-dom';
import useGlobalStore from '../stores/global.store';
import {
    canAccessFeature,
    getDefaultRouteByRole,
    type FeatureKey,
} from './authorization';

type RoleGuardProps = {
    feature: FeatureKey;
    children: React.ReactNode;
};

export default function RoleGuard({ feature, children }: RoleGuardProps) {
    const role = useGlobalStore((state) => state.state.role);

    if (!role) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!canAccessFeature(role, feature)) {
        return <Navigate to={getDefaultRouteByRole(role)} replace />;
    }

    return <>{children}</>;
}
