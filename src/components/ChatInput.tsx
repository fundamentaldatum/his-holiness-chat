import { useState, FormEvent, forwardRef, useImperativeHandle, Ref } from "react";

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

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    setValue: (newValue: string) => {
      console.log("ChatInput.setValue called with:", newValue);
      setValue(newValue);
      
      // Use setTimeout to ensure the state update has been processed
      setTimeout(() => {
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
