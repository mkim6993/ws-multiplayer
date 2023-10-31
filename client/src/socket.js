import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? undefined : "http://192.168.4.126:8000/";

const socket = io(URL, {
    autoConnect: false
});

export default socket;