import { createWebSocket } from "@/services/socket";
import { create } from "zustand";


interface SocketState {
    socket : WebSocket | null ;
    setSocket: (roomid: number, userid: string) => WebSocket;
    closeSocket : () => void
}

const useSocketStore = create<SocketState>((set, get) => ({
    socket : null ,

    setSocket : (roomid , userid) => {
        const existingSocket = get().socket ;
        // this may create error if the previous socket connection is used bcz the cleanup is not happened via closeSocket
        if (existingSocket) return existingSocket ; 

        const socket = createWebSocket(roomid, userid) ;
        set({ socket}) ;
        return socket 
    },

    closeSocket : () => {
        const existingSocket = get().socket
        if (existingSocket) {
            existingSocket.close()
            set({socket : null })
        }
    }
}))

export default useSocketStore ;
