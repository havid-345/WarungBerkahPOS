import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  Percent,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/calculations';
import { exportSalesToExcel, printSalesReportPDF } from '../utils/exportUtils';

export const AnalyticsView: React.FC = () => {
  const { transactions } = usePOS();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'month' | 'all'>('month');

  // Filter transactions based on period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      return transactions.filter((t) => t.timestamp.startsWith(todayStr));
    }
    if (selectedPeriod === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return transactions.filter((t) => {
        const d = new Date(t.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }
    return transactions;
  }, [transactions, selectedPeriod]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
    const totalProfit = filteredTransactions.reduce((acc, t) => acc + t.profit, 0);
    const totalDiscount = filteredTransactions.reduce((acc, t) => acc + t.discountTotal, 0);
    const totalCount = filteredTransactions.length;
    const aov = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalProfit,
      totalDiscount,
      totalCount,
      aov,
      profitMargin,
    };
  }, [filteredTransactions]);

  // Generate 7-day or monthly chart data points for visualization
  const chartData = useMemo(() => {
    const daysMap: { [day: string]: { label: string; revenue: number; profit: number; count: number } } = {};
    const today = new Date();

    // Past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      daysMap[key] = { label: dayName, revenue: 0, profit: 0, count: 0 };
    }

    transactions.forEach((t) => {
      const dayKey = t.timestamp.slice(0, 10);
      if (daysMap[dayKey]) {
        daysMap[dayKey].revenue += t.total;
        daysMap[dayKey].profit += t.profit;
        daysMap[dayKey].count += 1;
      }
    });

    return Object.values(daysMap);
  }, [transactions]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100000);

  // Category sales breakdown
  const categoryBreakdown = useMemo(() => {
    const catMap: { [cat: string]: number } = {};
    transactions.forEach((t) => {
      t.items.forEach((i) => {
        catMap[i.productName] = (catMap[i.productName] || 0) + i.subtotal;
      });
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Laporan Penjualan & Analitik Toko
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grafik komprehensif omzet harian & bulanan serta performa laba bersih
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period filter buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['today', 'month', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === p
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p === 'today' ? 'Hari Ini' : p === 'month' ? 'Bulan Ini' : 'Semua'}
              </button>
            ))}
          </div>

          {/* Export to Excel */}
          <button
            onClick={() => exportSalesToExcel(filteredTransactions)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={() => printSalesReportPDF(filteredTransactions)}
            className="px-3.5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Akurat dari {metrics.totalCount} transaksi</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Estimasi Laba Bersih</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(metrics.totalProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margin Keuntungan: {metrics.profitMargin}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Rata-Rata Belanja (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(metrics.aov)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Per struk belanja kasir
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Total Diskon Diberikan</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatRupiah(metrics.totalDiscount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Member & Kupon Promosi
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart: 7-Day Trend Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Grafik Tren Penjualan 7 Hari Terakhir
            </h3>
            <p className="text-xs text-slate-400">
              Perbandingan Omzet Harian (Ungu) dan Keuntungan Bersih (Hijau)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#582be8]" />
              <span className="text-slate-600 dark:text-slate-300">Omzet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Laba Bersih</span>
            </div>
          </div>
        </div>

        {/* Bar visualization */}
        <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
          {chartData.map((d, idx) => {
            const revenueHeight = Math.max(12, (d.revenue / maxRevenue) * 100);
            const profitHeight = Math.max(8, (d.profit / maxRevenue) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatRupiah(d.revenue)}
                </div>

                <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-44">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${revenueHeight}%` }}
                    className="w-1/2 bg-[#582be8] hover:bg-[#4820c7] rounded-t-md transition-all relative"
                    title={`Omzet: ${formatRupiah(d.revenue)} (${d.count} transaksi)`}
                  />
                  {/* Profit Bar */}
                  <div
                    style={{ height: `${profitHeight}%` }}
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative"
                    title={`Laba: ${formatRupiah(d.profit)}`}
                  />
                </div>

                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Row: Top Products & Recent Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products by Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
            Produk Paling Banyak Berkontribusi
          </h3>
          <div className="space-y-3 pt-2">
            {categoryBreakdown.map(([name, sum], idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2">
                    {idx + 1}. {name}
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                    {formatRupiah(sum)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#582be8] rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, (sum / (metrics.totalRevenue || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Rincian Transaksi Terakhir
            </h3>
            <span className="text-xs text-slate-400">
              Menampilkan {filteredTransactions.length} transaksi
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">ID Transaksi</th>
                  <th className="p-2.5">Pelanggan</th>
                  <th className="p-2.5">Metode</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(t.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-white">
                      {t.id}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">
                      {t.customer ? t.customer.name : 'Pelanggan Umum'}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">
                      {formatRupiah(t.total)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Sukses
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
