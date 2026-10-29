export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  barcode: string;
  imageUrl: string;
  rating?: number;
  soldCount: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountAmount?: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  memberTier: 'Regular' | 'Silver' | 'Gold' | 'VIP';
  discountPercent: number;
  totalSpent: number;
  notes?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO string
  items: {
    productId: string;
    productName: string;
    price: number;
    costPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  tax: number;
  total: number;
  profit: number;
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'kasbon';
  cashPaid?: number;
  cashChange?: number;
  customer?: Customer;
  cashierName: string;
  syncedToCloud: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'stock_warning' | 'sync' | 'sale' | 'security';
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export type UserRole = 'manager' | 'cashier';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  shift: string;
  avatar: string;
}

export type ActiveTab = 
  | 'pos'
  | 'inventory'
  | 'history'
  | 'analytics'
  | 'discounts'
  | 'security'
  | 'settings';

