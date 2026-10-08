import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ErrorBoundary } from '@/components/ui';
import { I18nProvider } from '@/i18n';
import { PluginProvider, registerAllPlugins } from '@/plugins';
import './index.css';

// Field/widget plugins must be registered before the editor renders
registerAllPlugins();

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <I18nProvider>
                    <PluginProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </PluginProvider>
                </I18nProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
