import { useState } from "react";

export function ChatInput({
  onSubmit,
}: {
  onSubmit: (body: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        if (value.trim() === "") return;
        await onSubmit(value);
        setValue("");
      }}
    >
      <input
        className="flex-1 px-4 py-2 rounded border bg-white text-black almendra-font placeholder-gray-400 placeholder:almendra-font"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What troubles you, my son..."
        autoComplete="off"
        spellCheck={false}
        maxLength={300}
      />
      <button
        type="submit"
        className="almendra-font ml-2 px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
      >
        CONFESS
      </button>
    </form>
  );
}
