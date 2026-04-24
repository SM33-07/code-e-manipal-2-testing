"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl bg-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black p-2 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="LearnIT Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">
                LearnIT Admin Dashboard
              </h1>
              <p className="text-sm text-white/60">
                Hackathon Control Center
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
