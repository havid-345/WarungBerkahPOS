import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ScanBarcode,
  Bell,
  Cloud,
  CloudOff,
  RefreshCw,
  Moon,
  Sun,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface HeaderProps {
  onOpenAccessibility: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAccessibility }) => {
  const {
    searchQuery,
    setSearchQuery,
    setIsBarcodeModalOpen,
    cloudSyncStatus,
    triggerManualSync,
    isOfflineMode,
    setIsOfflineMode,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    clearAllNotifications,
    isDarkMode,
    setIsDarkMode,
    soundEnabled,
    setSoundEnabled,
    activeStaff,
    currentRole,
  } = usePOS();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Left: Dynamic Greeting matching active role */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <span>{currentRole === 'manager' ? `Halo, ${activeStaff.name}` : `Hey ${activeStaff.name}`}</span>
          <span>👋</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              currentRole === 'manager'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
            }`}
          >
            {currentRole === 'manager' ? 'Manager' : 'Kasir'}
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {currentRole === 'manager'
            ? 'Akses Pemilik Toko • Kontrol Penuh Stok & Keuangan'
            : 'Kasir Toko Kelontong • Siap melayani transaksi pelanggan'}
        </p>
      </div>

      {/* Middle: Search input matching reference */}
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here... (Ketik nama barang, bumbu, atau barcode)"
            className="w-full pl-10 pr-24 py-2 text-sm bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 rounded-full border border-transparent focus:border-purple-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all shadow-inner"
          />
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            title="Scan Barcode (F4)"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-purple-50 flex items-center gap-1 transition-colors"
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            <span>Scan</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Cloud Sync & Offline Toggle */}
        <div className="flex items-center">
          <button
            onClick={triggerManualSync}
            disabled={cloudSyncStatus === 'syncing' || isOfflineMode}
            title={
              isOfflineMode
                ? 'Mode Offline Aktif'
                : cloudSyncStatus === 'syncing'
                ? 'Menyinkronkan ke Cloud...'
                : 'Data Tersinkron ke Cloud (Klik untuk sinkronisasi paksa)'
            }
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                : cloudSyncStatus === 'syncing'
                ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
            }`}
          >
            {isOfflineMode ? (
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-bounce text-blue-600' : 'text-emerald-600'}`} />
            )}
            <span className="hidden sm:inline">
              {isOfflineMode ? 'Offline' : cloudSyncStatus === 'syncing' ? 'Sync...' : 'Cloud Synced'}
            </span>
            <RefreshCw
              className={`w-3 h-3 text-slate-400 hover:text-slate-600 ${
                cloudSyncStatus === 'syncing' ? 'animate-spin text-blue-600' : ''
              }`}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Efek Suara Aktif' : 'Efek Suara Senyap'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Dark Mode toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Accessibility Modal toggle */}
        <button
          onClick={onOpenAccessibility}
          title="Pengaturan Aksesibilitas & Ukuran Font"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Peringatan Stok & Notifikasi"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notif Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Pemberitahuan
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 rounded-full">
                      {unreadNotificationCount} Baru
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !n.read ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 mt-0.5">
                          {n.severity === 'danger' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : n.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(n.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cashier / Manager Profile Avatar matching reference */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={activeStaff.avatar}
            alt={activeStaff.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
          />
        </div>
      </div>
    </header>
  );
};
