import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import Modal from './ui/Modal';

export default function LoginModal({ isOpen, onClose }) {
  const { loginAdmin, authLoading, teamMemberName, setPersonalName } = useAuth();
  const { showToast, anggota } = useEvents();

  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'tim'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState(teamMemberName || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Silakan masukkan password admin');
      return;
    }

    const res = await loginAdmin(password);
    if (res.success) {
      showToast('Berhasil masuk sebagai Admin!', 'success');
      setPassword('');
      onClose();
    } else {
      setErrorMsg(res.message || 'Password salah');
    }
  };

  const handleSaveTeamName = (e) => {
    e.preventDefault();
    setPersonalName(customName.trim());
    showToast(
      customName.trim()
        ? `Profil diset sebagai "${customName.trim()}".`
        : 'Nama profil direset.',
      'info'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Akses Pengguna"
      maxWidth="max-w-sm"
    >
      <div className="space-y-3 -mt-2">
        {/* Tab Selector */}
        <div className="flex border border-[#E5E7EB] bg-[#F6F6F7] p-1 rounded-[6px] gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-[#0B0C0E] shadow-cf-card border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#0B0C0E]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('tim'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'tim'
                ? 'bg-white text-[#0B0C0E] shadow-cf-card border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#0B0C0E]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personalisasi Tim</span>
          </button>
        </div>

        {activeTab === 'admin' ? (
          <form onSubmit={handleAdminLogin} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
                Password Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Masukkan password admin..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-9 pl-3 pr-9 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 bg-[#FDF1F2] border border-[#FBD2D5] text-[#B9252A] text-[12px] rounded-[6px]">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-9 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[13px] font-medium rounded-[6px] transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveTeamName} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
                Nama Anda (Anggota Tim)
              </label>
              <input
                type="text"
                list="cf-member-name-suggestions"
                placeholder="Pilih atau ketik nama Anda..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
              />
              <datalist id="cf-member-name-suggestions">
                {anggota.map(a => (
                  <option key={a.id} value={a.nama} />
                ))}
              </datalist>
              <p className="text-[11px] text-[#6B7280] mt-1.5">
                Nama profil tim Anda.
              </p>
            </div>

            <div className="flex gap-2">
              {customName && (
                <button
                  type="button"
                  onClick={() => { setCustomName(''); setPersonalName(''); }}
                  className="h-9 px-3 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] text-[12px] font-medium rounded-[6px]"
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="flex-1 h-9 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[13px] font-medium rounded-[6px] transition-colors"
              >
                Simpan Profil Tim
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
