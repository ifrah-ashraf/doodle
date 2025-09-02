import React from "react";

type User = {
  userid: string;
  username: string;
};

type UserListProps = {
  users: User[];
};

const UserList = ({ users }: UserListProps) => {
  return (
    <div className="w-[300px] h-[600px] bg-white shadow-lg rounded-xl border border-black p-4 flex flex-col">
      <h2 className="text-lg font-bold text-center mb-4 pb-1 border-b-2 border-gray-400">
        Players
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {users.length === 0 ? (
          <div className="text-gray-400 text-sm text-center mt-10">
            No users yet
          </div>
        ) : (
          users.map(({ userid, username }) => (
            <div
              key={userid}
              className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-800 hover:bg-gray-200 transition"
            >
              {username}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
