import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  CheckCircle,
  TrendingDown,
  RefreshCw,
  Edit2,
  X,
  Barcode,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatRupiah, checkStockStatus } from '../utils/calculations';
import { exportInventoryToExcel } from '../utils/exportUtils';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProductStock, editProduct } = usePOS();

  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Sembako');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdMinAlert, setNewProdMinAlert] = useState('5');
  const [newProdUnit, setNewProdUnit] = useState('pcs');
  const [newProdBarcode, setNewProdBarcode] = useState('');

  // Inventory analytics KPIs
  const kpis = useMemo(() => {
    let totalAssetCost = 0;
    let totalPotentialRevenue = 0;
    let lowCount = 0;
    let outCount = 0;

    products.forEach((p) => {
      totalAssetCost += p.stock * p.costPrice;
      totalPotentialRevenue += p.stock * p.price;
      if (p.stock <= 0) outCount++;
      else if (p.stock <= p.minStockAlert) lowCount++;
    });

    return {
      totalAssetCost,
      totalPotentialRevenue,
      totalProducts: products.length,
      lowCount,
      outCount,
      potentialProfit: totalPotentialRevenue - totalAssetCost,
    };
  }, [products]);

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === 'low') return p.stock > 0 && p.stock <= p.minStockAlert;
      if (filterStatus === 'out') return p.stock <= 0;
      return true;
    });
  }, [products, search, filterStatus]);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice || !newProdCost) return;

    const barcodeVal =
      newProdBarcode.trim() || `899${Math.floor(100000000 + Math.random() * 900000000)}`;

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseInt(newProdPrice, 10) || 0,
      costPrice: parseInt(newProdCost, 10) || 0,
      stock: parseInt(newProdStock, 10) || 0,
      minStockAlert: parseInt(newProdMinAlert, 10) || 5,
      unit: newProdUnit,
      barcode: barcodeVal,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    });

    setIsAddModalOpen(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCost('');
    setNewProdStock('');
    setNewProdBarcode('');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    updateProductStock(
      restockProduct.id,
      restockProduct.stock + restockQty,
      `Restock manual +${restockQty} ${restockProduct.unit}`
    );
    setRestockProduct(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Dasbor Inventaris & Manajemen Stok Barang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau perputaran stok, alert batas menipis, dan nilai aset toko kelontong
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportInventoryToExcel(products)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Stok Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">
            Total Nilai Aset Modal
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(kpis.totalAssetCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {kpis.totalProducts} produk aktif
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">
            Potensi Omzet Keseluruhan
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatRupiah(kpis.totalPotentialRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Potensi Laba: {formatRupiah(kpis.potentialProfit)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-amber-500 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Peringatan Stok Menipis
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {kpis.lowCount} Produk
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Perlu segera dipesan ke supplier
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-rose-500 font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Stok Habis (Kosong)
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {kpis.outCount} Produk
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tidak dapat ditransaksikan di kasir
          </div>
        </div>
      </div>

      {/* Filter and Table container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang atau barcode..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-purple-400 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'low'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              Menipis ({kpis.lowCount})
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'out'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              Habis ({kpis.outCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Barcode</th>
                <th className="p-3 text-right">Harga Modal</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-center">Sisa Stok</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p) => {
                const stockStatus = checkStockStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/sabun_lifebuoy.jpg';
                          }}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Terjual: {p.soldCount} {p.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {p.category}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {p.barcode}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-500">
                      {formatRupiah(p.costPrice)}
                    </td>
                    <td className="p-3 text-right font-bold text-purple-700 dark:text-purple-300">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {p.stock}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">{p.unit}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockStatus.badgeClass}`}
                      >
                        {stockStatus.statusText}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setRestockProduct(p)}
                        className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-[#582be8] dark:text-purple-300 font-bold rounded-lg border border-purple-200 dark:border-purple-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Tambah Barang Kelontong Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Terigu Segitiga Biru 1kg"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Sembako">Sembako</option>
                    <option value="Makanan & Mie">Makanan & Mie</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Bumbu Dapur">Bumbu Dapur</option>
                    <option value="Sabun & Cuci">Sabun & Cuci</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="kg / pcs / renceng"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Harga Modal (Beli)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(e.target.value)}
                    placeholder="Contoh: 12000"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Harga Jual Kasir
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Contoh: 14500"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jumlah Stok Masuk
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="Contoh: 20"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Batas Alert Min.
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdMinAlert}
                    onChange={(e) => setNewProdMinAlert(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Barcode (Opsional)
                </label>
                <input
                  type="text"
                  value={newProdBarcode}
                  onChange={(e) => setNewProdBarcode(e.target.value)}
                  placeholder="Scan atau kosongkan untuk generate otomatis"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
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
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Restock Stok Barang
            </h3>
            <p className="text-xs text-slate-500">
              Menambahkan stok untuk: <strong>{restockProduct.name}</strong> (Stok saat ini: {restockProduct.stock} {restockProduct.unit})
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jumlah Tambahan ({restockProduct.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="flex gap-1.5">
                {[5, 10, 25, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRestockQty(num)}
                    className="flex-1 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg font-bold"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-[#582be8] hover:bg-[#4820c7] text-white font-bold rounded-xl shadow-md"
                >
                  Konfirmasi Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
