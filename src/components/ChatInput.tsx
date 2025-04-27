import { useState, FormEvent, forwardRef, useImperativeHandle, useRef, useEffect, useCallback, Ref } from "react";

export interface ChatInputRef {
  setValue: (value: string) => void;
  submitForm: () => Promise<void>;
}

interface ChatInputProps {
  onSubmit: (body: string) => Promise<void>;
  onConfess?: () => void;
}

export const ChatInput = forwardRef(function ChatInput(
  { onSubmit, onConfess }: ChatInputProps,
  ref: Ref<ChatInputRef>
) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for the global selectedConfession variable
  useEffect(() => {
    const checkGlobalConfession = () => {
      if (window.selectedConfession) {
        console.log("ChatInput detected global confession:", window.selectedConfession);
        setValue(window.selectedConfession);
        
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
  }, []);
  
  // Listen for the custom confessionSelected event
  useEffect(() => {
    const handleConfessionSelected = (event: CustomEvent) => {
      console.log("ChatInput received custom event:", event.detail);
      
      if (event.detail && event.detail.confession) {
        const confession = event.detail.confession;
        console.log("ChatInput setting value from custom event:", confession);
        setValue(confession);
        
        // Also update the input field directly
        if (inputRef.current) {
          inputRef.current.value = confession;
          inputRef.current.focus();
        }
      }
    };
    
    // Add event listener for the custom event
    document.addEventListener('confessionSelected', handleConfessionSelected as EventListener);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('confessionSelected', handleConfessionSelected as EventListener);
    };
  }, []);

  // Prevent scroll jumping when input is focused
  const preventScroll = useCallback((e: React.FocusEvent) => {
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
  }, []);
  
  // Handle blur event
  const handleBlur = useCallback(() => {
    // Remove the input-focused class
    document.body.classList.remove('input-focused');
    
    // Remove keyboard-visible class
    document.body.classList.remove('keyboard-visible');
  }, []);
  
  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    setValue: (newValue: string) => {
      console.log("ChatInput.setValue called with:", newValue);
      setValue(newValue);
      
      // Use setTimeout to ensure the state update has been processed
      setTimeout(() => {
        // Update the input field directly if we have a ref to it
        if (inputRef.current) {
          console.log("ChatInput: Updating input field via ref");
          inputRef.current.value = newValue;
          inputRef.current.focus();
        }
        
        // Also try to directly update the input field as a fallback
        const inputField = document.querySelector('input[placeholder="What troubles you, my son..."]');
        if (inputField) {
          console.log("ChatInput: Found input field, setting value directly");
          // Set the value directly
          (inputField as HTMLInputElement).value = newValue;
          
          // Focus the input field
          (inputField as HTMLInputElement).focus();
          
          // Dispatch an input event to ensure React's state is updated
          const event = new Event('input', { bubbles: true });
          inputField.dispatchEvent(event);
        }
      }, 0);
    },
    submitForm: async () => {
      if (value.trim() !== "") {
        await onSubmit(value);
        setValue("");
        if (onConfess) onConfess();
      }
    }
  }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() === "") return;
    await onSubmit(value);
    setValue("");
    if (onConfess) onConfess();
  };

  return (
    <form
      className="w-full"
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        className="w-full px-3 xs:px-4 py-2 rounded border bg-white text-black text-sm xs:text-base almendra-font placeholder-gray-400 placeholder:almendra-font placeholder:text-sm xs:placeholder:text-base"
        type="text"
        value={value}
        onChange={(e) => {
          console.log("Input onChange:", e.target.value);
          setValue(e.target.value);
        }}
        onFocus={preventScroll}
        onBlur={handleBlur}
        placeholder="What troubles you, my son..."
        autoComplete="off"
        spellCheck={false}
        maxLength={300}
      />
    </form>
  );
});
