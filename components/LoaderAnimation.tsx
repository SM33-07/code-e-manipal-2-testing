"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoaderAnimationProps {
  onComplete: () => void;
}

export default function LoaderAnimation({ onComplete }: LoaderAnimationProps) {
  useEffect(() => {
    // Immediately complete without artificial delay
    const timer = setTimeout(() => {
      onComplete();
    }, 50);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background text-foreground transition-opacity duration-200">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-primary size-8" />
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Loading Code-e-Manipal...
        </span>
      </div>
    </div>
  );
}
