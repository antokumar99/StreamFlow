"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
} from "react";

import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !user
    ) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return children;
}