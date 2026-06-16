"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {

  const router = useRouter();
  const { role, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role === "admin") { router.replace("/admin"); return; }
    if (role === "judge") { router.replace("/judging"); return; }
    if (role === "participant") { router.replace("/team"); return; }
    router.replace("/login");
  }, [isAuthenticated, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#A08070] text-sm">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-[#D4732A] text-sm font-medium">
      Redirecting...
    </div>
  );
}
