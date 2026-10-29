import React, { useState, useEffect } from 'react';
import {
  X,
  ScanBarcode,
  Camera,
  Check,
  AlertCircle,
  Plus,
  Search,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    products,
    addToCart,
  } = usePOS();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isBarcodeModalOpen) {
      setBarcodeInput('');
      setScanMessage(null);
    }
  }, [isBarcodeModalOpen]);

  if (!isBarcodeModalOpen) return null;

  const handleScan = (codeToScan: string) => {
    const trimmed = codeToScan.trim();
    if (!trimmed) return;

    const matchedProduct = products.find(
      (p) => p.barcode === trimmed || p.id === trimmed
    );

    if (matchedProduct) {
      const added = addToCart(matchedProduct, 1);
      if (added) {
        setScanMessage({
          text: `Berhasil scan: "${matchedProduct.name}" (${formatRupiah(matchedProduct.price)}) ditambahkan ke keranjang!`,
          success: true,
        });
      } else {
        setScanMessage({
          text: `Stok produk "${matchedProduct.name}" sudah habis!`,
          success: false,
        });
      }
    } else {
      setScanMessage({
        text: `Barcode "${trimmed}" tidak ditemukan di database produk toko.`,
        success: false,
      });
    }

    setBarcodeInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(barcodeInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <ScanBarcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Scanner Barcode Cepat
              </h3>
              <p className="text-xs text-slate-400">
                Arahkan barcode fisik atau klik simulasi produk
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBarcodeModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Animated Viewfinder */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border-2 border-purple-500/50 flex flex-col items-center justify-center text-white shadow-inner">
            <div className="absolute inset-4 border border-dashed border-purple-400/50 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500 animate-pulse" />
            </div>
            <Camera className="w-8 h-8 text-slate-500 mb-2 opacity-50" />
            <span className="text-xs font-mono text-purple-200/80 bg-black/60 px-3 py-1 rounded-full">
              Kamera Siap Memindai EAN-13 / Barcode
            </span>
            <div className="absolute bottom-2 text-[10px] text-slate-400">
              Mendukung Barcode Scanner USB / Bluetooth secara otomatis
            </div>
          </div>

          {/* Manual / Barcode Gun Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Ketik atau tembak barcode di sini..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#582be8] hover:bg-[#4820c7] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Scan
            </button>
          </form>

          {/* Feedback message */}
          {scanMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                scanMessage.success
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {scanMessage.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}

          {/* Quick-Pick Test Barcodes */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
              Uji Cepat Barcode Barang Kelontong:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleScan(p.barcode)}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-slate-800 dark:text-white truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.barcode}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-purple-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={() => setIsBarcodeModalOpen(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
