"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {

  const router = useRouter();
  const { user, role, isAuthenticated } = useAuth();

  useEffect(() => {

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    if (role === "judge") {
      router.replace("/judging");
      return;
    }

    if (role === "participant") {
      router.replace("/team");
      return;
    }

    router.replace("/login");

  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading dashboard...
    </div>
  );
}
