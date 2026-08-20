import React, { useState } from 'react';
import { MessageSquare, Key, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { api } from '../services/api';
import { sha256 } from '../utils/crypto';
import Modal from './ui/Modal';

export default function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig, showToast } = useEvents();

  const [waLink, setWaLink] = useState(config?.whatsapp_group_link || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok!', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      whatsapp_group_link: waLink
    };

    if (newPassword) {
      payload.new_password = newPassword;
      payload.new_password_hash = await sha256(newPassword);
    }

    const res = await updateConfig(payload);
    setSubmitting(false);

    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  const isConnectedToGas = api.isConfigured();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Aplikasi"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Status Koneksi Backend */}
        <div className="p-3 rounded-[6px] border bg-[#F6F6F7] border-[#E5E7EB]">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#0B0C0E] mb-1">
            {isConnectedToGas ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#F6821F] shrink-0" />
            )}
            <span>Status Koneksi Backend</span>
          </div>
          <p className="text-[12px] text-[#6B7280]">
            {isConnectedToGas
              ? 'Terhubung dengan Google Apps Script & Google Sheets.'
              : 'Mode Demo / Offline (Local Storage). Hubungkan URL Apps Script di .env untuk live database.'}
          </p>
        </div>

        {/* 1. Link Grup WA */}
        <div>
          <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>Link Grup WhatsApp Bakid Multimedia</span>
          </label>
          <input
            type="url"
            placeholder="https://chat.whatsapp.com/..."
            value={waLink}
            onChange={e => setWaLink(e.target.value)}
            className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[12px] font-mono text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
          />
          <p className="text-[11px] text-[#6B7280] mt-1">
            Link tujuan untuk membagikan broadcast agenda ke grup WA tim.
          </p>
        </div>

        {/* 2. Ganti Password Admin */}
        <div className="pt-3 border-t border-[#E5E7EB] space-y-2.5">
          <label className="block text-[12px] font-medium text-[#0B0C0E] flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#F6821F]" />
            <span>Ganti Password Admin (Opsional)</span>
          </label>

          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Password baru (kosongkan jika tidak diubah)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full h-9 pl-3 pr-9 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] transition-colors p-1"
              aria-label={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {newPassword && (
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full h-9 pl-3 pr-9 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] transition-colors p-1"
                aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] font-medium rounded-[6px] text-[12px]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-8 px-4 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white font-medium rounded-[6px] text-[12px] flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
