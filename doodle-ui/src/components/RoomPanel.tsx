import axios from "axios";
import React, { useState } from "react";

type Mode = {
  isSelected: boolean;
  name: "create"| "join" | "";
};

type setModeProps = {
    setmode: React.Dispatch<React.SetStateAction<Mode | null>>;
}

const RoomPanel = ({  setmode}: setModeProps) => {
    const [roomId, setRoomId] = useState("");

//Redundant button properties optimize it later on 
  const handleCreate = async () => {
    setmode({isSelected: true , name: "create"})
  }

  const handleJoin = () => {
   setmode({isSelected: true , name: "join"})
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Welcome to Doodle{" "}
        </h1>

        {/* Toggle buttons */}
        <div className="flex flex-col justify-center gap-4">
          <button
            className="px-4 py-2 rounded-lg font-medium bg-yellow-400 hover:bg-yellow-600 cursor-pointer text-black"
            onClick={handleCreate}
          >
            Create Room
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-700 cursor-pointer text-black"             
            onClick={handleJoin}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPanel;
