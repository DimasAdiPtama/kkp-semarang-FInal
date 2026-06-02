import AuthLayout from '../layouts/auth.layout';
import RegisterForm from '../components/forms/register.form';

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
