import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  Printer,
  CheckCircle,
  Download,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';
import { Transaction } from '../types/pos';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    cartTotals,
    activeCustomer,
    activeCoupon,
    completeCheckout,
    recentCompletedTransaction,
    setRecentCompletedTransaction,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('cash');
  const [cashGiven, setCashGiven] = useState<number>(cartTotals.finalTotal);
  const [customCashInput, setCustomCashInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessView, setIsSuccessView] = useState(false);

  // Synchronize cash given with final total only when modal opens
  React.useEffect(() => {
    if (isCheckoutModalOpen) {
      setCashGiven(cartTotals.finalTotal);
      setCustomCashInput('');
      setErrorMessage('');
    }
  }, [isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const currentCash = customCashInput ? parseInt(customCashInput, 10) || 0 : cashGiven;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, currentCash - cartTotals.finalTotal) : 0;
  const isCashInsufficient = paymentMethod === 'cash' && currentCash < cartTotals.finalTotal;

  const quickPresets = [
    { label: 'Uang Pas', amount: cartTotals.finalTotal },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 500.000', amount: 500000 },
  ];

  const handlePay = () => {
    setErrorMessage('');
    const res = completeCheckout(
      paymentMethod,
      paymentMethod === 'cash' ? currentCash : undefined
    );

    if (!res.success) {
      setErrorMessage(res.message || 'Pembayaran gagal dilakukan.');
      return;
    }

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }

    setIsSuccessView(true);
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setIsSuccessView(false);
    setRecentCompletedTransaction(null);
    setCustomCashInput('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                {isSuccessView ? 'Struk Transaksi Kasir' : 'Pembayaran & Checkout'}
              </h3>
              <p className="text-xs text-slate-400">
                {isSuccessView ? 'Transaksi Berhasil Dicatat' : 'Pilih metode pembayaran pelanggan'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isSuccessView ? (
            <>
              {/* Total Amount Banner */}
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-800/60">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Total Tagihan Kasir
                </span>
                <div className="text-3xl font-black text-[#582be8] dark:text-purple-400 mt-1">
                  {formatRupiah(cartTotals.finalTotal)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {cart.length} Jenis Barang • Diskon Total: {formatRupiah(cartTotals.totalDiscount)}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cash', label: 'Tunai / Cash', icon: Banknote },
                    { id: 'qris', label: 'QRIS Statis', icon: QrCode },
                    { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                    { id: 'kasbon', label: 'Hutang / Kasbon', icon: BookOpen },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as Transaction['paymentMethod'])}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-[#582be8] text-white border-transparent shadow-md shadow-purple-500/20'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash payment calculator */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Uang Tunai Diterima (Rp)
                    </label>
                    <span className="text-[11px] text-slate-400">Pilih pecahan cepat:</span>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCashGiven(preset.amount);
                          setCustomCashInput('');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                          currentCash === preset.amount
                            ? 'bg-[#582be8] text-white border-transparent'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Manual Cash Input */}
                  <div>
                    <input
                      type="number"
                      placeholder="Atau ketik nominal tunai lain..."
                      value={customCashInput}
                      onChange={(e) => setCustomCashInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  {/* Change calculation */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Uang Kembalian:
                    </span>
                    <span
                      className={`text-lg font-black ${
                        isCashInsufficient
                          ? 'text-rose-500'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isCashInsufficient
                        ? `Kurang ${formatRupiah(cartTotals.finalTotal - currentCash)}`
                        : formatRupiah(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS Display */}
              {paymentMethod === 'qris' && (
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Scan QRIS Warung Berkah
                  </div>
                  <div className="w-36 h-36 mx-auto bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      <path d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                      <rect x="36" y="6" width="6" height="12" />
                      <rect x="46" y="6" width="12" height="6" />
                      <rect x="40" y="20" width="8" height="8" />
                      <rect x="54" y="16" width="10" height="8" />
                      <rect x="6" y="36" width="12" height="6" />
                      <rect x="22" y="40" width="12" height="12" />
                      <rect x="6" y="52" width="10" height="10" />
                      <rect x="38" y="36" width="24" height="24" />
                      <rect x="44" y="42" width="12" height="12" fill="white" />
                      <rect x="48" y="46" width="4" height="4" />
                      <rect x="70" y="38" width="14" height="8" />
                      <rect x="88" y="42" width="8" height="18" />
                      <rect x="70" y="52" width="12" height="8" />
                      <rect x="36" y="68" width="10" height="8" />
                      <rect x="52" y="68" width="14" height="6" />
                      <rect x="38" y="82" width="18" height="12" />
                      <rect x="62" y="80" width="12" height="14" />
                      <rect x="80" y="74" width="14" height="20" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri
                  </p>
                </div>
              )}

              {/* Kasbon note */}
              {paymentMethod === 'kasbon' && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Peringatan Transaksi Kasbon:</span>
                  <p className="mt-1">
                    Tagihan akan dicatat ke buku kasbon pelanggan{' '}
                    <strong>{activeCustomer?.name || 'Pelanggan Umum'}</strong>.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
            </>
          ) : (
            /* Printable Thermal Receipt View */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Transaksi Selesai & Data Tersinkron</span>
              </div>

              {/* Thermal paper look */}
              <div
                id="thermal-receipt"
                className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-md font-mono text-xs max-w-sm mx-auto space-y-3"
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="font-black text-sm">WARUNG BERKAH POS</div>
                  <div className="text-[10px] text-slate-500">
                    Jl. Melati No. 12, Pasar Anyar
                  </div>
                  <div className="text-[10px] text-slate-500">Telp: 0812-9876-5432</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    ID: {recentCompletedTransaction?.id}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {recentCompletedTransaction &&
                      new Date(recentCompletedTransaction.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300">
                  {recentCompletedTransaction?.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <div>
                        <div>{item.productName}</div>
                        <div className="text-slate-400 text-[10px]">
                          {item.quantity} x {item.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {item.subtotal.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{recentCompletedTransaction?.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {(recentCompletedTransaction?.discountTotal || 0) > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Diskon</span>
                      <span>-{recentCompletedTransaction?.discountTotal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                    <span>TOTAL</span>
                    <span>Rp {recentCompletedTransaction?.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Metode</span>
                    <span className="uppercase">
                      {recentCompletedTransaction?.paymentMethod}
                    </span>
                  </div>
                  {recentCompletedTransaction?.paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>Tunai</span>
                        <span>
                          Rp {recentCompletedTransaction?.cashPaid?.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>Kembali</span>
                        <span>
                          Rp {recentCompletedTransaction?.cashChange?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-1">
                  *** TERIMA KASIH TELAH BERBELANJA ***
                  <br />
                  Barang yang sudah dibeli dapat ditukar jika rusak saat diterima.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          {!isSuccessView ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isCashInsufficient}
                className={`px-5 py-2.5 text-xs font-black rounded-xl text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  isCashInsufficient
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-[#582be8] hover:bg-[#4820c7] shadow-purple-600/30 active:scale-95'
                }`}
              >
                <span>Konfirmasi Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Thermal</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                Transaksi Baru
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
