import React, { createContext, useContext, ReactNode } from 'react';
import { useViewport } from '../hooks/useViewport';

// Define the shape of the context
interface ViewportContextType {
  isMobile: boolean;
  isSmallMobile: boolean;
  isKeyboardVisible: boolean;
  width: number;
  height: number;
  appHeight: number;
}

// Create the context with undefined as default value
const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

interface ViewportProviderProps {
  children: ReactNode;
}

/**
 * Provider component for viewport information
 * @param children - Child components
 * @returns Provider component
 */
export function ViewportProvider({ children }: ViewportProviderProps) {
  const viewport = useViewport();
  
  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
}

/**
 * Custom hook to use the viewport context
 * @returns Viewport context
 * @throws Error if used outside of ViewportProvider
 */
export function useViewportContext(): ViewportContextType {
  const context = useContext(ViewportContext);
  if (context === undefined) {
    throw new Error('useViewportContext must be used within a ViewportProvider');
  }
  return context;
}
