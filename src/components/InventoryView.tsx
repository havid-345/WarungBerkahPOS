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
  Trash2,
  Eye,
  X,
  Barcode,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Crown,
  DollarSign,
  Boxes,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatRupiah, checkStockStatus } from '../utils/calculations';
import { exportInventoryToExcel } from '../utils/exportUtils';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProductStock,
    editProduct,
    deleteProduct,
    currentRole,
    activeStaff,
    switchStaffRole,
    managerPin,
  } = usePOS();

  const isManager = currentRole === 'manager';

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockReason, setRestockReason] = useState<string>('Restock kiriman supplier');

  // Manager PIN Authorization Modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [actionTitle, setActionTitle] = useState('Otorisasi Manager Diperlukan');

  // Form state for Create / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Sembako');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinAlert, setFormMinAlert] = useState('5');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formBarcode, setFormBarcode] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Preset categories
  const categories = [
    'Sembako',
    'Makanan & Mie',
    'Minuman',
    'Bumbu Dapur',
    'Sabun & Cuci',
    'Rokok & Tembakau',
    'Snack & Biskuit',
    'Kebutuhan Rumah',
  ];

  // Preset sample images for convenience
  const presetImages = [
    { label: 'Beras', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80' },
    { label: 'Minyak', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80' },
    { label: 'Gula', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },
    { label: 'Mie Instan', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80' },
    { label: 'Kopi', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80' },
    { label: 'Sabun', url: '/assets/sabun_lifebuoy.jpg' },
  ];

  // Helper to ensure manager role before executing action
  const requireManagerAuth = (action: () => void, description = 'Aksi CRUD') => {
    if (isManager) {
      action();
    } else {
      setActionTitle(`Otorisasi Manager: ${description}`);
      setPinInput('');
      setPinError('');
      setPendingAction(() => action);
      setIsPinModalOpen(true);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === managerPin) {
      // Elevate to manager
      switchStaffRole('manager', undefined, pinInput);
      setIsPinModalOpen(false);
      setPinError('');
      const actionToRun = pendingAction;
      setPendingAction(null);
      if (actionToRun) {
        actionToRun();
      }
    } else {
      setPinError('PIN Manager salah! (PIN default: 1234)');
    }
  };

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
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (filterStatus === 'low') return p.stock > 0 && p.stock <= p.minStockAlert;
      if (filterStatus === 'out') return p.stock <= 0;
      return true;
    });
  }, [products, search, filterStatus, selectedCategory]);

  // Open Create Modal
  const openCreateModal = () => {
    requireManagerAuth(() => {
      setFormName('');
      setFormCategory('Sembako');
      setFormPrice('');
      setFormCost('');
      setFormStock('20');
      setFormMinAlert('5');
      setFormUnit('pcs');
      setFormBarcode(`899${Math.floor(100000000 + Math.random() * 900000000)}`);
      setFormImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
      setFormDescription('');
      setIsAddModalOpen(true);
    }, 'Tambah Barang Baru');
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    requireManagerAuth(() => {
      setEditingProduct(product);
      setFormName(product.name);
      setFormCategory(product.category);
      setFormPrice(product.price.toString());
      setFormCost(product.costPrice.toString());
      setFormStock(product.stock.toString());
      setFormMinAlert(product.minStockAlert.toString());
      setFormUnit(product.unit);
      setFormBarcode(product.barcode);
      setFormImageUrl(product.imageUrl);
      setFormDescription(product.description || '');
    }, `Edit Produk (${product.name})`);
  };

  // Open Delete Modal
  const openDeleteModal = (product: Product) => {
    requireManagerAuth(() => {
      setDeletingProduct(product);
    }, `Hapus Produk (${product.name})`);
  };

  // Open Restock Modal
  const openRestockModal = (product: Product) => {
    requireManagerAuth(() => {
      setRestockProduct(product);
      setRestockQty(10);
      setRestockReason('Restock kiriman supplier');
    }, `Restock Barang (${product.name})`);
  };

  // Submit Create Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formCost) return;

    const barcodeVal =
      formBarcode.trim() || `899${Math.floor(100000000 + Math.random() * 900000000)}`;

    addProduct({
      name: formName.trim(),
      category: formCategory,
      price: parseInt(formPrice, 10) || 0,
      costPrice: parseInt(formCost, 10) || 0,
      stock: parseInt(formStock, 10) || 0,
      minStockAlert: parseInt(formMinAlert, 10) || 5,
      unit: formUnit.trim() || 'pcs',
      barcode: barcodeVal,
      imageUrl: formImageUrl.trim() || '/assets/sabun_lifebuoy.jpg',
      description: formDescription.trim(),
    });

    setIsAddModalOpen(false);
  };

  // Submit Edit Product
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !formName.trim() || !formPrice || !formCost) return;

    editProduct({
      ...editingProduct,
      name: formName.trim(),
      category: formCategory,
      price: parseInt(formPrice, 10) || 0,
      costPrice: parseInt(formCost, 10) || 0,
      stock: parseInt(formStock, 10) || 0,
      minStockAlert: parseInt(formMinAlert, 10) || 5,
      unit: formUnit.trim() || 'pcs',
      barcode: formBarcode.trim() || editingProduct.barcode,
      imageUrl: formImageUrl.trim() || editingProduct.imageUrl,
      description: formDescription.trim(),
    });

    setEditingProduct(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  // Submit Restock
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    updateProductStock(
      restockProduct.id,
      restockProduct.stock + restockQty,
      restockReason || `Restock manual +${restockQty} ${restockProduct.unit}`
    );
    setRestockProduct(null);
  };

  // Form Margin Calculation helper
  const formCostNum = parseInt(formCost, 10) || 0;
  const formPriceNum = parseInt(formPrice, 10) || 0;
  const formMarginRp = formPriceNum - formCostNum;
  const formMarginPercent = formCostNum > 0 ? Math.round((formMarginRp / formCostNum) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* 1. ROLE & PERMISSION BANNER */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isManager
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-purple-500/10 border-amber-300/60 dark:border-amber-600/30'
            : 'bg-purple-50/70 dark:bg-slate-800/80 border-purple-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isManager
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                : 'bg-purple-600 text-white shadow-purple-600/30'
            }`}
          >
            {isManager ? <Crown className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {isManager ? 'Mode Akses: MANAGER (Akses CRUD Lengkap)' : 'Mode Akses: KASIR (Hanya Baca)'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isManager
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200'
                }`}
              >
                {isManager ? 'Full Manager' : 'Restricted'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isManager
                ? 'Anda berhak menambah (Create), membaca (Read), mengubah (Update), dan menghapus (Delete) stok produk.'
                : 'Fitur Create, Update, dan Delete dikunci khusus Manager toko. Anda dapat melihat (Read) data stok dan detail.'}
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Button */}
        <div>
          {isManager ? (
            <button
              onClick={() => switchStaffRole('cashier')}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Beralih ke Kasir</span>
            </button>
          ) : (
            <button
              onClick={() => requireManagerAuth(() => {}, 'Buka Akses Manager')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Buka Akses Manager (PIN: 1234)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Dasbor Inventaris & Manajemen Stok Barang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau perputaran stok, alert batas menipis, dan kelola katalog produk toko kelontong
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

          {/* CREATE PRODUCT BUTTON */}
          <button
            onClick={openCreateModal}
            title={isManager ? 'Tambah Barang Baru' : 'Khusus Manager (Klik untuk masukkan PIN)'}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isManager
                ? 'bg-[#582be8] hover:bg-[#4820c7] text-white shadow-purple-600/20'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
            }`}
          >
            {isManager ? (
              <Plus className="w-4 h-4 stroke-[3]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-purple-600" />
            )}
            <span>Tambah Barang Baru</span>
            {!isManager && (
              <span className="text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.2 rounded font-bold">
                Manager
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Nilai Aset Modal</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRupiah(kpis.totalAssetCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dari {kpis.totalProducts} produk aktif</div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Potensi Omzet Keseluruhan</span>
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
          <div className="text-[11px] text-slate-400 mt-1">Perlu segera dipesan ke supplier</div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold text-rose-500 font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Stok Habis (Kosong)
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {kpis.outCount} Produk
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tidak dapat ditransaksikan di kasir</div>
        </div>
      </div>

      {/* 4. FILTER & TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Controls: Search, Category, Status filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama barang atau barcode..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-purple-400 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-purple-400 focus:outline-none text-slate-900 dark:text-white font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start lg:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'low'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              Menipis ({kpis.lowCount})
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'out'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              Habis ({kpis.outCount})
            </button>
          </div>
        </div>

        {/* 5. TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-100 dark:border-slate-700/80 font-bold">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Barcode</th>
                <th className="p-3 text-right">Harga Modal</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-center">Sisa Stok</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const stockStatus = checkStockStatus(p);
                  const marginRp = p.price - p.costPrice;
                  const marginPercent = p.costPrice > 0 ? Math.round((marginRp / p.costPrice) * 100) : 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-purple-50/30 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Product */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/sabun_lifebuoy.jpg';
                            }}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white leading-snug">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>Terjual: {p.soldCount} {p.unit}</span>
                              {p.description && (
                                <span className="truncate max-w-[150px] text-slate-400">
                                  • {p.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                        {p.category}
                      </td>

                      {/* Barcode */}
                      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {p.barcode}
                      </td>

                      {/* Cost Price */}
                      <td className="p-3 text-right font-medium text-slate-500 dark:text-slate-400 font-mono">
                        {formatRupiah(p.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="p-3 text-right">
                        <div className="font-bold text-purple-700 dark:text-purple-300 font-mono">
                          {formatRupiah(p.price)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                          +{formatRupiah(marginRp)} ({marginPercent}%)
                        </div>
                      </td>

                      {/* Sisa Stok */}
                      <td className="p-3 text-center">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {p.stock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-medium">{p.unit}</span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockStatus.badgeClass}`}
                        >
                          {stockStatus.statusText}
                        </span>
                      </td>

                      {/* Action buttons (CRUD) */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* READ: Detail (Available to all) */}
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="Lihat Detail Produk (Read)"
                            className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* UPDATE: Restock */}
                          <button
                            onClick={() => openRestockModal(p)}
                            title={isManager ? 'Restock Cepat (Update Stok)' : 'Restock (Khusus Manager)'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isManager
                                ? 'text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-950/60'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* UPDATE: Edit Details */}
                          <button
                            onClick={() => openEditModal(p)}
                            title={isManager ? 'Ubah Data Produk (Update)' : 'Edit Produk (Khusus Manager)'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isManager
                                ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE: Delete Product */}
                          <button
                            onClick={() => openDeleteModal(p)}
                            title={isManager ? 'Hapus Produk (Delete)' : 'Hapus Produk (Khusus Manager)'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isManager
                                ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/60'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODALS SECTION
         ========================================================================= */}

      {/* A. MANAGER PIN AUTHORIZATION MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-purple-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600">
                <Crown className="w-5 h-5" />
              </div>
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPendingAction(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {actionTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Operasi CRUD stok barang hanya dapat dilakukan oleh <strong>Manager</strong>. Silakan masukkan PIN Manager untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  PIN Manager (4 Digit)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan PIN (Default: 1234)"
                  className="w-full px-4 py-2.5 text-center text-lg tracking-widest bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-purple-500 font-mono text-slate-900 dark:text-white"
                />
                {pinError && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5">{pinError}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Tips: PIN default sistem adalah <span className="font-mono font-bold text-amber-600">1234</span>
                </p>
              </div>

              {/* Number keypad for convenience */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((btn) => (
                  <button
                    key={String(btn)}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setPinInput('');
                        setPinError('');
                      } else if (btn === '←') {
                        setPinInput((prev) => prev.slice(0, -1));
                      } else {
                        if (pinInput.length < 6) {
                          setPinInput((prev) => prev + String(btn));
                        }
                      }
                    }}
                    className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-mono font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Verifikasi PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. CREATE PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    Tambah Barang Kelontong Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">Otorisasi Manager: {activeStaff.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Kapal Api Spesial Mix 10x24g"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="pcs / kg / bungkus / botol"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Pricing & Profit Margin Preview */}
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 rounded-2xl space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Harga Modal / Beli (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      placeholder="12000"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Harga Jual Kasir (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="14500"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-purple-700 dark:text-purple-300 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-purple-200/50 dark:border-purple-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Estimasi Margin Keuntungan:</span>
                  <span
                    className={`font-mono font-bold ${
                      formMarginRp >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    +{formatRupiah(formMarginRp)} ({formMarginPercent}%)
                  </span>
                </div>
              </div>

              {/* Stock and Min Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Stok Awal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Batas Peringatan Menipis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Barcode & Auto-generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Kode Barcode EAN / SKU
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormBarcode(`899${Math.floor(100000000 + Math.random() * 900000000)}`)
                    }
                    className="text-[10px] text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Generate Barcode Acak
                  </button>
                </div>
                <input
                  type="text"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  placeholder="899..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono text-[11px]"
                />
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-400 shrink-0">Preset Cepat:</span>
                  {presetImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormImageUrl(img.url)}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-600 dark:text-slate-300 text-[10px] rounded-md font-medium shrink-0 cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan / Lokasi Rak (Opsional)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Rak A2 Lorong Tengah"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Produk Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. EDIT PRODUCT MODAL (UPDATE) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    Edit Data Produk: {editingProduct.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">Otorisasi Manager: {activeStaff.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Pricing & Profit Margin Preview */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/60 rounded-2xl space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Harga Modal / Beli (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Harga Jual Kasir (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-purple-700 dark:text-purple-300 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200/50 dark:border-blue-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Estimasi Margin Keuntungan:</span>
                  <span
                    className={`font-mono font-bold ${
                      formMarginRp >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    +{formatRupiah(formMarginRp)} ({formMarginPercent}%)
                  </span>
                </div>
              </div>

              {/* Stock and Min Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sisa Stok Fisik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Batas Peringatan Menipis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kode Barcode EAN / SKU
                </label>
                <input
                  type="text"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan / Lokasi Rak
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. VIEW PRODUCT DETAIL MODAL (READ) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
              <img
                src={viewingProduct.imageUrl}
                alt={viewingProduct.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/sabun_lifebuoy.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-purple-700 dark:text-purple-300 backdrop-blur-xs shadow-xs">
                  {viewingProduct.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/60 text-white backdrop-blur-xs">
                  {viewingProduct.barcode}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {viewingProduct.name}
                </h3>
                {viewingProduct.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {viewingProduct.description}
                  </p>
                )}
              </div>

              {/* Price & Margins Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Harga Modal (Beli)</span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {formatRupiah(viewingProduct.costPrice)}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Harga Jual Kasir</span>
                  <div className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    {formatRupiah(viewingProduct.price)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 col-span-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Keuntungan per Unit:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatRupiah(viewingProduct.price - viewingProduct.costPrice)} (
                    {viewingProduct.costPrice > 0
                      ? Math.round(
                          ((viewingProduct.price - viewingProduct.costPrice) /
                            viewingProduct.costPrice) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              </div>

              {/* Stock Specs */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Sisa Stok</span>
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {viewingProduct.stock}
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">{viewingProduct.unit}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Alert Batas</span>
                  <span className="font-black text-base text-amber-600">
                    {viewingProduct.minStockAlert}
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">{viewingProduct.unit}</span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Total Terjual</span>
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {viewingProduct.soldCount}
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">{viewingProduct.unit}</span>
                </div>
              </div>

              {/* Total Stock Asset Value */}
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Total Nilai Aset Stok Fisik:
                </span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {formatRupiah(viewingProduct.stock * viewingProduct.costPrice)}
                </span>
              </div>

              {/* Action buttons inside detail */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const prod = viewingProduct;
                      setViewingProduct(null);
                      openRestockModal(prod);
                    }}
                    className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>

                  <button
                    onClick={() => {
                      const prod = viewingProduct;
                      setViewingProduct(null);
                      openEditModal(prod);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E. DELETE CONFIRMATION MODAL (DELETE) */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-rose-200 dark:border-rose-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setDeletingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Hapus Produk dari Inventaris?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Anda akan menghapus produk <strong className="text-slate-800 dark:text-slate-200">"{deletingProduct.name}"</strong> ({deletingProduct.barcode}). Tindakan ini hanya dapat dilakukan oleh Manager dan tidak dapat dibatalkan.
              </p>
            </div>

            {deletingProduct.stock > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Peringatan Stok Fisik:</strong> Masih tercatat{' '}
                  <span className="font-black">
                    {deletingProduct.stock} {deletingProduct.unit}
                  </span>{' '}
                  stok di gudang / toko.
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F. RESTOCK MODAL (UPDATE STOCK) */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Restock Stok Barang
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Produk: <strong>{restockProduct.name}</strong> (Stok saat ini: {restockProduct.stock} {restockProduct.unit})
              </p>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jumlah Tambahan ({restockProduct.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-1.5">
                {[5, 10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRestockQty(num)}
                    className="flex-1 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-200 rounded-lg font-bold cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Keterangan Restock:
                </label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  placeholder="Restock kiriman supplier"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white font-bold rounded-xl shadow-md cursor-pointer"
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
