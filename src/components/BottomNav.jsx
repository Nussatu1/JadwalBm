import React from 'react';
import { Calendar, ListFilter, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] py-1 max-w-lg mx-auto sm:border-x sm:rounded-t-[8px]">
      <div className="flex items-center justify-around h-14">
        {/* Tab 1: Daftar Acara */}
        <button
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

        {/* Tab 2: Kalender */}
        <button
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

        {/* Tab 3: Tambah Acara (Admin Only) */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('tambah')}
            className={`flex-1 h-full flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
              activeTab === 'tambah'
                ? 'text-[#F6821F]'
                : 'text-[#6B7280] hover:text-[#0B0C0E]'
            }`}
            title="Tambah Acara"
          >
            <Plus className="w-5 h-5 stroke-[1.75]" />
            <span className={`text-[11px] mt-1 ${activeTab === 'tambah' ? 'font-medium' : 'font-normal'}`}>
              Tambah
            </span>
          </button>
        )}

        {/* Tab 4: Anggota */}
        <button
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
      </div>
    </nav>
  );
}
