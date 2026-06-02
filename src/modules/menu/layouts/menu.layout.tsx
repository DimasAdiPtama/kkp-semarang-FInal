import * as React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/configs/firebase';
import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';

function NotificationBanner() {
    const [notification, setNotification] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchNotification = async () => {
            const docRef = doc(db, 'notification', 'Jadwal');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().status) {
                setNotification(docSnap.data());
            }
        };
        fetchNotification();
    }, []);

    if (!notification) return null;

    const isUrgent = notification.type === 'urgent';
    const bgColor = isUrgent ? 'bg-[#FFEBEE]' : 'bg-[#EAF2FF]';
    const textColor = isUrgent ? 'text-[#D32F2F]' : 'text-[#2057A6]';

    return (
        <div className={`p-4 border-b ${bgColor} ${textColor}`}>
            <div className="max-w-7xl mx-auto">
                <h3 className="font-bold text-lg">{notification.heading}</h3>
                <p className="text-sm">{notification.Keterangan}</p>
            </div>
        </div>
    );
}

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <NotificationBanner />
            <main className="flex-1 p-8">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {children}
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
