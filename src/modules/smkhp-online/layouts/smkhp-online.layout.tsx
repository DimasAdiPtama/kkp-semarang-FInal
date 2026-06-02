import HeaderNavigation from '../../../shared/navigations/header.navigation';
import FooterNavigation from '../../../shared/navigations/footer.navigation';

export default function SMKHPOnlineLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <HeaderNavigation />
            <main className="flex-1 p-8">
                <div className="w-full mx-auto max-w-7xl space-y-4">
                    {children}
                </div>
            </main>
            <FooterNavigation />
        </div>
    );
}
