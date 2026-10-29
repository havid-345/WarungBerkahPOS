import { CartItem, Coupon, Customer, Product } from '../types/pos';

export interface CartTotals {
  subtotal: number;
  memberDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  taxOrFee: number;
  finalTotal: number;
  totalProfit: number;
}

/**
 * Calculates accurate cart totals with customer member discount & coupon codes
 */
export function calculateCartTotals(
  items: CartItem[],
  customer: Customer | null,
  coupon: Coupon | null,
  taxOrFeeRate = 0 // By default 0 or small fee
): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const costTotal = items.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);

  // 1. Member discount
  let memberDiscount = 0;
  if (customer && customer.discountPercent > 0) {
    memberDiscount = Math.round((subtotal * customer.discountPercent) / 100);
  }

  // 2. Coupon discount
  let couponDiscount = 0;
  if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
    if (coupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
        couponDiscount = coupon.maxDiscount;
      }
    } else {
      couponDiscount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const totalDiscount = Math.min(memberDiscount + couponDiscount, subtotal);
  const afterDiscount = Math.max(0, subtotal - totalDiscount);
  const taxOrFee = Math.round((afterDiscount * taxOrFeeRate) / 100);
  const finalTotal = afterDiscount + taxOrFee;
  const totalProfit = Math.max(0, finalTotal - costTotal);

  return {
    subtotal,
    memberDiscount,
    couponDiscount,
    totalDiscount,
    taxOrFee,
    finalTotal,
    totalProfit,
  };
}

/**
 * Formats a number to Indonesian Rupiah currency format
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Evaluates stock alert status for an inventory item
 */
export function checkStockStatus(product: Product): {
  isLowStock: boolean;
  isOutOfStock: boolean;
  statusText: string;
  badgeClass: string;
} {
  if (product.stock <= 0) {
    return {
      isLowStock: true,
      isOutOfStock: true,
      statusText: 'Habis',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400',
    };
  }
  if (product.stock <= product.minStockAlert) {
    return {
      isLowStock: true,
      isOutOfStock: false,
      statusText: `Sisa ${product.stock} ${product.unit}`,
      badgeClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400',
    };
  }
  return {
    isLowStock: false,
    isOutOfStock: false,
    statusText: `Stok: ${product.stock} ${product.unit}`,
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400',
  };
}
