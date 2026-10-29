import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Product,
  CartItem,
  Customer,
  Coupon,
  Transaction,
  PushNotification,
  ActiveTab,
  UserRole,
  StaffUser,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_COUPONS,
  INITIAL_TRANSACTIONS,
  INITIAL_STAFF,
} from '../data/initialData';
import { calculateCartTotals } from '../utils/calculations';
import { sounds } from '../utils/sound';
import { encryptData, decryptData } from '../utils/crypto';

interface POSContextType {
  // Navigation & View
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Products & Stock
  products: Product[];
  lowStockProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'soldCount'>) => void;
  updateProductStock: (productId: string, newStock: number, reason?: string) => void;
  editProduct: (product: Product) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotals: ReturnType<typeof calculateCartTotals>;

  // Customer & Coupon
  customers: Customer[];
  activeCustomer: Customer | null;
  setActiveCustomer: (customer: Customer | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent'>) => void;
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;

  // Transactions & Cash Register Balance
  transactions: Transaction[];
  registerBalance: number;
  adjustRegisterBalance: (amount: number, reason: string) => void;
  completeCheckout: (
    paymentMethod: Transaction['paymentMethod'],
    cashPaid?: number
  ) => { success: boolean; transaction?: Transaction; message?: string };

  // Cloud Sync & Offline
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'pending';
  lastSyncedAt: Date | null;
  pendingSyncCount: number;
  triggerManualSync: () => Promise<void>;

  // Push Notifications
  notifications: PushNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Accessibility & Theme
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: 'normal' | 'large' | 'extralarge';
  setFontSize: (size: 'normal' | 'large' | 'extralarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Modals & Triggers
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (val: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (val: boolean) => void;
  recentCompletedTransaction: Transaction | null;
  setRecentCompletedTransaction: (trx: Transaction | null) => void;

  // Staff Role & Access Control
  currentRole: UserRole;
  activeStaff: StaffUser;
  staffList: StaffUser[];
  switchStaffRole: (targetRole: UserRole, targetStaffId?: string, pin?: string) => { success: boolean; message: string };
  managerPin: string;
  setManagerPin: (pin: string) => void;

  // Security Encryption
  encryptionPassphrase: string;
  setEncryptionPassphrase: (pass: string) => void;
  exportEncryptedVault: () => Promise<string>;
  importEncryptedVault: (ciphertext: string) => Promise<{ success: boolean; message: string }>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PRODUCTS = 'warung_berkah_products_v1';
const LOCAL_STORAGE_KEY_TRANSACTIONS = 'warung_berkah_transactions_v1';
const LOCAL_STORAGE_KEY_CUSTOMERS = 'warung_berkah_customers_v1';
const LOCAL_STORAGE_KEY_COUPONS = 'warung_berkah_coupons_v1';
const LOCAL_STORAGE_KEY_BALANCE = 'warung_berkah_balance_v1';
const LOCAL_STORAGE_KEY_DARKMODE = 'warung_berkah_darkmode_v1';

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [recentCompletedTransaction, setRecentCompletedTransaction] = useState<Transaction | null>(null);

  // Settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DARKMODE);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extralarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('warung-berkah-2026-secure');

  // Core Data
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((p: Product) => {
            if (p.id === 'prod-11') {
              return { ...p, imageUrl: '/assets/sabun_lifebuoy.jpg' };
            }
            if (p.id === 'prod-3' && p.imageUrl && p.imageUrl.includes('photo-1581441363689')) {
              return { ...p, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' };
            }
            return p;
          });
        } catch { /* ignore */ }
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_CUSTOMERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COUPONS);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_COUPONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [registerBalance, setRegisterBalance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BALANCE);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return 12850000; // Starting register balance Rp 12.850.000 (~$12,000 style in image)
  });

  // Staff Role & Access Control
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [currentRole, setCurrentRole] = useState<UserRole>('cashier');
  const [activeStaff, setActiveStaff] = useState<StaffUser>(INITIAL_STAFF[0]);
  const [managerPin, setManagerPin] = useState<string>('1234');

  // Cart & Active Selection
  const [cart, setCart] = useState<CartItem[]>([]);
  // Default to Emi Street 23 / Bu Samantha as displayed on reference image!
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(INITIAL_CUSTOMERS[0]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Cloud & Offline
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'pending'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  // Push Notifications
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Sistem Kasir Aktif',
      message: 'Warung Berkah POS siap beroperasi. Sinkronisasi cloud terhubung.',
      type: 'sync',
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'info',
    },
    {
      id: 'notif-stock-1',
      title: 'Peringatan Stok Rendah!',
      message: 'Sabun Mandi Lifebuoy tersisa hanya 2 batang (di bawah batas minimum 10).',
      type: 'stock_warning',
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'danger',
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BALANCE, JSON.stringify(registerBalance));
  }, [registerBalance]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DARKMODE, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Multi-tab sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('warung_berkah_pos_channel');

    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'SYNC_DATA') {
        if (data.products) setProducts(data.products);
        if (data.transactions) setTransactions(data.transactions);
        if (data.registerBalance) setRegisterBalance(data.registerBalance);
        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Monitor stock alerts & emit notifications
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStockAlert);
  }, [products]);

  const addNotification = useCallback((notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PushNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
    if (soundEnabled && notif.severity === 'danger') {
      sounds.playWarning();
    }
  }, [soundEnabled]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) {
      addNotification({
        title: 'Stok Habis!',
        message: `Produk "${product.name}" saat ini habis. Silakan lakukan restock.`,
        type: 'stock_warning',
        severity: 'danger',
      });
      return false;
    }

    let success = true;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          addNotification({
            title: 'Stok Terbatas',
            message: `Hanya tersisa ${product.stock} ${product.unit} untuk "${product.name}".`,
            type: 'stock_warning',
            severity: 'warning',
          });
          success = false;
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity }];
    });

    if (soundEnabled && success) {
      sounds.playBeep();
    }
    return success;
  }, [addNotification, soundEnabled]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            addNotification({
              title: 'Stok Maksimal',
              message: `Maksimal stok tersedia adalah ${item.product.stock} ${item.product.unit}.`,
              type: 'stock_warning',
              severity: 'warning',
            });
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, [removeFromCart, addNotification]);

  const clearCart = useCallback(() => {
    setCart([]);
    setActiveCoupon(null);
  }, []);

  const cartTotals = useMemo(() => {
    return calculateCartTotals(cart, activeCustomer, activeCoupon);
  }, [cart, activeCustomer, activeCoupon]);

  // Coupon
  const applyCoupon = useCallback((code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'Kode kupon tidak valid atau sudah kedaluwarsa.' };
    }
    const currentSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    if (currentSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Minimal belanja Rp ${found.minOrder.toLocaleString('id-ID')} untuk menggunakan kupon ini.`,
      };
    }
    setActiveCoupon(found);
    return { success: true, message: `Kupon "${found.code}" berhasil diterapkan!` };
  }, [coupons, cart]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  const addCoupon = useCallback((newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    addNotification({
      title: 'Kupon Ditambahkan',
      message: `Kode promo "${newCoupon.code}" telah aktif.`,
      type: 'sync',
      severity: 'success',
    });
  }, [addNotification]);

  // Customer
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'totalSpent'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    setActiveCustomer(newCust);
    addNotification({
      title: 'Pelanggan Terdaftar',
      message: `${newCust.name} (${newCust.memberTier}) berhasil didaftarkan sebagai member!`,
      type: 'sync',
      severity: 'success',
    });
  }, [addNotification]);

  // Stock management
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'soldCount'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      soldCount: 0,
    };
    setProducts((prev) => [newProd, ...prev]);
    addNotification({
      title: 'Produk Baru',
      message: `"${newProd.name}" berhasil ditambahkan ke inventaris.`,
      type: 'sync',
      severity: 'success',
    });
  }, [addNotification]);

  const updateProductStock = useCallback((productId: string, newStock: number, reason = 'Restock barang') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, stock: Math.max(0, newStock) };
          if (updated.stock <= updated.minStockAlert) {
            addNotification({
              title: 'Peringatan Stok Menipis',
              message: `Stok "${updated.name}" tersisa ${updated.stock} ${updated.unit}.`,
              type: 'stock_warning',
              severity: 'warning',
            });
          }
          return updated;
        }
        return p;
      })
    );
    addNotification({
      title: 'Pembaruan Stok',
      message: `Status inventaris diperbarui (${reason}).`,
      type: 'sync',
      severity: 'info',
    });
  }, [addNotification]);

  const editProduct = useCallback((updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const adjustRegisterBalance = useCallback((amount: number, reason: string) => {
    setRegisterBalance((prev) => prev + amount);
    addNotification({
      title: amount >= 0 ? 'Kas Masuk' : 'Tarik Kas',
      message: `${amount >= 0 ? '+' : ''}Rp ${amount.toLocaleString('id-ID')} (${reason})`,
      type: 'sale',
      severity: 'info',
    });
  }, [addNotification]);

  // Staff role switching function
  const switchStaffRole = useCallback(
    (targetRole: UserRole, targetStaffId?: string, pin?: string): { success: boolean; message: string } => {
      // If switching to manager from cashier, verify PIN
      if (targetRole === 'manager' && currentRole !== 'manager') {
        if (pin !== undefined && pin.trim() !== managerPin) {
          return {
            success: false,
            message: 'PIN Manager salah! Silakan coba lagi (PIN default: 1234).',
          };
        }
      }

      const selectedStaff =
        (targetStaffId ? staffList.find((s) => s.id === targetStaffId) : null) ||
        staffList.find((s) => s.role === targetRole) ||
        {
          id: `staff-${targetRole}`,
          name: targetRole === 'manager' ? 'Budi Santoso' : 'Samantha',
          role: targetRole,
          shift: targetRole === 'manager' ? 'Pemilik Toko (Full Access)' : 'Shift Pagi (Kasir Aktif)',
          avatar:
            targetRole === 'manager'
              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        };

      setCurrentRole(targetRole);
      setActiveStaff(selectedStaff);

      addNotification({
        title: 'Hak Akses Berhasil Diubah',
        message: `Mode akses diubah ke: ${
          targetRole === 'manager' ? 'MANAGER (Akses Penuh)' : 'PEGAWAI / KASIR (Operasional)'
        }. Operator aktif: ${selectedStaff.name}.`,
        type: 'security',
        severity: 'info',
      });

      return {
        success: true,
        message: `Berhasil beralih ke hak akses ${targetRole === 'manager' ? 'Manager' : 'Pegawai / Kasir'}.`,
      };
    },
    [currentRole, managerPin, staffList, addNotification]
  );

  // Checkout transaction
  const completeCheckout = useCallback(
    (paymentMethod: Transaction['paymentMethod'], cashPaid?: number) => {
      if (cart.length === 0) {
        return { success: false, message: 'Keranjang belanja masih kosong.' };
      }

      const totals = calculateCartTotals(cart, activeCustomer, activeCoupon);
      const isCash = paymentMethod === 'cash';
      const actualPaid = isCash ? cashPaid ?? totals.finalTotal : totals.finalTotal;

      if (isCash && actualPaid < totals.finalTotal) {
        return { success: false, message: 'Nominal uang tunai kurang dari total belanja!' };
      }

      const cashChange = isCash ? actualPaid - totals.finalTotal : 0;
      const transactionId = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const newTransaction: Transaction = {
        id: transactionId,
        timestamp: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          costPrice: item.product.costPrice,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal: totals.subtotal,
        discountTotal: totals.totalDiscount,
        couponCode: activeCoupon?.code,
        tax: totals.taxOrFee,
        total: totals.finalTotal,
        profit: totals.totalProfit,
        paymentMethod,
        cashPaid: actualPaid,
        cashChange,
        customer: activeCustomer || undefined,
        cashierName: `${activeStaff.name} (${activeStaff.role === 'manager' ? 'Manager' : 'Kasir'})`,
        syncedToCloud: !isOfflineMode,
      };

      // 1. Deduct stock and increment soldCount
      setProducts((prev) =>
        prev.map((prod) => {
          const cartItem = cart.find((i) => i.product.id === prod.id);
          if (!cartItem) return prod;
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          if (newStock <= prod.minStockAlert) {
            addNotification({
              title: 'Stok Menipis!',
              message: `Stok "${prod.name}" sekarang sisa ${newStock} ${prod.unit}! Segera pesan ke supplier.`,
              type: 'stock_warning',
              severity: 'danger',
            });
          }
          return {
            ...prod,
            stock: newStock,
            soldCount: prod.soldCount + cartItem.quantity,
          };
        })
      );

      // 2. Append transaction
      setTransactions((prev) => [newTransaction, ...prev]);

      // 3. Update register balance if cash
      if (paymentMethod === 'cash') {
        setRegisterBalance((prev) => prev + totals.finalTotal);
      }

      // 4. Update customer total spent
      if (activeCustomer) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === activeCustomer.id
              ? { ...c, totalSpent: c.totalSpent + totals.finalTotal }
              : c
          )
        );
      }

      // 5. Sound chime
      if (soundEnabled) {
        sounds.playCashChime();
      }

      // 6. Broadcast to other open tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const ch = new BroadcastChannel('warung_berkah_pos_channel');
          ch.postMessage({
            type: 'SYNC_DATA',
            transactions: [newTransaction, ...transactions],
            registerBalance: registerBalance + (paymentMethod === 'cash' ? totals.finalTotal : 0),
          });
          ch.close();
        } catch {
          // Ignore
        }
      }

      // 7. Push notification
      addNotification({
        title: 'Transaksi Berhasil!',
        message: `ID ${transactionId} senilai Rp ${totals.finalTotal.toLocaleString('id-ID')} (${paymentMethod.toUpperCase()}).`,
        type: 'sale',
        severity: 'success',
      });

      setRecentCompletedTransaction(newTransaction);
      clearCart();
      return { success: true, transaction: newTransaction };
    },
    [
      cart,
      activeCustomer,
      activeCoupon,
      isOfflineMode,
      soundEnabled,
      transactions,
      registerBalance,
      addNotification,
      clearCart,
    ]
  );

  // Manual & auto cloud sync
  const pendingSyncCount = useMemo(() => {
    return transactions.filter((t) => !t.syncedToCloud).length;
  }, [transactions]);

  const triggerManualSync = useCallback(async () => {
    if (isOfflineMode) {
      addNotification({
        title: 'Mode Offline Aktif',
        message: 'Nonaktifkan mode offline terlebih dahulu untuk menyinkronkan data ke cloud.',
        type: 'sync',
        severity: 'warning',
      });
      return;
    }

    setCloudSyncStatus('syncing');
    await new Promise((r) => setTimeout(r, 1200));

    // Mark all as synced
    setTransactions((prev) => prev.map((t) => ({ ...t, syncedToCloud: true })));
    setCloudSyncStatus('synced');
    setLastSyncedAt(new Date());

    addNotification({
      title: 'Sinkronisasi Cloud Berhasil',
      message: 'Seluruh transaksi dan inventaris terbaru telah tersinkronisasi ke server pusat.',
      type: 'sync',
      severity: 'success',
    });
  }, [isOfflineMode, addNotification]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Security Encryption Export & Import
  const exportEncryptedVault = useCallback(async (): Promise<string> => {
    const payload = {
      products,
      transactions,
      customers,
      coupons,
      registerBalance,
      exportedAt: new Date().toISOString(),
      store: 'Warung Berkah POS',
    };
    return await encryptData(payload, encryptionPassphrase);
  }, [products, transactions, customers, coupons, registerBalance, encryptionPassphrase]);

  const importEncryptedVault = useCallback(
    async (ciphertext: string): Promise<{ success: boolean; message: string }> => {
      try {
        const decrypted = await decryptData<{
          products: Product[];
          transactions: Transaction[];
          customers: Customer[];
          coupons: Coupon[];
          registerBalance: number;
        }>(ciphertext, encryptionPassphrase);

        if (!decrypted || !decrypted.products || !decrypted.transactions) {
          return { success: false, message: 'Format enkripsi data cadangan tidak dikenali.' };
        }

        setProducts(decrypted.products);
        setTransactions(decrypted.transactions);
        if (decrypted.customers) setCustomers(decrypted.customers);
        if (decrypted.coupons) setCoupons(decrypted.coupons);
        if (decrypted.registerBalance) setRegisterBalance(decrypted.registerBalance);

        addNotification({
          title: 'Pemulihan Enkripsi Berhasil',
          message: 'Data toko berhasil dipulihkan dari cadangan terenkripsi AES-256.',
          type: 'security',
          severity: 'success',
        });
        return { success: true, message: 'Berhasil memulihkan basis data toko!' };
      } catch {
        return {
          success: false,
          message: 'Kata sandi dekripsi salah atau berkas enkripsi rusak.',
        };
      }
    },
    [encryptionPassphrase, addNotification]
  );

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        products,
        lowStockProducts,
        addProduct,
        updateProductStock,
        editProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotals,
        customers,
        activeCustomer,
        setActiveCustomer,
        addCustomer,
        coupons,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        transactions,
        registerBalance,
        adjustRegisterBalance,
        completeCheckout,
        isOfflineMode,
        setIsOfflineMode,
        cloudSyncStatus,
        lastSyncedAt,
        pendingSyncCount,
        triggerManualSync,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        isDarkMode,
        setIsDarkMode,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        soundEnabled,
        setSoundEnabled,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        recentCompletedTransaction,
        setRecentCompletedTransaction,
        encryptionPassphrase,
        setEncryptionPassphrase,
        exportEncryptedVault,
        importEncryptedVault,
        currentRole,
        activeStaff,
        staffList,
        switchStaffRole,
        managerPin,
        setManagerPin,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
