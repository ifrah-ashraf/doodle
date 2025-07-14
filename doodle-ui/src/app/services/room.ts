import api from "@/utils/api"


export const createRoom = async (userid: string  , username : string  ) => {
    const res = api.get(`/create?userid=${userid}&username=${username}`)
    return res ;
}

export const joinRoom = async ( roomid : string , userid : string , username : string  ) => {
    const res = api.get(`/join?roomid=${roomid}&userid=${userid}&username=${username}`)
    return res ;
}