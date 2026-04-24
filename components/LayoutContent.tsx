"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const hideNavbarRoutes = ["/login"];

  const hideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
