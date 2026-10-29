import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  CheckCircle,
  Calendar,
  CreditCard,
  User,
  Eye,
  X,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';
import { Transaction } from '../types/pos';

export const HistoryView: React.FC = () => {
  const { transactions } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filtered = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
      (t.customer && t.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      t.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-600" />
            Riwayat Transaksi & Struk Kasir
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar lengkap transaksi penjualan, struk digital, dan status pembayaran
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID transaksi / pelanggan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-purple-400 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">ID Transaksi</th>
              <th className="p-3">Pelanggan</th>
              <th className="p-3">Kasir</th>
              <th className="p-3">Items</th>
              <th className="p-3">Metode</th>
              <th className="p-3 text-right">Total Bayar</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-mono text-[11px] text-slate-500">
                  {new Date(t.timestamp).toLocaleString('id-ID')}
                </td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">
                  {t.id}
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-300">
                  {t.customer ? t.customer.name : 'Pelanggan Umum'}
                </td>
                <td className="p-3 text-slate-500">{t.cashierName}</td>
                <td className="p-3">
                  {t.items.reduce((s, i) => s + i.quantity, 0)} pcs ({t.items.length} item)
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {t.paymentMethod}
                  </span>
                </td>
                <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                  {formatRupiah(t.total)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelectedTransaction(t)}
                    className="p-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-[#582be8] dark:text-purple-300 rounded-lg transition-colors cursor-pointer"
                    title="Lihat Struk Thermal"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Struk Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Rincian Struk Pembelian
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal look */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-2">
              <div className="text-center font-bold">WARUNG BERKAH POS</div>
              <div className="text-center text-[10px] text-slate-400">
                {selectedTransaction.id}
              </div>
              <div className="text-center text-[10px] text-slate-400 border-b border-dashed border-slate-300 pb-2">
                {new Date(selectedTransaction.timestamp).toLocaleString('id-ID')}
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300">
                {selectedTransaction.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div>
                      {it.productName} ({it.quantity}x)
                    </div>
                    <div>{it.subtotal.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{selectedTransaction.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedTransaction.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Diskon</span>
                    <span>-{selectedTransaction.discountTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL</span>
                  <span>Rp {selectedTransaction.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Metode: {selectedTransaction.paymentMethod.toUpperCase()}</span>
                  <span>Kasir: {selectedTransaction.cashierName}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Ulang Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
