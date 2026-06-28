import "@/styles/fonts.css"
import "@/styles/index.css"
import "@/styles/tailwind.css"
import "@/styles/theme.css"

import { ThemeProvider } from "@/components/ThemeProvider"
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground relative overflow-x-hidden transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="code-e-manipal-theme"
        >
          <RootClient>{children}</RootClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
