import React, { useState } from 'react';
import {
  ShieldCheck,
  Cloud,
  CloudOff,
  RefreshCw,
  KeyRound,
  Download,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const SecurityView: React.FC = () => {
  const {
    isOfflineMode,
    setIsOfflineMode,
    cloudSyncStatus,
    lastSyncedAt,
    pendingSyncCount,
    triggerManualSync,
    encryptionPassphrase,
    setEncryptionPassphrase,
    exportEncryptedVault,
    importEncryptedVault,
  } = usePOS();

  const [customKey, setCustomKey] = useState(encryptionPassphrase);
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [importInput, setImportInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setEncryptionPassphrase(customKey);
    setStatusMessage({
      text: 'Kunci enkripsi AES-256 berhasil diperbarui!',
      success: true,
    });
  };

  const handleExport = async () => {
    try {
      const ciphertext = await exportEncryptedVault();
      setEncryptedOutput(ciphertext);
      setStatusMessage({
        text: 'Basis data toko berhasil dienkripsi dengan algoritma AES-GCM 256-bit.',
        success: true,
      });
    } catch {
      setStatusMessage({ text: 'Gagal mengenkripsi basis data.', success: false });
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) return;
    const res = await importEncryptedVault(importInput.trim());
    setStatusMessage({
      text: res.message,
      success: res.success,
    });
    if (res.success) {
      setImportInput('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Keamanan Data & Sinkronisasi Cloud Multi-Perangkat
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengelolaan enkripsi AES-256 GCM, mode offline toleransi putus koneksi, dan real-time multi-device sync
          </p>
        </div>

        <button
          onClick={triggerManualSync}
          disabled={cloudSyncStatus === 'syncing' || isOfflineMode}
          className="px-4 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span>Sinkronkan ke Cloud Sekarang</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border ${
            statusMessage.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
          }`}
        >
          {statusMessage.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Cloud Sync & Offline Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time Cloud Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Real-time Cloud Sync
                </h3>
                <p className="text-xs text-slate-400">
                  BroadcastChannel & Cloud Engine
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {cloudSyncStatus === 'synced' ? 'Tersinkronisasi' : 'Menyinkronkan...'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Data transaksi, stok, dan kasir otomatis tersinkronisasi antar perangkat (tablet kasir, HP pemilik warung, dan PC toko) secara real-time.
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Laptop className="w-4 h-4 text-purple-600" />
              <span>Multi-Perangkat Aktif:</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-white">
              2 Perangkat Terkoneksi
            </span>
          </div>
        </div>

        {/* Offline Mode Tolerant Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <CloudOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Mode Offline Operasional
                </h3>
                <p className="text-xs text-slate-400">
                  Tetap bisa jualan saat internet padam
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isOfflineMode}
                onChange={(e) => setIsOfflineMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isOfflineMode
              ? 'Mode offline sedang AKTIF. Transaksi disimpan di antrean lokal (Local Storage) dan akan otomatis diunggah ke cloud saat koneksi internet kembali normal.'
              : 'Mode offline nonaktif (Online). Setiap struk transaksi langsung dikirim ke cloud storage.'}
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Antrean Pending Sync:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {pendingSyncCount} Transaksi Menunggu
            </span>
          </div>
        </div>
      </div>

      {/* Advanced AES-GCM 256-bit Encryption Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Enkripsi Data Tingkat Lanjut (AES-GCM 256-Bit)
            </h3>
            <p className="text-xs text-slate-400">
              Standar enkripsi militer menggunakan Web Crypto API untuk mengamankan data pelanggan dan pembukuan toko
            </p>
          </div>
        </div>

        {/* Passphrase form */}
        <form onSubmit={handleSaveKey} className="max-w-md space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Kunci Rahasia Enkripsi (Passphrase):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Simpan Kunci
            </button>
          </div>
        </form>

        {/* Encrypted Vault Backup & Restore */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Export */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-purple-600" />
              <span>Ekspor Cadangan Terenkripsi</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Buat ciphertext terenkripsi dari seluruh produk, kasir, dan transaksi toko.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-[#582be8] dark:text-purple-300 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors"
            >
              Generate Ciphertext AES-256
            </button>

            {encryptedOutput && (
              <textarea
                readOnly
                rows={3}
                value={encryptedOutput}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 select-all"
              />
            )}
          </div>

          {/* Import / Restore */}
          <form onSubmit={handleImport} className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Pulihkan Data dari Ciphertext</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Tempel ciphertext cadangan untuk memulihkan seluruh data toko dengan aman.
            </p>
            <textarea
              rows={2}
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="Tempel base64 ciphertext AES-GCM di sini..."
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              Dekripsi & Pulihkan Basis Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
