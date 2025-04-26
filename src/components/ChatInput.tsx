import { useState, FormEvent, forwardRef, useImperativeHandle, useRef, useEffect, Ref } from "react";

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
        placeholder="What troubles you, my son..."
        autoComplete="off"
        spellCheck={false}
        maxLength={300}
      />
    </form>
  );
});
