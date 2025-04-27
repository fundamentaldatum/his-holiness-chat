import React, { createContext, useContext, ReactNode } from 'react';
import { useUserIdentity } from '../hooks/useUserIdentity';

// Define the shape of the context
interface UserContextType {
  userId: string;
  isNewUser: boolean;
  welcomeShown: boolean;
  markWelcomeAsShown: () => void;
  clearWelcomeFlag: () => void;
}

// Create the context with undefined as default value
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * Provider component for user identity information
 * @param children - Child components
 * @returns Provider component
 */
export function UserProvider({ children }: UserProviderProps) {
  const userIdentity = useUserIdentity();
  
  return (
    <UserContext.Provider value={userIdentity}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to use the user context
 * @returns User context
 * @throws Error if used outside of UserProvider
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
