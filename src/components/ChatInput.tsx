import { useState, FormEvent } from "react";

export function ChatInput({
  onSubmit,
  onConfess,
}: {
  onSubmit: (body: string) => Promise<void>;
  onConfess?: () => void;
}) {
  const [value, setValue] = useState("");

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
}
