import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

interface UseScrollingReturn {
  isScrolledUp: boolean;
  shouldAutoScroll: boolean;
  scrollToBottom: () => void;
  observerRef: RefObject<MutationObserver | null>;
}

/**
 * Custom hook to handle chat scrolling behavior
 * @param containerRef - Reference to the chat container element
 * @returns Object containing scrolling state and functions
 */
export function useScrolling(containerRef: RefObject<HTMLDivElement | null>): UseScrollingReturn {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const observerRef = useRef<MutationObserver | null>(null);

  // Simplified scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      // Smooth scroll to bottom
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsScrolledUp(false);
      setShouldAutoScroll(true);
    }
  }, [containerRef]);

  // Improved scroll position detection with better touch support
  useEffect(() => {
    const chatContainer = containerRef.current;
    if (!chatContainer) return;
    
    // Simplified scroll handler with better performance
    const handleScroll = () => {
      // Calculate distance from bottom
      const distanceFromBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
      
      // Show button when scrolled up more than 100px from bottom
      const isScrolled = distanceFromBottom > 100;
      setIsScrolledUp(isScrolled);
      
      // Only auto-scroll if we're close to the bottom (within 50px)
      setShouldAutoScroll(distanceFromBottom < 50);
    };
    
    // Add event listeners with passive option for better performance
    chatContainer.addEventListener('scroll', handleScroll, { passive: true });
    chatContainer.addEventListener('touchmove', handleScroll, { passive: true });
    
    // Also listen for touchend to ensure we capture final position after touch scrolling
    chatContainer.addEventListener('touchend', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
      chatContainer.removeEventListener('touchmove', handleScroll);
      chatContainer.removeEventListener('touchend', handleScroll);
    };
  }, [containerRef]);
  
  // Simplified auto-scroll logic
  useEffect(() => {
    const chatContainer = containerRef.current;
    if (!chatContainer) return;
    
    // Create a new MutationObserver with simplified logic
    const observer = new MutationObserver(() => {
      // Only auto-scroll if shouldAutoScroll is true
      if (shouldAutoScroll && containerRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        });
      }
    });
    
    // Start observing the chat container for DOM changes
    observer.observe(chatContainer, {
      childList: true,      // Watch for changes to child elements
      subtree: true,        // Watch all descendants, not just direct children
      characterData: true,  // Watch for changes to text content
    });
    
    // Store the observer in the ref
    observerRef.current = observer;
    
    // Clean up the observer when the component unmounts
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [shouldAutoScroll, containerRef]);

  return {
    isScrolledUp,
    shouldAutoScroll,
    scrollToBottom,
    observerRef
  };
}
