import React, { useState } from 'react';
import {
  Zap,
  ArrowUpRight,
  User,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Ticket,
  CreditCard,
  FileText,
  UserCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';

interface CartSidebarProps {
  onOpenCashAdjustment: (type: 'in' | 'out') => void;
  onOpenMemberSelect: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  onOpenCashAdjustment,
  onOpenMemberSelect,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotals,
    activeCustomer,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    registerBalance,
    setIsCheckoutModalOpen,
  } = usePOS();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

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

  return (
    <aside className="w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-5 shrink-0 transition-colors">
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* 1. Top Balance Card matching the reference violet card */}
        <div className="bg-[#582be8] rounded-2xl p-4 text-white shadow-lg shadow-purple-600/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-200 font-medium">
              Balance / Saldo Kas
            </span>
            <h3 className="text-xl font-black tracking-tight mt-0.5">
              {formatRupiah(registerBalance)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCashAdjustment('in')}
              title="Kas Masuk (Top Up)"
              className="flex flex-col items-center justify-center w-11 h-11 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl transition-all shadow cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span className="text-[9px] font-bold mt-0.5">Masuk</span>
            </button>

            <button
              onClick={() => onOpenCashAdjustment('out')}
              title="Tarik Kas (Transfer/Pengeluaran)"
              className="flex flex-col items-center justify-center w-11 h-11 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl transition-all shadow cursor-pointer active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span className="text-[9px] font-bold mt-0.5">Tarik</span>
            </button>
          </div>
        </div>

        {/* 2. Customer Info Card matching "YOUR ADDRESS" in reference */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              PELANGGAN / MEMBER
            </span>
            {activeCustomer && activeCustomer.discountPercent > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {activeCustomer.memberTier} (-{activeCustomer.discountPercent}%)
              </span>
            )}
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {activeCustomer ? activeCustomer.name : 'Pelanggan Umum (Tanpa Member)'}
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1">
                {activeCustomer ? activeCustomer.address : 'Klik tombol di bawah untuk memilih member diskon'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={onOpenMemberSelect}
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-semibold text-purple-700 dark:text-purple-300 transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Pilih Member
            </button>
            <button
              onClick={() => alert(`Catatan Pelanggan: ${activeCustomer?.notes || 'Tidak ada catatan kasbon.'}`)}
              className="py-1.5 px-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <FileText className="w-3 h-3" />
              Catatan
            </button>
          </div>
        </div>

        {/* 3. Order Menu (Cart Items list matching reference) */}
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
              <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Keranjang kasir masih kosong
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Klik tanda (+) pada produk atau scan barcode
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
                      className="text-slate-400 hover:text-rose-500 mt-1 transition-colors"
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

      {/* 4. Bottom Order Summary & Checkout matching reference */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {/* Breakdown rows */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(cartTotals.subtotal)}
            </span>
          </div>

          {cartTotals.memberDiscount > 0 && (
            <div className="flex justify-between text-purple-600 dark:text-purple-400 font-medium">
              <span>Diskon Member ({activeCustomer?.discountPercent}%)</span>
              <span>-{formatRupiah(cartTotals.memberDiscount)}</span>
            </div>
          )}

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

        {/* Coupon code dropdown bar matching reference "Have a coupon code >" */}
        <div>
          {activeCoupon ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeCoupon.code}</span>
              </div>
              <button
                onClick={removeCoupon}
                className="text-[11px] underline text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
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
                      className="px-3 py-1.5 bg-[#582be8] hover:bg-[#4820c7] text-white text-xs font-bold rounded-lg transition-colors"
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

        {/* Checkout Button matching reference */}
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
    </aside>
  );
};
