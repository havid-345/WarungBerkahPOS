import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals, checkStockStatus } from './calculations';
import { Product, CartItem, Customer, Coupon } from '../types/pos';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Beras Ramos 5kg',
  category: 'Sembako',
  price: 68000,
  costPrice: 60000,
  stock: 15,
  minStockAlert: 5,
  unit: 'karung',
  barcode: '8991234567890',
  imageUrl: '',
  soldCount: 120,
};

test('calculateCartTotals computes subtotal and profit accurately without discount', () => {
  const items: CartItem[] = [
    { product: mockProduct, quantity: 2 },
  ];
  const totals = calculateCartTotals(items, null, null);

  assert.equal(totals.subtotal, 136000);
  assert.equal(totals.memberDiscount, 0);
  assert.equal(totals.couponDiscount, 0);
  assert.equal(totals.finalTotal, 136000);
  assert.equal(totals.totalProfit, 16000); // (68000 - 60000) * 2 = 16000
});

test('calculateCartTotals applies member and coupon discount correctly with caps', () => {
  const items: CartItem[] = [
    { product: mockProduct, quantity: 2 }, // 136,000
  ];
  const customer: Customer = {
    id: 'cust-1',
    name: 'Bu Ratna',
    phone: '08123456789',
    address: 'Jl. Merpati No. 12',
    memberTier: 'Gold',
    discountPercent: 5, // 5% of 136,000 = 6,800
    totalSpent: 500000,
  };
  const coupon: Coupon = {
    code: 'DISKON10RB',
    description: 'Potongan Rp 10.000',
    discountType: 'fixed',
    discountValue: 10000,
    minOrder: 100000,
    isActive: true,
    expiryDate: '2026-12-31',
  };

  const totals = calculateCartTotals(items, customer, coupon);

  assert.equal(totals.memberDiscount, 6800);
  assert.equal(totals.couponDiscount, 10000);
  assert.equal(totals.totalDiscount, 16800);
  assert.equal(totals.finalTotal, 136000 - 16800);
});

test('checkStockStatus correctly classifies stock alerts', () => {
  const normalStock = { ...mockProduct, stock: 10, minStockAlert: 5 };
  assert.equal(checkStockStatus(normalStock).isLowStock, false);

  const lowStock = { ...mockProduct, stock: 4, minStockAlert: 5 };
  assert.equal(checkStockStatus(lowStock).isLowStock, true);
  assert.equal(checkStockStatus(lowStock).isOutOfStock, false);

  const outOfStock = { ...mockProduct, stock: 0, minStockAlert: 5 };
  assert.equal(checkStockStatus(outOfStock).isOutOfStock, true);
});
