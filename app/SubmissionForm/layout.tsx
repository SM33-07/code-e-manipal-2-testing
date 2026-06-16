'use client';

import { Toaster } from "@/components/ui/sonner";

export default function SubmissionFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster theme="dark" />
    </>
  );
}
