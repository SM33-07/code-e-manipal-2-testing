"use client"

import AdminSidebar from "@/components/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div className="flex">

      <AdminSidebar />

      <main className="flex-1 p-8">
        {children}
      </main>

    </div>

  )
}
