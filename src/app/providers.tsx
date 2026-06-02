// react and sonner
import { RouterProvider } from 'react-router-dom';

// router
import { router } from './router';

// provider
export default function Providers({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <>
            <RouterProvider router={router} />
            {children}
        </>
    );
}
