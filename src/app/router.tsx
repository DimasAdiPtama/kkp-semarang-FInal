// react
import { createBrowserRouter } from 'react-router-dom';

// routing with skeleton
import AuthRoutesWithSkeleton from '../modules/auth/routes';
import MenuRoutesWithSkeleton from '../modules/menu/routes';
import OfficerRoutesWithSkeleton from '../modules/officer/routes';
import TraderRoutesWithSkeleton from '../modules/trader/routes';
import HistoryRoutesWithSkeleton from '../modules/history/routes';
import TerminalRoutesWithSkeleton from '../modules/terminal/routes';

import SMKHPOfflineRoutesWithSkeleton from '../modules/smkhp-offline/routes';
import CustomerServiceOfflineRoutesWithSkeleton from '../modules/customer-service-offline/routes';
import SMKHPOnlineRoutesWithSkeleton from '../modules/smkhp-online/routes';
import CustomerServiceOnlineRoutesWithSkeleton from '../modules/customer-service-online/routes';
import LaboratoriumUmumRoutesWithSkeleton from '../modules/laboratorium-umum/routes';
import LaboratoriumCRoutesWithSkeleton from '../modules/laboratorium-c/routes';
import NotificationRoutesWithSkeleton from '../modules/notification/routes';
import KendaliAntreanRoutesWithSkeleton from '../modules/kendali-antrean/routes';
import LabReportPreviewPage from '../modules/laboratory-shared/pages/lab-report.preview.page';

// main router
export const router = createBrowserRouter([
    {
        path: '/*',
        Component: MenuRoutesWithSkeleton,
    },
    {
        path: '/auth/*',
        Component: AuthRoutesWithSkeleton,
    },
    {
        path: '/officers/*',
        Component: OfficerRoutesWithSkeleton,
    },
    {
        path: '/traders/*',
        Component: TraderRoutesWithSkeleton,
    },
    {
        path: '/history/*',
        Component: HistoryRoutesWithSkeleton,
    },
    {
        path: '/terminal/*',
        Component: TerminalRoutesWithSkeleton,
    },
    {
        path: '/notification/*',
        Component: NotificationRoutesWithSkeleton,
    },
    {
        path: '/kendali-antrean/*',
        Component: KendaliAntreanRoutesWithSkeleton,
    },
    {
        path: '/smkhp-offline/*',
        Component: SMKHPOfflineRoutesWithSkeleton,
    },
    {
        path: '/customer-service-offline/*',
        Component: CustomerServiceOfflineRoutesWithSkeleton,
    },
    {
        path: '/smkhp-online/*',
        Component: SMKHPOnlineRoutesWithSkeleton,
    },
    {
        path: '/customer-service-online/*',
        Component: CustomerServiceOnlineRoutesWithSkeleton,
    },
    {
        path: '/laboratorium-umum/*',
        Component: LaboratoriumUmumRoutesWithSkeleton,
    },
    {
        path: '/laboratorium-c/*',
        Component: LaboratoriumCRoutesWithSkeleton,
    },
    {
        path: '/lhu-preview',
        Component: LabReportPreviewPage,
    },
]);
