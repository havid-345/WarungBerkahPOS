import React, { useState } from 'react';
import { X, Zap, ArrowUpRight, DollarSign } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';

interface CashAdjustmentModalProps {
  type: 'in' | 'out';
  onClose: () => void;
}

export const CashAdjustmentModal: React.FC<CashAdjustmentModalProps> = ({ type, onClose }) => {
  const { adjustRegisterBalance, registerBalance } = usePOS();
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amountStr, 10);
    if (!val || val <= 0) return;

    const adjustment = type === 'in' ? val : -val;
    adjustRegisterBalance(
      adjustment,
      reason.trim() || (type === 'in' ? 'Top up modal kasir' : 'Tarik setoran kasir')
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                type === 'in' ? 'bg-yellow-400 text-slate-950' : 'bg-emerald-500 text-white'
              }`}
            >
              {type === 'in' ? <Zap className="w-4 h-4 fill-current" /> : <ArrowUpRight className="w-4 h-4 stroke-[3]" />}
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              {type === 'in' ? 'Kas Masuk (Top Up Modal)' : 'Tarik Kas (Setoran / Pengeluaran)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Saldo Kas Saat Ini:{' '}
          <span className="font-black text-slate-800 dark:text-white">
            {formatRupiah(registerBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nominal Uang (Rp)
            </label>
            <input
              type="number"
              required
              min="1000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="Contoh: 500000"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm"
            />
          </div>

          <div className="flex gap-1.5">
            {[100000, 200000, 500000, 1000000].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setAmountStr(num.toString())}
                className="flex-1 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-700 dark:text-slate-200 rounded-lg font-bold"
              >
                +{num / 1000}k
              </button>
            ))}
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Keterangan / Keperluan
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'in' ? 'Tambahan uang kembalian' : 'Setor ke rekening bank'}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md ${
                type === 'in' ? 'bg-[#582be8] hover:bg-[#4820c7]' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Simpan Transaksi Kas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
