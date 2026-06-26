"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function RegisterForm() {
  const { setAuth } =
    useAuthStore();
  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
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
        "/auth/register",
        formData
      );

      setAuth(
        res.data.user,
        res.data.token
      );

      alert("Registration successful");
      // redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.log(error);
      alert("Registration failed");
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
          Name
        </label>

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          className="w-full"
        />
      </div>

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
          placeholder="Create password"
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
        {loading
          ? "Creating account..."
          : "Register"}
      </button>
    </form>
  );
}
