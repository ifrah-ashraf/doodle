import { api } from "@/utils/api"; // Make sure api is axios instance with baseURL set

// POST /create with JSON body
export const createRoom = async (userid: string, username: string) => {
  try {
    const res = await api.post("/create", {
      userid,
      username,
    });
    return res.data;
  } catch (error) {
    console.error("Create Room Failed:", error);
    throw error;
  }
};

// POST /join with JSON body
export const joinRoom = async (roomid: number, userid: string, username: string) => {
  try {
    const res = await api.post("/join", {
      roomid,
      userid,
      username,
    });
    return res.data;
  } catch (error) {
    console.error("Join Room Failed:", error);
    throw error;
  }
};
