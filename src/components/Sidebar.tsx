import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  BarChart3,
  Tag,
  Users,
  ShieldCheck,
  Receipt,
  Store,
  Sparkles,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ActiveTab } from '../types/pos';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, lowStockProducts, pendingSyncCount } = usePOS();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: 'Kasir POS', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'inventory',
      label: 'Stok Barang',
      icon: <PackageOpen className="w-5 h-5" />,
      badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
    },
    { id: 'history', label: 'Riwayat Struk', icon: <Receipt className="w-5 h-5" /> },
    { id: 'analytics', label: 'Laporan & Grafik', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'discounts', label: 'Diskon & Promo', icon: <Tag className="w-5 h-5" /> },
    { id: 'security', label: 'Keamanan & Cloud', icon: <ShieldCheck className="w-5 h-5" />, badge: pendingSyncCount > 0 ? pendingSyncCount : undefined },
  ];

  return (
    <aside className="w-64 bg-[#14112e] text-slate-300 flex flex-col justify-between p-5 select-none shrink-0 border-r border-slate-800/80">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-yellow-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white italic font-serif">
              Warung Berkah
            </h1>
            <p className="text-[11px] font-medium text-purple-300/70 tracking-wider uppercase">
              POS Toko Kelontong
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5" aria-label="Menu Utama">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                  isActive
                    ? 'bg-[#facc15] text-slate-950 font-bold shadow-md shadow-yellow-500/30 translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-slate-950' : 'text-purple-300/80'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-900 text-yellow-400'
                        : 'bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo / Store Widget matching the reference card */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-4 border border-purple-500/30 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Promo Toko
            </span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">
            Jumat Berkah Hemat
          </h4>
          <p className="text-[11px] text-purple-200/80 mt-1">
            Gunakan kupon <span className="font-mono text-yellow-300 font-bold">JUMATBERKAH</span> untuk diskon sembako 7%.
          </p>
          <button
            onClick={() => setActiveTab('discounts')}
            className="mt-3 w-full py-1.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <Tag className="w-3.5 h-3.5" />
            Kelola Kupon
          </button>
        </div>
      </div>
    </aside>
  );
};
