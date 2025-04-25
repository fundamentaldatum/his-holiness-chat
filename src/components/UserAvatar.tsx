import React from "react";

export function UserAvatar({ name, image, size = 32 }: { name?: string; image?: string; size?: number }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700"
      style={{ width: size, height: size }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
