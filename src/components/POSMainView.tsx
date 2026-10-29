import React from 'react';
import {
  Star,
  Plus,
  Wheat,
  Utensils,
  CupSoda,
  Soup,
  Sparkles,
  Store,
  Tag,
  Barcode,
  AlertCircle,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { CATEGORIES } from '../data/initialData';
import { formatRupiah, checkStockStatus } from '../utils/calculations';
import { Product } from '../types/pos';

export const POSMainView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    addToCart,
    applyCoupon,
    setActiveTab,
  } = usePOS();

  // Filter products by category and search query
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery.trim()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wheat':
        return <Wheat className="w-6 h-6" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6" />;
      case 'CupSoda':
        return <CupSoda className="w-6 h-6" />;
      case 'Soup':
        return <Soup className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Store className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 1. Hero Promo Banner matching the reference's green Mexican/Brazilian banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-green-900 text-white p-6 shadow-xl border border-emerald-600/30">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950">
              WARUNG SPESIAL HARI INI
            </span>
            <span className="text-xs text-emerald-200">
              Update Stok Real-time
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-tight font-serif drop-shadow-sm">
            DISKON SEMBAKO & KEBUTUHAN POKOK
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 mb-4 leading-relaxed">
            Beras Pandan Wangi, Minyak Bimoli 2L & Telur Segar siap jual dengan harga grosir terbaik.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                applyCoupon('JUMATBERKAH');
              }}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Tag className="w-3.5 h-3.5" />
              Pakai Kode: JUMATBERKAH (7% OFF)
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-xs rounded-xl backdrop-blur-sm transition-all"
            >
              Cek Semua Stok
            </button>
          </div>
        </div>

        {/* Decorative background image / graphics */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-25 sm:opacity-40 pointer-events-none mix-blend-screen bg-cover bg-center"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Category Selector matching the reference row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Category / Kategori Barang
          </h3>
          <span className="text-xs text-slate-400">
            {filteredProducts.length} Produk ditemukan
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3.5 min-w-[96px] rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#582be8] text-white border-transparent shadow-lg shadow-purple-500/25 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-600 shadow-sm'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mb-1.5 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Popular Goods Grid matching the reference */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Popular Goods / Produk Terlaris
          </h3>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            See all
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
              Tidak Ada Produk Sesuai Pencarian
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Coba kata kunci lain atau pilih kategori &quot;Semua Produk&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const stockStatus = checkStockStatus(prod);
              return (
                <div
                  key={prod.id}
                  className="group bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/sabun_lifebuoy.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Stock badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border backdrop-blur-md shadow-xs ${stockStatus.badgeClass}`}
                        >
                          {stockStatus.statusText}
                        </span>
                      </div>

                      {/* Barcode badge */}
                      <div className="absolute bottom-2 right-2 opacity-80 hover:opacity-100">
                        <span className="px-1.5 py-0.5 bg-black/70 text-white rounded text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                          <Barcode className="w-3 h-3" />
                          {prod.barcode.slice(-5)}
                        </span>
                      </div>
                    </div>

                    {/* Rating stars matching reference */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 ml-1">
                        ({prod.soldCount} terjual)
                      </span>
                    </div>

                    {/* Product Name */}
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1 mb-2">
                      {prod.category} • {prod.unit}
                    </p>
                  </div>

                  {/* Price & Add to Cart button matching reference */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="text-base font-black text-purple-700 dark:text-purple-300">
                        {formatRupiah(prod.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(prod)}
                      disabled={prod.stock <= 0}
                      aria-label={`Tambah ${prod.name} ke keranjang`}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        prod.stock <= 0
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-[#582be8] hover:bg-[#4820c7] text-white shadow-md shadow-purple-500/20 active:scale-90'
                      }`}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
