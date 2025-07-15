import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:8080'; 

console.log("backend URL", BACKEND_URL)

export const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

export const SOCKET_URL = BACKEND_URL;