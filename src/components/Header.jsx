import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  Shield, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { api } from '../services/api';

export default function Header({ onOpenLogin, onOpenSettings }) {
  const { isAdmin, logout, teamMemberName } = useAuth();
  const { refreshing, loadData, config } = useEvents();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isConnected = api.isConfigured();

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between relative">
        {/* Left: Interactive Brand / Logo Trigger */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 p-1 -ml-1 rounded-[6px] hover:bg-[#F6F6F7] active:bg-[#E5E7EB] transition-colors text-left group"
            aria-expanded={isMenuOpen}
            aria-label="Menu Aplikasi"
          >
            {/* Brand Logo (favicon.svg) */}
            <div className="w-8 h-8 rounded-[6px] bg-[#F6821F] flex items-center justify-center shrink-0 shadow-cf-card p-1">
              <img src="/favicon.svg" alt="Bakid Multimedia Logo" className="w-full h-full object-contain" />
            </div>

            {/* Brand Titles */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h1 className="text-[14px] sm:text-[15px] font-semibold text-[#0B0C0E] leading-tight">
                  Bakid Multimedia
                </h1>
                <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-150 ${isMenuOpen ? 'rotate-180 text-[#F6821F]' : ''}`} />
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Jadwal Acara & Liputan
              </p>
            </div>
          </button>

          {/* Cloudflare-style Menu Popup */}
          {isMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E5E7EB] rounded-[8px] shadow-cf-dropdown overflow-hidden z-50 animate-cf-modal">
              {/* Menu Header: User Status */}
              <div className="p-3 bg-[#F6F6F7] border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6B7280]">
                    Status Pengguna
                  </span>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DB6E0F] bg-[#FFF5EA] border border-[#FBD6B0] px-1.5 py-0.5 rounded-[4px]">
                      <Shield className="w-3 h-3 text-[#F6821F]" /> Mode Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded-[4px]">
                      <User className="w-3 h-3 text-[#9CA3AF]" /> Mode Tim
                    </span>
                  )}
                </div>
                {teamMemberName && (
                  <p className="text-[12px] font-medium text-[#0B0C0E] mt-1.5 truncate">
                    👤 Profil: {teamMemberName}
                  </p>
                )}
              </div>

              {/* Menu Options */}
              <div className="p-1.5 space-y-0.5 text-[13px]">
                {/* Segarkan Data */}
                <button
                  type="button"
                  onClick={() => {
                    loadData(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-[4px] text-left text-[#0B0C0E] hover:bg-[#F6F6F7] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 text-[#6B7280] ${refreshing ? 'animate-spin text-[#F6821F]' : ''}`} />
                    <span>Segarkan Data</span>
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">Sync</span>
                </button>

                {/* Pengaturan Aplikasi (Admin Only / Settings Modal) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-[4px] text-left text-[#0B0C0E] hover:bg-[#F6F6F7] flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Pengaturan Aplikasi</span>
                  </button>
                )}

                {/* Personalisasi / Login Admin */}
                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-[4px] text-left text-[#0B0C0E] hover:bg-[#F6F6F7] flex items-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#F6821F]" />
                    <span>Masuk Admin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-[4px] text-left text-[#0B0C0E] hover:bg-[#F6F6F7] flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Profil Tim</span>
                  </button>
                )}

                {/* Link WhatsApp Group jika ada */}
                {config?.whatsapp_group_link && (
                  <a
                    href={config.whatsapp_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-2.5 py-2 rounded-[4px] text-left text-[#0B0C0E] hover:bg-[#F6F6F7] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0F9D58]" />
                      <span>Grup WhatsApp Tim</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
                  </a>
                )}
              </div>

              {/* Backend Status Footer */}
              <div className="px-3 py-2 bg-[#F6F6F7] border-t border-[#E5E7EB] text-[11px] text-[#6B7280] flex items-center justify-between">
                <span>Database:</span>
                <span className="font-medium text-[#0B0C0E] flex items-center gap-1">
                  <CheckCircle2 className={`w-3 h-3 ${isConnected ? 'text-[#0F9D58]' : 'text-[#F6821F]'}`} />
                  {isConnected ? 'Google Sheets' : 'Local Storage'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Retained Clean Logout Button / Mode Trigger */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={logout}
              title="Keluar dari Admin"
              aria-label="Keluar dari Admin"
              className="h-8 px-3 bg-white hover:bg-[#FDF1F2] text-[#E5484D] hover:text-[#B9252A] border border-[#FBD2D5] rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-cf-card"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          ) : (
            <button
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
