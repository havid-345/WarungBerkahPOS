import React from 'react';
import { X, SlidersHorizontal, Eye, Keyboard, Type } from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface AccessibilityModalProps {
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ onClose }) => {
  const { fontSize, setFontSize, highContrast, setHighContrast } = usePOS();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Aksesibilitas & Kenyamanan Kasir
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font size scaler */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-purple-600" />
            <span>Ukuran Teks / Font Kasir (Mudah Dibaca)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Standar (14px)' },
              { id: 'large', label: 'Besar (16px)' },
              { id: 'extralarge', label: 'Sangat Besar' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id as 'normal' | 'large' | 'extralarge')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  fontSize === size.id
                    ? 'bg-[#582be8] text-white border-transparent shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* High contrast switch */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">
                Mode Kontras Tinggi
              </div>
              <div className="text-[11px] text-slate-400">
                Mempertegas garis tepi dan teks layar kasir
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#582be8]"></div>
          </label>
        </div>

        {/* Keyboard Shortcuts Cheat Sheet */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-purple-600" />
            <span>Pintasan Keyboard Cepat (Keyboard Shortcuts)</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>F2</span>
              <span className="font-semibold text-slate-800 dark:text-white">Fokus Kolom Cari Barang</span>
            </div>
            <div className="flex justify-between">
              <span>F4</span>
              <span className="font-semibold text-slate-800 dark:text-white">Buka Scanner Barcode</span>
            </div>
            <div className="flex justify-between">
              <span>F8 / Enter</span>
              <span className="font-semibold text-slate-800 dark:text-white">Buka Modal Checkout</span>
            </div>
            <div className="flex justify-between">
              <span>Esc</span>
              <span className="font-semibold text-slate-800 dark:text-white">Tutup Modal / Popup</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            Terapkan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
