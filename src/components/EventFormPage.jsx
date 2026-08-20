import React, { useState, useEffect } from 'react';
import { PlusCircle, ArrowLeft, Video, Users, Check, X } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import Select from './ui/Select';
import DatePicker from './ui/DatePicker';
import TimePicker from './ui/TimePicker';

const PRESET_CATEGORIES = ['Liputan', 'Pengajian', 'Wisuda', 'Kajian', 'Rapat', 'Dokumentasi', 'Lainnya'];

const STATUS_OPTIONS = [
  { value: 'Terjadwal', label: 'Terjadwal' },
  { value: 'Berlangsung', label: 'Berlangsung' },
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Batal', label: 'Batal' }
];

export default function EventFormPage({ initialData = null, onCancel, onSuccess }) {
  const { anggota, peralatan, createEvent, updateEvent, showToast } = useEvents();


  const [formData, setFormData] = useState({
    nama_acara: '',
    kategori: 'Liputan',
    tanggal: new Date().toISOString().split('T')[0],
    jam_mulai: '08:00',
    jam_selesai: '11:00',
    lokasi_nama: '',
    lokasi_url: '',
    deskripsi: '',
    anggota_diutus: '',
    alat_media: '',
    status: 'Terjadwal',
    link_dokumentasi: ''
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [manualMemberInput, setManualMemberInput] = useState('');
  const [mediaTags, setMediaTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_acara: initialData.nama_acara || '',
        kategori: initialData.kategori || 'Liputan',
        tanggal: initialData.tanggal || new Date().toISOString().split('T')[0],
        jam_mulai: initialData.jam_mulai || '',
        jam_selesai: initialData.jam_selesai || '',
        lokasi_nama: initialData.lokasi_nama || '',
        lokasi_url: initialData.lokasi_url || '',
        deskripsi: initialData.deskripsi || '',
        anggota_diutus: initialData.anggota_diutus || '',
        alat_media: initialData.alat_media || '',
        status: initialData.status || 'Terjadwal',
        link_dokumentasi: initialData.link_dokumentasi || ''
      });

      const members = initialData.anggota_diutus
        ? initialData.anggota_diutus.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      setSelectedMembers(members);

      const gears = initialData.alat_media
        ? initialData.alat_media.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      setMediaTags(gears);
    } else {
      setFormData({
        nama_acara: '',
        kategori: 'Liputan',
        tanggal: new Date().toISOString().split('T')[0],
        jam_mulai: '08:00',
        jam_selesai: '11:00',
        lokasi_nama: '',
        lokasi_url: '',
        deskripsi: '',
        anggota_diutus: '',
        alat_media: '',
        status: 'Terjadwal',
        link_dokumentasi: ''
      });
      setSelectedMembers([]);
      setMediaTags([]);
    }
    setErrorMessage('');
  }, [initialData]);

  const toggleMasterMember = (name) => {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(selectedMembers.filter(m => m !== name));
    } else {
      setSelectedMembers([...selectedMembers, name]);
    }
  };

  const addManualMember = () => {
    if (manualMemberInput.trim() && !selectedMembers.includes(manualMemberInput.trim())) {
      setSelectedMembers([...selectedMembers, manualMemberInput.trim()]);
      setManualMemberInput('');
    }
  };

  const removeMember = (name) => {
    setSelectedMembers(selectedMembers.filter(m => m !== name));
  };

  const addMediaTag = (gear) => {
    if (gear && !mediaTags.includes(gear)) {
      setMediaTags([...mediaTags, gear]);
    }
  };

  const removeMediaTag = (gear) => {
    setMediaTags(mediaTags.filter(g => g !== gear));
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customTagInput.trim()) {
        addMediaTag(customTagInput.trim());
        setCustomTagInput('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nama_acara.trim()) {
      setErrorMessage('Nama acara wajib diisi!');
      showToast('Nama acara wajib diisi!', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      anggota_diutus: selectedMembers.join(', '),
      alat_media: mediaTags.join(', ')
    };

    let res;
    if (initialData?.id) {
      res = await updateEvent(initialData.id, payload);
    } else {
      res = await createEvent(payload);
    }

    setSubmitting(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-cf-card overflow-hidden">
      {/* Page Header */}
      <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Kembali"
              className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[6px] border border-[#E5E7EB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-[16px] font-semibold text-[#0B0C0E] leading-tight flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#F6821F]" />
              <span>{initialData ? 'Edit Jadwal Acara' : 'Tambah Acara Baru'}</span>
            </h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Isi detail form agenda liputan Bakid Multimedia
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-[13px]">
        {errorMessage && (
          <div className="p-2.5 bg-[#FDF1F2] border border-[#FBD2D5] text-[#B9252A] text-[12px] rounded-[6px]">
            {errorMessage}
          </div>
        )}

        {/* 1. Nama Acara */}
        <div>
          <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
            Nama Acara / Agenda <span className="text-[#E5484D]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Pengajian Akbar & Haflah Ikhtitam"
            value={formData.nama_acara}
            onChange={e => setFormData({ ...formData, nama_acara: e.target.value })}
            className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
          />
        </div>

        {/* 2. Kategori & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
              Kategori
            </label>
            <input
              type="text"
              list="cf-category-page-suggestions"
              placeholder="Misal: Liputan, Pengajian, Wisuda"
              value={formData.kategori}
              onChange={e => setFormData({ ...formData, kategori: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
            <datalist id="cf-category-page-suggestions">
              {PRESET_CATEGORIES.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <Select
              label="Status Acara"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {/* 3. DatePicker & TimePicker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <DatePicker
              label="Tanggal"
              required
              value={formData.tanggal}
              onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
            />
          </div>

          <div>
            <TimePicker
              label="Jam Mulai"
              value={formData.jam_mulai}
              onChange={e => setFormData({ ...formData, jam_mulai: e.target.value })}
            />
          </div>

          <div>
            <TimePicker
              label="Jam Selesai"
              value={formData.jam_selesai}
              onChange={e => setFormData({ ...formData, jam_selesai: e.target.value })}
            />
          </div>
        </div>

        {/* 4. Lokasi & Maps */}
        <div className="space-y-2">
          <div>
            <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
              Nama Lokasi / Tempat
            </label>
            <input
              type="text"
              placeholder="Contoh: Aula Utama Ponpes Miftahul Ulum Bakid"
              value={formData.lokasi_nama}
              onChange={e => setFormData({ ...formData, lokasi_nama: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
              Link Google Maps (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/?q=..."
              value={formData.lokasi_url}
              onChange={e => setFormData({ ...formData, lokasi_url: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[12px] font-mono focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
            />
          </div>
        </div>

        {/* 5. Penugasan Anggota Tim */}
        <div className="border border-[#E5E7EB] rounded-[6px] p-3 bg-[#F6F6F7]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-semibold text-[#0B0C0E] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2E7DD1]" />
              <span>Petugas Tim yang Diutus</span>
            </label>
            <span className="text-[11px] text-[#6B7280]">
              {selectedMembers.length} dipilih
            </span>
          </div>

          {anggota.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-[6px] border border-[#E5E7EB] mb-2">
              {anggota.map(a => {
                const isChecked = selectedMembers.includes(a.nama);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleMasterMember(a.nama)}
                    className={`text-left text-[12px] px-2 py-1 rounded-[4px] border transition-colors flex items-center justify-between gap-1 ${
                      isChecked
                        ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-medium'
                        : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F6F6F7]'
                    }`}
                  >
                    <span className="truncate">{a.nama}</span>
                    {isChecked && <Check className="w-3 h-3 text-[#F6821F] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Atau ketik nama anggota manual..."
              value={manualMemberInput}
              onChange={e => setManualMemberInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addManualMember();
                }
              }}
              className="flex-1 h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-[6px] text-[12px] focus:outline-none focus:border-[#F6821F]"
            />
            <button
              type="button"
              onClick={addManualMember}
              className="h-8 px-3 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] rounded-[6px] text-[12px] font-medium transition-colors"
            >
              + Tambah
            </button>
          </div>

          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[#E5E7EB]">
              {selectedMembers.map(name => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-white text-[#0B0C0E] border border-[#E5E7EB]"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeMember(name)}
                    className="text-[#6B7280] hover:text-[#0B0C0E]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 6. Alat Media */}
        <div className="border border-[#E5E7EB] rounded-[6px] p-3 bg-[#F6F6F7]">
          <label className="block text-[12px] font-semibold text-[#0B0C0E] mb-1.5 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>Peralatan / Media Gear</span>
          </label>

          <div className="flex flex-wrap gap-1 mb-2">
            {peralatan.map(item => (
              <button
                type="button"
                key={item.id || item.nama}
                onClick={() => addMediaTag(item.nama)}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] border font-medium transition-colors ${
                  mediaTags.includes(item.nama)
                    ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F]'
                    : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F6F6F7]'
                }`}
              >
                + {item.nama}
              </button>
            ))}
          </div>


          <input
            type="text"
            placeholder="Ketik alat lain lalu tekan Enter..."
            value={customTagInput}
            onChange={e => setCustomTagInput(e.target.value)}
            onKeyDown={handleCustomTagKeyDown}
            className="w-full h-8 px-2.5 bg-white border border-[#E5E7EB] rounded-[6px] text-[12px] focus:outline-none focus:border-[#F6821F]"
          />

          {mediaTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[#E5E7EB]">
              {mediaTags.map(gear => (
                <span
                  key={gear}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-white text-[#0B0C0E] border border-[#E5E7EB]"
                >
                  {gear}
                  <button
                    type="button"
                    onClick={() => removeMediaTag(gear)}
                    className="text-[#6B7280] hover:text-[#0B0C0E]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 7. Deskripsi */}
        <div>
          <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
            Deskripsi / Brief Tugas
          </label>
          <textarea
            rows={3}
            placeholder="Instruksi rundown singkat, output video/foto..."
            value={formData.deskripsi}
            onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
            className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[13px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F] leading-relaxed"
          />
        </div>

        {/* 8. Link Dokumentasi */}
        <div>
          <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
            Link Dokumentasi / Google Drive (Opsional)
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={formData.link_dokumentasi}
            onChange={e => setFormData({ ...formData, link_dokumentasi: e.target.value })}
            className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[#0B0C0E] text-[12px] font-mono focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] font-medium rounded-[6px] text-[12px] transition-colors"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-5 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white font-medium rounded-[6px] text-[12px] transition-colors disabled:opacity-50 shadow-cf-card"
          >
            {submitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Buat Acara'}
          </button>
        </div>
      </form>
    </div>
  );
}
