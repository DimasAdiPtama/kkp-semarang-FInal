import {
    Form,
    TextInput,
    EmailInput,
    PasswordInput,
    Button,
} from '../../../../shared/components';

export default function RegisterForm() {
    return (
        <Form>
            <TextInput
                name="full_name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap Anda"
                required
            />
            <TextInput
                name="nip"
                label="NIP"
                placeholder="Masukkan NIP Anda"
                required
            />
            <EmailInput
                name="email"
                label="Email"
                placeholder="Masukkan email Anda"
                required
            />
            <PasswordInput
                name="password"
                label="Password"
                placeholder="Masukkan password Anda"
                required
            />
            <PasswordInput
                name="confirm_password"
                label="Konfirmasi Password"
                placeholder="Masukkan password Anda"
                required
            />
            <Button>Daftar</Button>
        </Form>
    );
}
