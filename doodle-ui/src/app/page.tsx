"use client";
import RoomPanel from "@/components/RoomPanel";
import Shape from "@/components/Shape";
import UserList from "@/components/UserList";
import { useEffect, useState } from "react";

//const socket = io("http://localhost:3001");

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

  /* useEffect(() => {
    socket.on("user-joined", (newUser) => {
      setUsers((prev) => [...prev, newUser]);
    });

    return () => {
      socket.off("user-joined");
    };
  }, []); */

  return (
    <div className="flex items-center justify-center  bg-gray-100 gap-2 px-4">
      {mode?.isSelected ? (
        <>
          <UserList users={users} />
          <Shape />
        </>
      ) : (
        <RoomPanel setmode={setMode} setusers={setUsers} />
      )}
    </div>
  );
}
