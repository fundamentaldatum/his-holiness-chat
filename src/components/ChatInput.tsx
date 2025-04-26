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
      setValue(newValue);
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
        className="w-full px-4 py-2 rounded border bg-white text-black almendra-font placeholder-gray-400 placeholder:almendra-font"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What troubles you, my son..."
        autoComplete="off"
        spellCheck={false}
        maxLength={300}
      />
    </form>
  );
});
