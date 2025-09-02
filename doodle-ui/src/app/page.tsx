"use client";
import Message from "@/components/MessageBox/MessageList";
import RoomPanel from "@/components/RoomPanel";
import Shape from "@/components/Shape";
import UserList from "@/components/UserList";
import { useState } from "react";

type Mode = {
  isSelected: boolean;
  name: "create" | "join" | "";
};

type User = {
  userid: string;
  username: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {mode?.isSelected ? (
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-[1200px]">
          {/* User List */}
          <div className="flex-shrink-0">
            <UserList users={users} />
          </div>

          {/* Shape / Canvas */}
          <div className="flex-1">
            <Shape />
          </div>

          {/* Message Box */}
          <div className="flex-shrink-0">
            <Message />
          </div>
        </div>
      ) : (
        <RoomPanel setmode={setMode} setusers={setUsers} />
      )}
    </div>
  );
}
