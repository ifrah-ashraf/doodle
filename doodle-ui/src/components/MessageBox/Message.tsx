import React from "react";

function Messages() {
  // hardcoded array for testing
  const messages = ["Hello", "How are you?", "Testing 123"];

  return (
    <div className="flex flex-col h-80 w-72 bg-white border rounded-lg shadow p-3 overflow-y-auto space-y-2">
      {messages.length === 0 ? (
        <div className="text-gray-400 text-center mt-10">No messages yet</div>
      ) : (
        messages.map((msg, i) => (
          <div key={i} className="bg-gray-100 rounded px-3 py-2 text-sm">
            <span className="font-semibold text-blue-700">User:</span>{" "}
            <span>{msg}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default Messages;
