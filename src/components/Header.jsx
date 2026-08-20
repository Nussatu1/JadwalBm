import React from 'react';
import { 
  User, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenLogin }) {
  const { isAdmin, logout, teamMemberName } = useAuth();

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          {/* Official Logo (favicon.svg) */}
          <div className="w-8 h-8 rounded-[6px] bg-[#F6821F] flex items-center justify-center shrink-0 shadow-cf-card p-1">
            <img src="/favicon.svg" alt="Bakid Multimedia Logo" className="w-full h-full object-contain" />
          </div>

          {/* Brand Titles */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[14px] sm:text-[15px] font-semibold text-[#0B0C0E] leading-tight">
                Bakid Multimedia
              </h1>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-[#DB6E0F] bg-[#FFF5EA] border border-[#FBD6B0] px-1.5 py-0.2 rounded">
                  <ShieldCheck className="w-3 h-3 text-[#F6821F]" /> Admin
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Jadwal Acara & Liputan
            </p>
          </div>
        </div>

        {/* Right: Quick User Profile / Logout Button */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              type="button"
              onClick={logout}
              title="Keluar dari Admin"
              aria-label="Keluar dari Admin"
              className="h-8 px-3 bg-white hover:bg-[#FDF1F2] text-[#E5484D] hover:text-[#B9252A] border border-[#FBD2D5] rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-cf-card"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="h-8 px-3 bg-white hover:bg-[#F6F6F7] text-[#0B0C0E] border border-[#E5E7EB] rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>{teamMemberName ? teamMemberName.split(' ')[0] : 'Masuk'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
