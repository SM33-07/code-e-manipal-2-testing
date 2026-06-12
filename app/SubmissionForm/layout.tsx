'use client';

import { Toaster } from "@/components/ui/sonner";

export default function SubmissionFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/images/backgrounds/submission.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 4,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(135deg, rgba(2,8,23,0.85) 0%, rgba(5,13,36,0.75) 50%, rgba(2,8,23,0.85) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      {children}
      <Toaster theme="dark" />
    </>
  );
}
