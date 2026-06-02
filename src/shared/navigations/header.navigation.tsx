import { useNavigate } from 'react-router-dom';
import { Button } from '../components';
import useGlobalStore from '../stores/global.store';

export default function HeaderNavigation() {
    const navigate = useNavigate();
    const reset = useGlobalStore((s) => s.reset_global_state);

    const handleLogout = () => {
        reset();
        setTimeout(() => {
            navigate('/auth/login');
        }, 2500);
    };

    return (
        <header className="bg-slate-900 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <img
                    src="/logo.png"
                    alt="Logo KKP"
                    className="h-14 w-auto object-contain"
                />
                <Button variant="solid" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </header>
    );
}
