import React, { useState, forwardRef, useImperativeHandle, useRef, Ref } from "react";
import { ChatInputProps, ChatInputRef } from "../../utils/types";
import { useConfession } from "../../hooks/useConfession";
import { preventInputScroll, handleInputBlur } from "../../hooks/useViewport";
import { INPUT_PLACEHOLDER } from "../../utils/constants";

/**
 * Component for chat input with confession selection support
 * @param onSubmit - Function to call when the form is submitted
 * @param onConfess - Optional function to call after confession
 * @param ref - Ref for imperative access to component methods
 * @returns Chat input component
 */
export const ChatInput = forwardRef(function ChatInput(
  { onSubmit, onConfess }: ChatInputProps,
  ref: Ref<ChatInputRef>
) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use the confession hook
  const { handleConfessionEvent } = useConfession({
    inputRef,
    setValue
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        onFocus={preventInputScroll}
        onBlur={handleInputBlur}
        placeholder={INPUT_PLACEHOLDER}
        autoComplete="off"
        spellCheck={false}
        maxLength={300}
      />
    </form>
  );
});
