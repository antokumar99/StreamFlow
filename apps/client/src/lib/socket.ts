import { io } from "socket.io-client";
import {
  getAuthToken,
} from "./authToken";

export const socket = io(
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "http://localhost:4000",
  {
    autoConnect: false,

    withCredentials: true,

    transports: [
      "websocket",
    ],

    auth: (cb) => {
      const token =
        getAuthToken();

      cb({
        token,
      });
    },
  }
);
