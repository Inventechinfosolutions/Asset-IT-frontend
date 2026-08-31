import { QueryClientProvider } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import React from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/features/auth';
import { queryClient } from '@/lib/query-client';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          closeButton
          icons={{
            success: (
              <Check
                size={18}
                strokeWidth={3}
                color="#16a34a"
                aria-hidden="true"
              />
            ),
          }}
          toastOptions={{
            className: 'app-toast',
            style: {
              background: '#ffffff',
              color: '#0f172a',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
