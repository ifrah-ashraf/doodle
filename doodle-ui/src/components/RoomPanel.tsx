"use client";

import { createRoom, joinRoom } from "@/services/room";
import useSocketStore from "@/store/socketStore";
import useUserDataStore from "@/store/useUserDataStore";
import React, { useState } from "react";

type Mode = {
  isSelected: boolean;
  name: "create" | "join" | "";
};

type User = {
  userid: string;
  username: string;
};

type setModeProps = {
  setmode: React.Dispatch<React.SetStateAction<Mode | null>>;
  setusers: React.Dispatch<React.SetStateAction<User[]>>;
};

const RoomPanel = ({ setmode, setusers }: setModeProps) => {
  const [mode, setLocalMode] = useState<"create" | "join" | "">("");
  const [userid, setUserid] = useState("");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const setSocket = useSocketStore((state) => state.setSocket);
  const setUserData = useUserDataStore((state) => state.setUserData);

  const handleSubmit = async () => {
    if (!userid || !username || (mode === "join" && !roomId)) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      let data;
      let currentRoomId = "";

      if (mode === "create") {
        data = await createRoom(userid, username);
        if (data && !data.error) currentRoomId = data.room_id;
      } else if (mode === "join") {
        data = await joinRoom(Number(roomId), userid, username);
        if (data && !data.error) currentRoomId = roomId;
      }

      if (!data || data.error || !currentRoomId) {
        alert(data?.message || "Unknown error.");
        return;
      }

      setUserData({
        userid,
        username,
        roomid: currentRoomId.toString(),
      });

      const socket = setSocket(Number(currentRoomId), userid);
      if (socket) {
        socket.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          console.log("📨 Received data:", msg);
        };
      }

      setmode({ isSelected: true, name: mode });
      setusers(
        mode === "create" ? [{ userid, username }] : data.connected_users || []
      );

      console.log(mode === "create" ? "Room created:" : "Joined room:", data);
    } catch (error) {
      console.error("Request failed:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Welcome to Doodle
        </h1>

        {!mode ? (
          <div className="flex flex-col justify-center gap-4">
            <button
              className="px-4 py-2 rounded-lg font-medium bg-yellow-400 hover:bg-yellow-600 text-black"
              onClick={() => setLocalMode("create")}
            >
              Create Room
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-700 text-black"
              onClick={() => setLocalMode("join")}
            >
              Join Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === "join" && (
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            )}
            <input
              type="text"
              placeholder="User ID"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-700 text-black rounded-lg"
            >
              {mode === "create" ? "Create Room" : "Join Room"}
            </button>
            <button
              onClick={() => setLocalMode("")}
              className="w-full text-sm text-gray-500 underline cursor-pointer"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPanel;
