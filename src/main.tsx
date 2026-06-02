// react and sonner
import { Toaster } from 'sonner';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// styles
import './shared/styles/tailwind.css';

// app
import App from './app/App';

// main render
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Toaster position="top-center" />
        <App />
    </StrictMode>,
);
