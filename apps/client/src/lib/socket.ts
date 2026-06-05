import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL!,
  {
    autoConnect: false,

    withCredentials: true,

    transports: [
      "websocket",
    ],

    auth: (cb) => {
      const token =
        localStorage.getItem(
          "token"
        );

      cb({
        token,
      });
    },
  }
);