import * as XLSX from 'xlsx';
import { Transaction, Product } from '../types/pos';
import { formatRupiah } from './calculations';

/**
 * Exports daily/monthly transactions and sales report to standard Excel (.xlsx) file
 */
export function exportSalesToExcel(
  transactions: Transaction[],
  title = 'Laporan_Penjualan_Warung_Berkah'
) {
  // 1. Transaction Sheet
  const rows = transactions.map((t, idx) => ({
    No: idx + 1,
    'ID Transaksi': t.id,
    'Waktu': new Date(t.timestamp).toLocaleString('id-ID'),
    'Kasir': t.cashierName,
    'Pelanggan': t.customer ? `${t.customer.name} (${t.customer.memberTier})` : 'Pelanggan Umum',
    'Jumlah Item': t.items.reduce((acc, i) => acc + i.quantity, 0),
    'Subtotal (Rp)': t.subtotal,
    'Diskon (Rp)': t.discountTotal,
    'Kode Promo': t.couponCode || '-',
    'Total Bayar (Rp)': t.total,
    'Estimasi Laba (Rp)': t.profit,
    'Metode Pembayaran': t.paymentMethod.toUpperCase(),
    'Status Cloud': t.syncedToCloud ? 'Tersinkron' : 'Pending',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
  ];

  // 2. Summary Sheet
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);
  const totalDiscount = transactions.reduce((sum, t) => sum + t.discountTotal, 0);

  const summaryRows = [
    { 'Ringkasan Laporan': 'Nama Toko', 'Nilai': 'Warung Berkah POS' },
    { 'Ringkasan Laporan': 'Tanggal Cetak', 'Nilai': new Date().toLocaleString('id-ID') },
    { 'Ringkasan Laporan': 'Total Transaksi', 'Nilai': transactions.length },
    { 'Ringkasan Laporan': 'Total Omzet Penjualan', 'Nilai': formatRupiah(totalRevenue) },
    { 'Ringkasan Laporan': 'Total Diskon Diberikan', 'Nilai': formatRupiah(totalDiscount) },
    { 'Ringkasan Laporan': 'Total Estimasi Laba Bersih', 'Nilai': formatRupiah(totalProfit) },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Transaksi');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Keuangan');

  // Trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${title}_${dateStr}.xlsx`);
}

/**
 * Exports current Inventory / Stock report to Excel (.xlsx)
 */
export function exportInventoryToExcel(products: Product[]) {
  const rows = products.map((p, idx) => ({
    No: idx + 1,
    'Kode Barcode': p.barcode,
    'Nama Produk': p.name,
    'Kategori': p.category,
    'Harga Modal (Rp)': p.costPrice,
    'Harga Jual (Rp)': p.price,
    'Margin Laba (Rp)': p.price - p.costPrice,
    'Margin (%)': Math.round(((p.price - p.costPrice) / p.price) * 100) + '%',
    'Sisa Stok': p.stock,
    'Batas Minimum Alert': p.minStockAlert,
    'Satuan': p.unit,
    'Total Terjual': p.soldCount,
    'Nilai Aset Modal (Rp)': p.stock * p.costPrice,
    'Nilai Potensi Omzet (Rp)': p.stock * p.price,
    'Status': p.stock <= 0 ? 'HABIS' : p.stock <= p.minStockAlert ? 'MENIPIS' : 'AMAN',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stok Toko');
  
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Laporan_Stok_Inventaris_${dateStr}.xlsx`);
}

/**
 * Triggers a formatted, high-resolution printable PDF report
 */
export function printSalesReportPDF(
  transactions: Transaction[],
  periodTitle = 'Laporan Penjualan & Analitik Toko'
) {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalProfit = transactions.reduce((sum, t) => sum + t.profit, 0);
  const totalDiscounts = transactions.reduce((sum, t) => sum + t.discountTotal, 0);
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${periodTitle}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 24px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: bold; color: #1e1b4b; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .card-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .card-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Warung Berkah POS - Toko Kelontong</h1>
          <div class="subtitle">${periodTitle} • Tanggal: ${dateStr}</div>
        </div>
        <div>
          <button onclick="window.print()" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cetak / Simpan PDF</button>
        </div>
      </div>

      <div class="summary-grid">
        <div class="card">
          <div class="card-label">Total Omzet Penjualan</div>
          <div class="card-val" style="color: #4f46e5;">${formatRupiah(totalRevenue)}</div>
        </div>
        <div class="card">
          <div class="card-label">Estimasi Keuntungan Bersih</div>
          <div class="card-val" style="color: #059669;">${formatRupiah(totalProfit)}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Transaksi Selesai</div>
          <div class="card-val">${transactions.length} Transaksi (Diskon: ${formatRupiah(totalDiscounts)})</div>
        </div>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 8px; color: #334155;">Daftar Rincian Transaksi</h3>
      <table>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>ID Transaksi</th>
            <th>Pelanggan</th>
            <th>Metode</th>
            <th>Jumlah Item</th>
            <th>Diskon</th>
            <th style="text-align: right;">Total Bayar</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${t.id}</td>
              <td>${t.customer ? t.customer.name : 'Umum'}</td>
              <td>${t.paymentMethod.toUpperCase()}</td>
              <td>${t.items.reduce((s, i) => s + i.quantity, 0)} pcs</td>
              <td>${t.discountTotal > 0 ? formatRupiah(t.discountTotal) : '-'}</td>
              <td style="text-align: right; font-weight: 600;">${formatRupiah(t.total)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>Dicetak otomatis oleh Sistem Kasir Warung Berkah POS • Cloud Sync Active</div>
        <div>Tanda Tangan Kasir / Pemilik: _______________________</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  // Allow DOM to render before print dialog
  setTimeout(() => {
    printWindow.focus();
  }, 250);
}
