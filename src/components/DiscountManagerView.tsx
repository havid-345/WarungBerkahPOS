import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Sparkles,
  CheckCircle,
  Users,
  Calendar,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Coupon } from '../types/pos';
import { formatRupiah } from '../utils/calculations';

export const DiscountManagerView: React.FC = () => {
  const { coupons, addCoupon, customers } = usePOS();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('50000');
  const [maxDiscount, setMaxDiscount] = useState('20000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      description: description.trim() || 'Diskon Spesial Toko',
      discountType,
      discountValue: parseInt(discountValue, 10) || 0,
      minOrder: parseInt(minOrder, 10) || 0,
      maxDiscount: discountType === 'percentage' && maxDiscount ? parseInt(maxDiscount, 10) : undefined,
      isActive: true,
      expiryDate: '2026-12-31',
    };

    addCoupon(newCoupon);
    setIsAddModalOpen(false);
    setCode('');
    setDescription('');
    setDiscountValue('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-600" />
            Manajemen Diskon Pelanggan & Kupon Promosi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur kupon voucher belanja toko dan persentase tier member pelanggan setia
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Kupon Baru</span>
        </button>
      </div>

      {/* Member Tier Benefits Card */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#14112e] text-white rounded-3xl p-6 shadow-xl border border-purple-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h3 className="font-bold text-base">
            Tingkatan Diskon Member Toko Kelontong
          </h3>
        </div>
        <p className="text-xs text-purple-200/80 max-w-2xl">
          Diskon member diterapkan otomatis di keranjang kasir saat nama pelanggan dipilih.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-xs font-bold text-purple-300">Member VIP</div>
            <div className="text-2xl font-black text-amber-300 mt-1">Diskon 5%</div>
            <p className="text-[11px] text-purple-200 mt-1">Belanja akumulasi &gt; Rp 3.000.000</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-xs font-bold text-purple-300">Member Gold</div>
            <div className="text-2xl font-black text-yellow-400 mt-1">Diskon 3%</div>
            <p className="text-[11px] text-purple-200 mt-1">Belanja akumulasi &gt; Rp 1.500.000</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-xs font-bold text-purple-300">Member Silver</div>
            <div className="text-2xl font-black text-slate-200 mt-1">Diskon 2%</div>
            <p className="text-[11px] text-purple-200 mt-1">Pelanggan terdaftar aktif</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-xs font-bold text-purple-300">Regular</div>
            <div className="text-2xl font-black text-slate-400 mt-1">0%</div>
            <p className="text-[11px] text-purple-200 mt-1">Pelanggan umum tanpa member</p>
          </div>
        </div>
      </div>

      {/* Active Coupons Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-800 dark:text-white">
          Daftar Kupon Promo Aktif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="p-4 rounded-2xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 relative space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 font-mono font-black text-sm bg-purple-600 text-white rounded-lg tracking-wider">
                  {coupon.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Aktif
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                  {coupon.description}
                </h4>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-bold mt-1">
                  Nilai:{' '}
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% (Maks. ${formatRupiah(coupon.maxDiscount || 0)})`
                    : formatRupiah(coupon.discountValue)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Min. Belanja: {formatRupiah(coupon.minOrder)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Buat Kupon Diskon Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Kupon (Huruf Kapital)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MERDEKA10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskon 10% Spesial Kebutuhan Pokok"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tipe Potongan
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nilai ({discountType === 'percentage' ? '%' : 'Rp'})
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={discountType === 'percentage' ? '10' : '10000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                {discountType === 'percentage' && (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Maks. Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white font-bold rounded-xl"
                >
                  Simpan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
