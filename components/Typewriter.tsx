"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  pauseDuration?: number;
}

export function TypewriterText({
  texts,
  className = "",
  speed = 60,
  pauseDuration = 2200,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    cursorRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => {
      if (cursorRef.current) clearInterval(cursorRef.current);
    };
  }, []);

  useEffect(() => {
    const currentText = texts[textIndex];

    const tick = () => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
          timeoutRef.current = setTimeout(tick, speed);
        } else {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.slice(0, displayText.length - 1));
          timeoutRef.current = setTimeout(tick, speed / 2);
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, isDeleting, textIndex, texts, speed, pauseDuration]);

  return (
    <span className={className}>
      {displayText}
      <span
        style={{
          opacity: showCursor ? 1 : 0,
          color: "#60a5fa",
          fontWeight: 300,
          marginLeft: "2px",
          transition: "opacity 0.1s",
        }}
      >
        |
      </span>
    </span>
  );
}
