import { useState, useEffect, useCallback } from 'react';

// Extend Window interface to include initialHeight property
declare global {
  interface Window {
    initialHeight?: number;
  }
}

interface ViewportState {
  isMobile: boolean;
  isSmallMobile: boolean;
  isKeyboardVisible: boolean;
  width: number;
  height: number;
  appHeight: number;
}

/**
 * Custom hook to handle viewport and device detection
 * @returns Viewport state including device type and dimensions
 */
export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({
    isMobile: window.innerWidth < 768,
    isSmallMobile: window.innerWidth < 480,
    isKeyboardVisible: false,
    width: window.innerWidth,
    height: window.innerHeight,
    appHeight: window.innerHeight
  });

  // Set app height custom property for mobile browsers
  const setAppHeight = useCallback(() => {
    const doc = document.documentElement;
    const height = window.innerHeight;
    doc.style.setProperty('--app-height', `${height}px`);
    return height;
  }, []);

  // Detect keyboard visibility
  const detectKeyboard = useCallback(() => {
    // Store initial height if not already set
    if (!window.initialHeight) {
      window.initialHeight = window.innerHeight;
    }
    
    // Compare window.innerHeight with initial height
    const isKeyboardVisible = window.initialHeight 
      ? window.innerHeight < window.initialHeight * 0.8
      : false;
    
    // Update body class for CSS adjustments
    document.body.classList.toggle('keyboard-visible', isKeyboardVisible);
    
    return isKeyboardVisible;
  }, []);

  // Update viewport state on resize and orientation change
  useEffect(() => {
    // Initialize
    if (!window.initialHeight) {
      window.initialHeight = window.innerHeight;
    }
    
    const appHeight = setAppHeight();
    const isKeyboardVisible = detectKeyboard();
    
    // Set initial state
    setViewport({
      isMobile: window.innerWidth < 768,
      isSmallMobile: window.innerWidth < 480,
      isKeyboardVisible,
      width: window.innerWidth,
      height: window.innerHeight,
      appHeight
    });
    
    // Handler for resize and orientation change
    const handleResize = () => {
      const appHeight = setAppHeight();
      const isKeyboardVisible = detectKeyboard();
      
      setViewport({
        isMobile: window.innerWidth < 768,
        isSmallMobile: window.innerWidth < 480,
        isKeyboardVisible,
        width: window.innerWidth,
        height: window.innerHeight,
        appHeight
      });
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [setAppHeight, detectKeyboard]);

  return viewport;
}

/**
 * Prevent scroll jumping when input is focused
 * @param e - Focus event
 */
export function preventInputScroll(e: React.FocusEvent): void {
  // Get the current scroll position
  const scrollY = window.scrollY;
  
  // Store the current position of the input field
  const inputRect = e.target.getBoundingClientRect();
  const inputTop = inputRect.top + scrollY;
  
  // Apply a class to lock the scroll position
  document.body.classList.add('input-focused');
  
  // Add keyboard-visible class for mobile
  document.body.classList.add('keyboard-visible');
  
  // Calculate how much to adjust the scroll to keep the header visible
  const headerHeight = 60; // Approximate header height
  const adjustedScroll = Math.max(0, inputTop - headerHeight - 20);
  
  // Set the scroll position to keep both header and input visible
  setTimeout(() => {
    window.scrollTo(0, adjustedScroll);
  }, 10);
}

/**
 * Handle blur event to remove scroll locking classes
 */
export function handleInputBlur(): void {
  // Remove the input-focused class
  document.body.classList.remove('input-focused');
  
  // Remove keyboard-visible class
  document.body.classList.remove('keyboard-visible');
}
