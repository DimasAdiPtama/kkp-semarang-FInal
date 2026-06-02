export default function FooterNavigation() {
    return (
        <footer className="bg-slate-900 text-white py-4 mt-auto">
            <div className="max-w-7xl mx-auto text-center text-sm">
                &copy; {new Date().getFullYear()} Kementerian Kelautan dan
                Perikanan. All rights reserved.
            </div>
        </footer>
    );
}
