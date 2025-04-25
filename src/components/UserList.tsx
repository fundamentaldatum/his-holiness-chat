import React from "react";
import { UserAvatar } from "./UserAvatar";

export function UserList({ users }: { users: Array<{ name?: string; email?: string; image?: string }> }) {
  return (
    <div className="mb-4">
      <div className="font-semibold mb-2 text-sm text-gray-500">Users</div>
      <div className="flex flex-wrap gap-2">
        {users.map((user, i) => (
          <div key={user.email ?? user.name ?? i} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
            <UserAvatar name={user.name ?? user.email} image={user.image} size={24} />
            <span className="text-xs">{user.name ?? user.email ?? "Anonymous"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
