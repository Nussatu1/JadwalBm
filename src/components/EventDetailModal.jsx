import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Send, 
  Edit3, 
  Trash2, 
  Ban, 
  CheckCircle,
  ExternalLink,
  FileText,
  AlignLeft
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import { formatTanggalIndo, formatJam } from '../utils/dateUtils';
import { shareToWhatsApp } from '../utils/waFormatter';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';

export default function EventDetailModal({ isOpen, onClose, event, onEdit }) {
  const { isAdmin } = useAuth();
  const { config, deleteEvent, cancelEvent, completeEvent } = useEvents();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (!isOpen || !event) return null;

  const anggotaList = event.anggota_diutus
    ? event.anggota_diutus.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const alatList = event.alat_media
    ? event.alat_media.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleConfirmDelete = () => {
    deleteEvent(event.id);
    onClose();
  };

  const handleConfirmCancel = () => {
    cancelEvent(event.id);
  };

  const handleEdit = () => {
    onClose();
    onEdit(event);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-md"
        title={
          <div className="flex items-center gap-1.5">
            <StatusBadge status={event.status} />
            {event.kategori && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-[#6B7280] bg-[#F6F6F7] border border-[#E5E7EB]">
                {event.kategori}
              </span>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* 1. Main Event Title */}
          <div>
            <h2 className="text-[17px] font-semibold text-[#0B0C0E] leading-snug">
              {event.nama_acara}
            </h2>
          </div>

          {/* 2. Key Metadata Card: Waktu & Lokasi */}
          <div className="p-3 bg-[#F6F6F7] border border-[#E5E7EB] rounded-[6px] space-y-2">
            {/* Waktu & Tanggal */}
            <div className="flex items-start gap-2 text-[#0B0C0E]">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#0B0C0E] leading-tight">
                  {formatTanggalIndo(event.tanggal)}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  {formatJam(event.jam_mulai, event.jam_selesai)}
                </p>
              </div>
            </div>

            {/* Garis pemisah tipis jika ada lokasi */}
            {event.lokasi_nama && <div className="border-t border-[#E5E7EB] pt-2" />}

            {/* Lokasi & Google Maps */}
            {event.lokasi_nama && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E5484D] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#0B0C0E] leading-tight">
                      {event.lokasi_nama}
                    </p>
                  </div>
                </div>

                {event.lokasi_url && (
                  <a
                    href={event.lokasi_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#F6821F] hover:underline font-medium shrink-0 pt-0.5"
                  >
                    Maps <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 3. Petugas Tim */}
          {anggotaList.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                <Users className="w-3 h-3" />
                <span>Petugas Tim ({anggotaList.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {anggotaList.map((nama, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-white text-[#0B0C0E] border border-[#E5E7EB]"
                  >
                    {nama}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 4. Peralatan / Media Gear */}
          {alatList.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                <Video className="w-3 h-3" />
                <span>Peralatan / Gear</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {alatList.map((alat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-white text-[#0B0C0E] border border-[#E5E7EB]"
                  >
                    {alat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Deskripsi & Brief Tugas */}
          {event.deskripsi && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                <AlignLeft className="w-3 h-3" />
                <span>Brief Tugas</span>
              </div>
              <div className="p-2.5 bg-[#F6F6F7] rounded-[6px] border border-[#E5E7EB] text-[12px] text-[#374151] leading-relaxed whitespace-pre-line">
                {event.deskripsi}
              </div>
            </div>
          )}

          {/* 6. Link Dokumentasi */}
          {event.link_dokumentasi && (
            <div className="p-2.5 bg-white border border-[#E5E7EB] rounded-[6px] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#0B0C0E] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2E7DD1]" /> Dokumentasi Acara
              </span>
              <a
                href={event.link_dokumentasi}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#2E7DD1] hover:underline font-medium inline-flex items-center gap-1"
              >
                Buka <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2 flex-wrap">
            {/* WhatsApp Share Button */}
            <button
              onClick={() => shareToWhatsApp(event, config?.whatsapp_group_link)}
              className="h-8 px-3.5 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[12px] font-medium rounded-[6px] flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bagikan WA</span>
            </button>

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                {/* Tombol Cepat Tandai Selesai */}
                {event.status !== 'Selesai' && event.status !== 'Batal' && (
                  <button
                    onClick={() => {
                      completeEvent(event.id);
                    }}
                    title="Tandai Selesai"
                    className="h-8 px-2.5 flex items-center gap-1 text-[#0F9D58] hover:bg-[#EBF9F1] rounded-[6px] border border-[#B7EBD0] text-[12px] font-medium transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                )}

                <button
                  onClick={handleEdit}
                  title="Edit Acara"
                  className="h-8 px-2.5 flex items-center gap-1 text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[6px] border border-[#E5E7EB] text-[12px] font-medium transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Edit</span>
                </button>

                {event.status !== 'Batal' && (
                  <button
                    onClick={() => setConfirmCancelOpen(true)}
                    title="Batalkan Acara"
                    className="h-8 px-2.5 flex items-center gap-1 text-[#6B7280] hover:text-[#E5484D] hover:bg-[#FDF1F2] rounded-[6px] border border-[#E5E7EB] text-[12px] transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                )}

                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  title="Hapus Acara"
                  aria-label="Hapus Acara"
                  className="h-8 w-8 flex items-center justify-center text-[#6B7280] hover:text-[#E5484D] hover:bg-[#FDF1F2] rounded-[6px] border border-[#E5E7EB] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Jadwal Acara?"
        message={`Apakah Anda yakin ingin menghapus "${event.nama_acara}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />

      {/* Confirmation Dialog for Cancel Status */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Batalkan Acara?"
        message={`Status acara "${event.nama_acara}" akan diubah menjadi Batal.`}
        confirmText="Ya, Batalkan"
        variant="warning"
      />
    </>
  );
}
