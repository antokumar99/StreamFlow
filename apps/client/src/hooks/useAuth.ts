"use client";

import {
  useEffect,
} from "react";

import axios from "@/lib/axios";
import {
  getAuthToken,
} from "@/lib/authToken";

import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const {
    user,
    loading,
    setAuth,
    logout,
  } = useAuthStore();

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const token =
            getAuthToken();

          if (!token) {
            logout();
            return;
          }

          const res =
            await axios.get(
              "/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setAuth(
            res.data.user,
            token
          );
        } catch {
          logout();
        }
      };

    loadUser();
  }, [logout, setAuth]);

  return {
    user,
    loading,
    logout,
  };
};
