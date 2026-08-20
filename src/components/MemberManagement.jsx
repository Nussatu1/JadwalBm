import React, { useState } from 'react';
import { Users, UserPlus, Edit2, Trash2, CheckCircle2, XCircle, Search, SearchX, RotateCcw } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import Checkbox from './ui/Checkbox';

export default function MemberManagement() {
  const { anggota, createAnggota, updateAnggota, deleteAnggota, showToast } = useEvents();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    peran: 'Videografer',
    aktif: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete state
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredAnggota = anggota.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.nama || '').toLowerCase().includes(q) ||
      (a.peran || '').toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nama: '', peran: 'Videografer', aktif: true });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      peran: item.peran || '',
      aktif: item.aktif !== false
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showToast('Nama anggota wajib diisi!', 'error');
      return;
    }

    setSubmitting(true);
    let res;
    if (editingId) {
      res = await updateAnggota(editingId, formData);
    } else {
      res = await createAnggota(formData);
    }
    setSubmitting(false);

    if (res.success) {
      setIsFormOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteAnggota(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Card */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 shadow-cf-card">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0B0C0E] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F6821F]" />
              <span>Master Data Anggota</span>
            </h2>
            <p className="text-[12px] text-[#6B7280]">
              Daftar anggota tim Bakid Multimedia
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="h-8 px-3 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[12px] font-medium rounded-[6px] flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau peran anggota..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
          />
        </div>
      </div>

      {/* Member List (Minimalist Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {filteredAnggota.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-[6px] border border-[#E5E7EB] px-3 py-2 hover:border-[#D1D5DB] transition-all flex items-center justify-between gap-2.5 shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Initials Avatar */}
              <div className="w-7 h-7 rounded-full bg-[#F6F6F7] border border-[#E5E7EB] text-[#374151] font-semibold flex items-center justify-center text-[10.5px] shrink-0">
                {item.nama.slice(0, 2).toUpperCase()}
              </div>

              {/* Name & Role */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[12.5px] font-semibold text-[#0B0C0E] truncate leading-tight">
                    {item.nama}
                  </h3>
                  {/* Status Indicator Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.aktif !== false ? 'bg-[#0F9D58]' : 'bg-[#9CA3AF]'
                    }`}
                    title={item.aktif !== false ? 'Status: Aktif' : 'Status: Nonaktif'}
                  />
                </div>
                <p className="text-[11px] text-[#6B7280] truncate leading-tight mt-0.5">
                  {item.peran || 'Multimedia'}
                </p>
              </div>
            </div>

            {/* Actions (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  title="Edit Anggota"
                  aria-label="Edit Anggota"
                  className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[4px] transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  title="Hapus Anggota"
                  aria-label="Hapus Anggota"
                  className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#E5484D] hover:bg-[#FDF1F2] rounded-[4px] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAnggota.length === 0 && (
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 text-center space-y-3 shadow-cf-card">
          {search ? (
            <>
              <div className="w-11 h-11 rounded-full bg-[#FFF5EA] border border-[#FBD6B0] text-[#F6821F] flex items-center justify-center mx-auto shadow-sm">
                <SearchX className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-[#0B0C0E] text-[14px]">
                  Anggota Tidak Ditemukan
                </h3>
                <p className="text-[12px] text-[#6B7280] max-w-xs mx-auto">
                  Tidak ada anggota yang cocok dengan kata kunci <span className="font-semibold text-[#0B0C0E]">"{search}"</span>.
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-[#F6F6F7] text-[#0B0C0E] border border-[#E5E7EB] text-[12px] font-medium rounded-[6px] transition-colors shadow-cf-card"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Reset Pencarian</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-[#F6F6F7] border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center mx-auto shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-[#0B0C0E] text-[14px]">
                  Belum Ada Data Anggota
                </h3>
                <p className="text-[12px] text-[#6B7280]">
                  Daftar anggota tim multimedia belum ditambahkan ke sistem.
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#F6821F] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#DB6E0F] transition-colors shadow-cf-card"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota Baru</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Add / Edit Member Modal (Custom Modal) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ahmad Fauzi"
              value={formData.nama}
              onChange={e => setFormData({ ...formData, nama: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
              Peran / Posisi
            </label>
            <input
              type="text"
              placeholder="Misal: Videografer, Editor, Fotografer, Drone"
              value={formData.peran}
              onChange={e => setFormData({ ...formData, peran: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
          </div>

          <div className="pt-1">
            <Checkbox
              id="memberAktifStatus"
              checked={formData.aktif}
              onChange={e => setFormData({ ...formData, aktif: e.target.checked })}
              label="Status Aktif"
              description="Anggota ditampilkan dalam daftar pilihan penugasan acara"
            />
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="h-8 px-3.5 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] font-medium rounded-[6px] text-[12px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-4 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white font-medium rounded-[6px] text-[12px] disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Anggota Tim?"
        message={`Yakin ingin menghapus "${itemToDelete?.nama}" dari daftar master anggota?`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
