"use client";

const TOKEN_KEY = "token";

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(
      TOKEN_KEY
    ) ||
    window.localStorage.getItem(TOKEN_KEY)
  );
};

export const setAuthToken = (
  token: string
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    TOKEN_KEY,
    token
  );
  window.localStorage.removeItem(
    TOKEN_KEY
  );
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    TOKEN_KEY
  );
  window.localStorage.removeItem(
    TOKEN_KEY
  );
};
