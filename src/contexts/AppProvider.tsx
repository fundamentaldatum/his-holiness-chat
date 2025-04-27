import React, { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { ViewportProvider } from './ViewportContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Combined provider component for the application
 * Wraps all context providers in a single component
 * @param children - Child components
 * @returns Provider component
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <ViewportProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ViewportProvider>
  );
}
