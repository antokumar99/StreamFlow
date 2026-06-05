"use client";

import {
  useEffect,
} from "react";

import { socket } from "@/lib/socket";

export const useSocket =
  () => {
    useEffect(() => {
      socket.connect();

      return () => {
        socket.disconnect();
      };
    }, []);

    return socket;
  };