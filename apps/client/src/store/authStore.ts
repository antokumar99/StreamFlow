import {create} from 'zustand';
import {
  clearAuthToken,
  setAuthToken,
} from "@/lib/authToken";

interface User{
    _id: string;
    name: string;
    email: string;
}
interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    setAuth: (
    user: User,
    token: string
  ) => void;

  logout: () => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    token: null,

    loading: true,

    setAuth: (
      user,
      token
    ) => {
      setAuthToken(token);

      set({
        user,
        token,
        loading: false,
      });
    },

    logout: () => {
      clearAuthToken();

      set({
        user: null,
        token: null,
        loading: false,
      });
    },
  }));
