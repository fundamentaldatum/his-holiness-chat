import { useMemo } from 'react';

interface UserIdentity {
  userId: string;
  isNewUser: boolean;
  welcomeShown: boolean;
  markWelcomeAsShown: () => void;
  clearWelcomeFlag: () => void;
}

/**
 * Custom hook to handle user identification
 * @returns User identity information and related functions
 */
export function useUserIdentity(): UserIdentity {
  const { userId, isNewUser, welcomeShown } = useMemo(() => {
    let userId = localStorage.getItem('popeUserId');
    let isNewUser = false;
    let welcomeShown = localStorage.getItem('popeWelcomeShown') === 'true';
    
    if (!userId) {
      userId = crypto.randomUUID(); // Generate a UUID
      localStorage.setItem('popeUserId', userId);
      isNewUser = true;
      welcomeShown = false;
    }
    
    return { userId, isNewUser, welcomeShown };
  }, []);

  /**
   * Mark welcome message as shown
   */
  const markWelcomeAsShown = () => {
    localStorage.setItem('popeWelcomeShown', 'true');
  };

  /**
   * Clear welcome message flag
   */
  const clearWelcomeFlag = () => {
    localStorage.removeItem('popeWelcomeShown');
  };

  return {
    userId,
    isNewUser,
    welcomeShown,
    markWelcomeAsShown,
    clearWelcomeFlag
  };
}
