import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock,
  Unlock,
  ChevronRight,
  Ticket,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Crown,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';
import { UserRole } from '../types/pos';

export const CartSidebar: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotals,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutModalOpen,
    currentRole,
    activeStaff,
    staffList,
    switchStaffRole,
    managerPin,
  } = usePOS();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Role Switch & PIN Modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
      setShowCouponInput(false);
    }
  };

  const handleSelectRole = (targetRole: UserRole) => {
    if (targetRole === currentRole) return;

    if (targetRole === 'manager') {
      // Require PIN verification when switching to manager
      setPinInput('');
      setPinError('');
      setIsPinModalOpen(true);
    } else {
      // Switching to cashier does not require PIN
      switchStaffRole('cashier');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = switchStaffRole('manager', undefined, pinInput);
    if (!res.success) {
      setPinError(res.message);
    } else {
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError('');
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 transition-colors">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* PENGATURAN AKSES & OPERATOR KASIR (Replacing Balance & Member cards) */}
        <div className="bg-gradient-to-br from-[#161233] to-[#251e4b] rounded-2xl p-4 text-white shadow-lg shadow-purple-950/20 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>PENGATURAN AKSES TOKO</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                currentRole === 'manager'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-emerald-400 text-slate-950 shadow-xs'
              }`}
            >
              {currentRole === 'manager' ? (
                <>
                  <Crown className="w-2.5 h-2.5" />
                  Manager
                </>
              ) : (
                <>
                  <Briefcase className="w-2.5 h-2.5" />
                  Kasir Aktif
                </>
              )}
            </span>
          </div>

          {/* Active Operator info */}
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10 mb-3">
            <img
              src={activeStaff.avatar}
              alt={activeStaff.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-400/50 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                <span>{activeStaff.name}</span>
                {currentRole === 'manager' && (
                  <span className="text-[10px] text-amber-300 font-normal">
                    (Owner)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-purple-200/70 truncate">
                {activeStaff.shift}
              </div>
            </div>
          </div>

          {/* Segmented Switcher for Role: Pegawai/Kasir vs Manager */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/30 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => handleSelectRole('cashier')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentRole === 'cashier'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pegawai / Kasir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('manager')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentRole === 'manager'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Manager</span>
            </button>
          </div>

          {/* Role Access Capability summary */}
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {currentRole === 'manager' ? (
                <Unlock className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">
                {currentRole === 'manager'
                  ? 'Akses Penuh: Stok, Margin Laba, & Laporan'
                  : 'Akses Kasir: Transaksi, Scan, & Cetak Struk'}
              </span>
            </div>
            {currentRole === 'manager' && (
              <span className="font-mono text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                PIN: {managerPin}
              </span>
            )}
          </div>
        </div>

        {/* Order Menu (Keranjang Belanja) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              Order Menu
            </h4>
            <span className="text-xs font-medium text-slate-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Keranjang kasir masih kosong
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Klik tanda (+) pada produk atau scan barcode barang
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-2.5 p-2 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-200 dark:bg-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 text-xs font-bold text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        @{formatRupiah(item.product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {formatRupiah(item.product.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 mt-1 transition-colors cursor-pointer"
                      title="Hapus barang"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Order Summary & Checkout */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {/* Breakdown rows */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(cartTotals.subtotal)}
            </span>
          </div>

          {cartTotals.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Diskon Kupon ({activeCoupon?.code})</span>
              <span>-{formatRupiah(cartTotals.couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Biaya Layanan / Plastik</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Rp 0
            </span>
          </div>

          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Total Bayar</span>
            <span className="text-base text-[#582be8] dark:text-purple-400">
              {formatRupiah(cartTotals.finalTotal)}
            </span>
          </div>
        </div>

        {/* Coupon code dropdown bar */}
        <div>
          {activeCoupon ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeCoupon.code}</span>
              </div>
              <button
                onClick={removeCoupon}
                className="text-[11px] underline text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowCouponInput(!showCouponInput)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Ticket className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Have a coupon code / Kode Promo?</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${showCouponInput ? 'rotate-90' : ''}`}
                />
              </button>

              {showCouponInput && (
                <form onSubmit={handleApplyCoupon} className="mt-2 space-y-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="Contoh: JUMATBERKAH"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white uppercase font-mono focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#582be8] hover:bg-[#4820c7] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Klaim
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-rose-500 font-medium">{couponError}</p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => setIsCheckoutModalOpen(true)}
          disabled={cart.length === 0}
          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            cart.length === 0
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
              : 'bg-[#582be8] hover:bg-[#4820c7] active:scale-98 shadow-purple-600/30'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Checkout ({formatRupiah(cartTotals.finalTotal)})</span>
        </button>
      </div>

      {/* PIN Verification Modal when switching to Manager */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Verifikasi Akses Manager
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Masukkan PIN keamanan pemilik toko
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  PIN Keamanan Manager (Default: 1234)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ketik PIN..."
                  className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {pinError && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPinInput('1234')}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Gunakan PIN Default (1234)
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  Buka Akses Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
