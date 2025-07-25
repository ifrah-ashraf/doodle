import { create } from "zustand";

interface UserData {
  userid: string;
  username: string;
  roomid: string;
  setUserData: (data: { userid: string; username: string; roomid: string }) => void;
  resetUserData: () => void;
}

const useUserDataStore = create<UserData>((set) => ({
  userid: "",
  username: "",
  roomid: "",

  setUserData: (data) =>
    set({
      userid: data.userid,
      username: data.username,
      roomid: data.roomid,
    }),

  resetUserData: () =>
    set({
      userid: "",
      username: "",
      roomid: "",
    }),
}));

export default useUserDataStore;
