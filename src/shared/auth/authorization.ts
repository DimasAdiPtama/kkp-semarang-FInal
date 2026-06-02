export type UserRole =
    | 'admin-operator'
    | 'smkhp-operator'
    | 'cs-operator'
    | 'lab-umum-operator'
    | 'lab-oficial-operator';

export type FeatureKey =
    | 'dashboard'
    | 'smkhp-offline'
    | 'laboratorium'
    | 'customer-service-offline'
    | 'layanan-online'
    | 'smkhp-online'
    | 'customer-service-online'
    | 'reporting'
    | 'traders'
    | 'history'
    | 'officers'
    | 'terminal'
    | 'notification'
    | 'settings'
    | 'kendali-antrean';

type RoleFeatureMap = Record<UserRole, FeatureKey[]>;

const roleFeatureMap: RoleFeatureMap = {
    'admin-operator': [
        'dashboard',
        'smkhp-offline',
        'laboratorium',
        'customer-service-offline',
        'layanan-online',
        'smkhp-online',
        'customer-service-online',
        'reporting',
        'traders',
        'history',
        'officers',
        'terminal',
        'notification',
        'settings',
        'kendali-antrean',
    ],
    'smkhp-operator': [
        'dashboard',
        'smkhp-offline',
        'layanan-online',
        'smkhp-online',
        'settings',
        'kendali-antrean',
    ],
    'cs-operator': [
        'dashboard',
        'traders',
        'history',
        'layanan-online',
        'customer-service-online',
        'settings',
        'kendali-antrean',
    ],
    'lab-umum-operator': ['dashboard', 'laboratorium', 'settings'],
    'lab-oficial-operator': ['dashboard', 'laboratorium', 'settings'],
};

export const featureRoutes: Partial<Record<FeatureKey, string>> = {
    dashboard: '/',
    'smkhp-offline': '/smkhp-offline',
    laboratorium: '/laboratorium',
    'customer-service-offline': '/customer-service-offline',
    'layanan-online': '/layanan-online',
    'smkhp-online': '/smkhp-online',
    'customer-service-online': '/customer-service-online',
    reporting: '/reporting',
    traders: '/traders',
    history: '/history',
    officers: '/officers',
    terminal: '/terminal',
    notification: '/notification',
    settings: '/settings',
    'kendali-antrean': '/kendali-antrean',
};

export function isKnownRole(role: string): role is UserRole {
    return role in roleFeatureMap;
}

export function canAccessFeature(role: string, feature: FeatureKey) {
    if (!isKnownRole(role)) {
        return false;
    }

    return roleFeatureMap[role].includes(feature);
}

export function getAllowedFeatures(role: string) {
    if (!isKnownRole(role)) {
        return [];
    }

    return roleFeatureMap[role];
}

export function getDefaultRouteByRole(role: string) {
    const firstAllowedFeature = getAllowedFeatures(role).find(
        (feature) => featureRoutes[feature],
    );

    return (
        (firstAllowedFeature && featureRoutes[firstAllowedFeature]) ||
        '/settings'
    );
}
