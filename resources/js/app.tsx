import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Console.log để debug
        console.log('Inertia props:', props);

        // Debug thông tin user
        const auth = (props.initialPage.props as any).auth;
        if (auth?.user) {
            console.log('Auth user:', {
                id: auth.user.id,
                full_name: auth.user.full_name,
                email: auth.user.email,
                position: auth.user.position
            });
        } else {
            console.log('No authenticated user');
        }

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
