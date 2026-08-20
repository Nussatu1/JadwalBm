import React from 'react';
import { Calendar, ListFilter, Plus, Users, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] py-1 max-w-lg mx-auto sm:border-x sm:rounded-t-[8px]">
      <div className="flex items-center justify-around h-14 relative px-1">
        {/* Tab 1: Kalender */}
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 h-full flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
            activeTab === 'calendar'
              ? 'text-[#F6821F]'
              : 'text-[#6B7280] hover:text-[#0B0C0E]'
          }`}
        >
          <Calendar className="w-5 h-5 stroke-[1.75]" />
          <span className={`text-[11px] mt-1 ${activeTab === 'calendar' ? 'font-medium' : 'font-normal'}`}>
            Kalender
          </span>
        </button>

        {/* Tab 2: Daftar Acara */}
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex-1 h-full flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
            activeTab === 'list'
              ? 'text-[#F6821F]'
              : 'text-[#6B7280] hover:text-[#0B0C0E]'
          }`}
        >
          <ListFilter className="w-5 h-5 stroke-[1.75]" />
          <span className={`text-[11px] mt-1 ${activeTab === 'list' ? 'font-medium' : 'font-normal'}`}>
            Daftar
          </span>
        </button>

        {/* Tab 3: FAB Tambah Acara (Admin Only - Elevated Floating Circle tanpa label) */}
        {isAdmin && (
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('tambah')}
              className={`w-12 h-12 rounded-full flex items-center justify-center -translate-y-3 border-4 border-white shadow-lg transition-all duration-200 ${
                activeTab === 'tambah'
                  ? 'bg-[#0B0C0E] text-white scale-105 ring-2 ring-[#F6821F]'
                  : 'bg-[#F6821F] hover:bg-[#DB6E0F] active:scale-95 text-white shadow-[#F6821F]/35'
              }`}
              title="Tambah Acara Baru"
              aria-label="Tambah Acara Baru"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Tab 4: Anggota */}
        <button
          type="button"
          onClick={() => setActiveTab('anggota')}
          className={`flex-1 h-full flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
            activeTab === 'anggota'
              ? 'text-[#F6821F]'
              : 'text-[#6B7280] hover:text-[#0B0C0E]'
          }`}
        >
          <Users className="w-5 h-5 stroke-[1.75]" />
          <span className={`text-[11px] mt-1 ${activeTab === 'anggota' ? 'font-medium' : 'font-normal'}`}>
            Anggota
          </span>
        </button>

        {/* Tab 5: Pengaturan */}
        <button
          type="button"
          onClick={() => setActiveTab('pengaturan')}
          className={`flex-1 h-full flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
            activeTab === 'pengaturan'
              ? 'text-[#F6821F]'
              : 'text-[#6B7280] hover:text-[#0B0C0E]'
          }`}
          title="Pengaturan"
        >
          <Settings className="w-5 h-5 stroke-[1.75]" />
          <span className={`text-[11px] mt-1 ${activeTab === 'pengaturan' ? 'font-medium' : 'font-normal'}`}>
            Pengaturan
          </span>
        </button>
      </div>
    </nav>
  );
}
