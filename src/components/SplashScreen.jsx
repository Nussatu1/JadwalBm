import React, { useState, useEffect } from 'react';

/**
 * Premium SplashScreen / Opening Animation for Bakid Multimedia
 * Background: Brand Primary Color (#F6821F)
 * Direct vector logo from /favicon.svg without surrounding card container
 */
export default function SplashScreen({ onFinish, duration = 2000 }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out slightly before finish
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div
      onClick={() => {
        setFadeOut(true);
        setTimeout(() => {
          setVisible(false);
          if (onFinish) onFinish();
        }, 200);
      }}
      className={`fixed inset-0 z-50 bg-[#F6821F] bg-gradient-to-b from-[#F6821F] to-[#DB6E0F] text-white flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-400 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Radial Light */}
      <div className="absolute w-80 h-80 rounded-full bg-white/10 blur-[90px] pointer-events-none animate-pulse" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-4 animate-cf-modal">
        {/* Direct Vector Icon without Card */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <img
            src="/favicon.svg"
            alt="Bakid Multimedia Logo"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        {/* Brand Typography */}
        <div className="space-y-1">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-white font-sans drop-shadow-xs">
            Bakid Multimedia
          </h1>
          <p className="text-[12px] sm:text-[13px] font-medium text-white/85 tracking-wide">
            Jadwal Acara & Liputan Tim
          </p>
        </div>

        {/* Minimalist White Loading Bar */}
        <div className="w-36 h-1 bg-black/15 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-white rounded-full animate-loading-bar" />
        </div>

        {/* Tap to skip hint */}
        <p className="text-[10px] text-white/60 tracking-wider uppercase pt-2">
          Ketuk untuk melewati
        </p>
      </div>
    </div>
  );
}
