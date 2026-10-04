"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";

const TeamLeaderWorkspace = dynamic(
  () => import("@/components/team/TeamLeaderWorkspace").then((m) => m.TeamLeaderWorkspace),
  { ssr: false }
);

/**
 * Participant Team Leader Command Center.
 * Exposes team identity, progress, submission tracking, roster, and key milestones.
 */
export default function TeamPage() {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role !== "participant" && role !== "admin") {
      router.push("/dashboard");
    }
  }, [role, isAuthenticated, router]);

  if (!isAuthenticated || (role !== "participant" && role !== "admin")) return null;

  return (
    <div className="pt-2">
      <TeamLeaderWorkspace />
    </div>
  );
}
