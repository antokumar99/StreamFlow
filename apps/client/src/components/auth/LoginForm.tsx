"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function LoginForm() {
  const { setAuth } =
    useAuthStore();
  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        formData
      );

      setAuth(
        res.data.user,
        res.data.token
      );

      alert("Login successful");
      // redirect to home page
      window.location.href = "/home";
    } catch (error) {
      console.log(error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="block mb-2 text-sm text-gray-300">
          Email
        </label>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm text-gray-300">
          Password
        </label>

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
