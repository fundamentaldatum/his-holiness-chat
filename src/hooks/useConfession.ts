import { useCallback, RefObject, useEffect } from 'react';

// Extend Window interface to include selectedConfession property
declare global {
  interface Window {
    selectedConfession?: string;
  }
}

interface UseConfessionProps {
  inputRef: RefObject<HTMLInputElement | null>;
  setValue?: (value: string) => void;
}

interface UseConfessionReturn {
  selectConfession: (confession: string) => void;
  handleConfessionEvent: (event: CustomEvent) => void;
}

/**
 * Custom hook to handle confession selection
 * @param inputRef - Reference to the input element
 * @param setValue - Function to update input value state
 * @returns Object with confession selection functions
 */
export function useConfession({ inputRef, setValue }: UseConfessionProps): UseConfessionReturn {
  // Handle selecting a confession
  const selectConfession = useCallback((confession: string) => {
    console.log("Confession selected:", confession);
    
    // Store current scroll position
    const scrollY = window.scrollY;
    
    // Apply a class to lock the scroll position
    document.body.classList.add('input-focused');
    
    // Add keyboard-visible class for mobile
    document.body.classList.add('keyboard-visible');
    
    // Calculate header height
    const headerHeight = 60; // Approximate header height
    const adjustedScroll = Math.max(0, scrollY - headerHeight);
    
    // Update state if setValue function is provided
    if (setValue) {
      setValue(confession);
    }
    
    // Store the selected confession in a global variable
    // This helps with mobile compatibility
    window.selectedConfession = confession;
    
    // Create and dispatch a custom event that components can listen for
    const event = new CustomEvent('confessionSelected', { 
      detail: { confession },
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
    
    // Try to directly update the input field
    setTimeout(() => {
      // Update via ref if available
      if (inputRef.current) {
        inputRef.current.value = confession;
        inputRef.current.focus();
      } else {
        // Find the input field in the DOM as fallback
        const inputField = document.querySelector('input[placeholder="What troubles you, my son..."]');
        if (inputField) {
          // Set the value directly
          (inputField as HTMLInputElement).value = confession;
          
          // Focus the input field
          (inputField as HTMLInputElement).focus();
          
          // Dispatch an input event to ensure React's state is updated
          const inputEvent = new Event('input', { bubbles: true });
          inputField.dispatchEvent(inputEvent);
        }
      }
      
      // Adjust scroll position to keep header visible
      setTimeout(() => {
        window.scrollTo(0, adjustedScroll);
      }, 50);
    }, 50);
  }, [inputRef, setValue]);

  // Handle custom confession event
  const handleConfessionEvent = useCallback((event: CustomEvent) => {
    if (event.detail && event.detail.confession) {
      const confession = event.detail.confession;
      console.log("Received confession from custom event:", confession);
      
      // Update state if setValue function is provided
      if (setValue) {
        setValue(confession);
      }
      
      // Update the input field directly
      if (inputRef.current) {
        inputRef.current.value = confession;
        inputRef.current.focus();
      }
    }
  }, [inputRef, setValue]);

  // Listen for the global selectedConfession variable
  useEffect(() => {
    const checkGlobalConfession = () => {
      if (window.selectedConfession) {
        console.log("Detected global confession:", window.selectedConfession);
        
        // Update state if setValue function is provided
        if (setValue) {
          setValue(window.selectedConfession);
        }
        
        // Update the input field directly
        if (inputRef.current) {
          inputRef.current.value = window.selectedConfession;
          inputRef.current.focus();
        }
        
        // Clear the global variable after using it
        setTimeout(() => {
          window.selectedConfession = undefined;
        }, 100);
      }
    };
    
    // Check immediately
    checkGlobalConfession();
    
    // Set up an interval to check periodically
    const intervalId = setInterval(checkGlobalConfession, 500);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [inputRef, setValue]);

  // Listen for the custom confessionSelected event
  useEffect(() => {
    // Add event listener for the custom event
    document.addEventListener('confessionSelected', handleConfessionEvent as EventListener);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('confessionSelected', handleConfessionEvent as EventListener);
    };
  }, [handleConfessionEvent]);

  return {
    selectConfession,
    handleConfessionEvent
  };
}
