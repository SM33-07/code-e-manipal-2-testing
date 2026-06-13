import React from "react";

interface DividerProps {
  className?: string;
  strokeColor?: string;
  goldColor?: string;
}

export function OrnamentalDivider({ className, strokeColor = "#EBCFB5", goldColor = "#D59B3D" }: DividerProps) {
  return (
    <svg viewBox="0 0 120 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: 120, height: 14, display: "block" }}>
      <line x1="0" y1="7" x2="50" y2="7" stroke={strokeColor} strokeWidth="1" />
      <polygon points="60,1 66,7 60,13 54,7" fill={goldColor} />
      <line x1="70" y1="7" x2="120" y2="7" stroke={strokeColor} strokeWidth="1" />
    </svg>
  );
}

export function WideDivider({ className, strokeColor = "#EBCFB5", goldColor = "#D59B3D" }: DividerProps) {
  return (
    <svg viewBox="0 0 400 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: "100%", height: 14, display: "block" }}>
      <line x1="0" y1="7" x2="185" y2="7" stroke={strokeColor} strokeWidth="1" />
      <polygon points="200,1 206,7 200,13 194,7" fill={goldColor} />
      <line x1="215" y1="7" x2="400" y2="7" stroke={strokeColor} strokeWidth="1" />
    </svg>
  );
}

interface MandalaProps {
  className?: string;
  size?: number;
  color?: string;
}

export function MandalaWatermark({ className, size = 180, color = "#8F102A" }: MandalaProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
        <circle cx="60" cy="60" r="58" stroke={color} strokeWidth="1.2"/>
        <circle cx="60" cy="60" r="44" stroke={color} strokeWidth="1"/>
        <circle cx="60" cy="60" r="30" stroke={color} strokeWidth="1"/>
        <circle cx="60" cy="60" r="16" stroke={color} strokeWidth="1"/>
        {[0, 30, 45, 60, 90, 120, 135, 150].map(a => (
          <line key={a}
            x1={60 + 58 * Math.cos(a * Math.PI / 180)} y1={60 + 58 * Math.sin(a * Math.PI / 180)}
            x2={60 - 58 * Math.cos(a * Math.PI / 180)} y2={60 - 58 * Math.sin(a * Math.PI / 180)}
            stroke={color} strokeWidth="0.5"
          />
        ))}
        <circle cx="60" cy="16" r="2" fill={color} />
        <circle cx="60" cy="104" r="2" fill={color} />
        <circle cx="16" cy="60" r="2" fill={color} />
        <circle cx="104" cy="60" r="2" fill={color} />
      </svg>
    </div>
  );
}

interface CornerProps {
  className?: string;
  color?: string;
  size?: number;
}

export function CornerOrnament({ className, color = "#D59B3D", size = 20 }: CornerProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
      <path d="M24 1H1V24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function JharokhaDivider({ className, strokeColor = "#DFCDBD", goldColor = "#D59B3D" }: DividerProps) {
  return (
    <svg viewBox="0 0 160 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: 160, height: 20, display: "block" }}>
      <path d="M0,15 C20,15 25,5 40,5 C55,5 60,15 80,15 C100,15 105,5 120,5 C135,5 140,15 160,15" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
      <polygon points="80,2 84,7 80,12 76,7" fill={goldColor} />
    </svg>
  );
}

