import { useNavigate } from 'react-router-dom';

import {
    Form,
    EmailInput,
    PasswordInput,
    Button,
} from '../../../../shared/components';
import useAuthStore from '../../store';
import useGlobalStore from '../../../../shared/stores/global.store';

export default function LoginForm() {
    const navigate = useNavigate();
    const { email, password, set_field, login, is_loading } = useAuthStore();
    const { set_global_state } = useGlobalStore();

    const handleSubmit = async (e: React.FormEvent) => {
        const result = await login(e);

        if (result.success && result.data) {
            const res = result.data;
            set_global_state(res);
            setTimeout(() => {
                navigate('/');
            }, 2500);
        } else {
            alert(`Login Gagal: ${result.message}`);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <EmailInput
                label="Email"
                value={email}
                onChange={(e) => set_field('email', e.target.value)}
                disabled={is_loading}
                required
            />
            <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => set_field('password', e.target.value)}
                disabled={is_loading}
                required
            />
            <Button type="submit" disabled={is_loading}>
                {is_loading ? 'Memproses...' : 'Masuk'}
            </Button>
        </Form>
    );
}
