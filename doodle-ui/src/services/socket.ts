export function createWebSocket(roomid: number | string, userid: string | number ): WebSocket {
  const wsURL = process.env.NEXT_PUBLIC_BACKEND_URI?.replace(/^http/, "ws") || "ws://localhost:8080";
  const socket = new WebSocket(`${wsURL}/ws?roomid=${roomid}&userid=${userid}`);

  socket.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event.reason);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
}
