import "@/styles/fonts.css"
import "@/styles/index.css"
import "@/styles/tailwind.css"
import "@/styles/theme.css"

import RootClient from "./RootClient"

export const metadata = {
  title: "Code-e-Manipal Portal",
  description: "Hackathon submission and judging platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050816] text-white relative overflow-x-hidden">
        <RootClient>{children}</RootClient>
      </body>
    </html>
  )
}
