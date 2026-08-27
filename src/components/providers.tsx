'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { logClientError } from '@/lib/error-logger';

function ErrorLoggerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const email = user?.email || 'unauthenticated';

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      logClientError(
        event.message || 'Unhandled Runtime Exception',
        event.error || new Error(event.message),
        window.location.pathname,
        email
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logClientError(
        'Unhandled Promise Rejection',
        event.reason,
        window.location.pathname,
        email
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [email]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErrorLoggerProvider>{children}</ErrorLoggerProvider>
    </AuthProvider>
  );
}
