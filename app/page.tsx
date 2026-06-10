"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {

  const router = useRouter();
  const { role, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role === "admin") { router.replace("/admin"); return; }
    if (role === "judge") { router.replace("/judging"); return; }
    if (role === "participant") { router.replace("/team"); return; }
    router.replace("/login");
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">
      Redirecting...
    </div>
  );
}
