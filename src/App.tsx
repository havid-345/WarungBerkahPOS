import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { POSMainView } from './components/POSMainView';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { AnalyticsView } from './components/AnalyticsView';
import { InventoryView } from './components/InventoryView';
import { DiscountManagerView } from './components/DiscountManagerView';
import { HistoryView } from './components/HistoryView';
import { SecurityView } from './components/SecurityView';
import { CashAdjustmentModal } from './components/CashAdjustmentModal';
import { MemberSelectModal } from './components/MemberSelectModal';
import { AccessibilityModal } from './components/AccessibilityModal';

const POSDashboard: React.FC = () => {
  const {
    activeTab,
    fontSize,
    highContrast,
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    products,
    addToCart,
  } = usePOS();

  // Modals state
  const [cashAdjustmentType, setCashAdjustmentType] = useState<'in' | 'out' | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  // Global Keyboard shortcuts & Hardware Barcode Gun listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkeys: F2 (Search), F4 (Barcode Scan), F8 (Checkout), Esc (Close)
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsBarcodeModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsCheckoutModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsBarcodeModalOpen(false);
        setIsCheckoutModalOpen(false);
        setCashAdjustmentType(null);
        setIsMemberModalOpen(false);
        setIsAccessibilityModalOpen(false);
      }

      // Barcode Scanner detection (rapid key inputs)
      const now = Date.now();
      if (now - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 6) {
          // Find matching product
          const matched = products.find((p) => p.barcode === barcodeBuffer);
          if (matched) {
            addToCart(matched, 1);
          }
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart, addToCart, setIsBarcodeModalOpen, setIsCheckoutModalOpen]);

  // Compute root font size class
  const fontSizeClass =
    fontSize === 'extralarge'
      ? 'text-base'
      : fontSize === 'large'
      ? 'text-[15px]'
      : 'text-sm';

  return (
    <div
      className={`min-h-screen bg-[#ede9fe] dark:bg-slate-950 p-2 sm:p-4 lg:p-6 flex items-center justify-center font-sans antialiased selection:bg-purple-500 selection:text-white transition-colors duration-200 ${
        highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Outer Card matching the floating rounded window in the user's reference screenshot */}
      <div
        className={`w-full max-w-[1560px] h-[94vh] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-purple-200/60 dark:border-slate-800 ${fontSizeClass}`}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Left Sidebar matching reference image */}
          <Sidebar />

          {/* 2. Middle Main Section */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/60 dark:bg-slate-900/60">
            {/* Header */}
            <Header onOpenAccessibility={() => setIsAccessibilityModalOpen(true)} />

            {/* Active Tab View */}
            <main className="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'pos' && <POSMainView />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'history' && <HistoryView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'discounts' && <DiscountManagerView />}
              {activeTab === 'security' && <SecurityView />}
            </main>
          </div>

          {/* 3. Right Cart Sidebar matching reference image (shown on POS tab) */}
          {activeTab === 'pos' && (
            <CartSidebar
              onOpenCashAdjustment={(type) => setCashAdjustmentType(type)}
              onOpenMemberSelect={() => setIsMemberModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal />
      <BarcodeScannerModal />

      {cashAdjustmentType && (
        <CashAdjustmentModal
          type={cashAdjustmentType}
          onClose={() => setCashAdjustmentType(null)}
        />
      )}

      {isMemberModalOpen && (
        <MemberSelectModal onClose={() => setIsMemberModalOpen(false)} />
      )}

      {isAccessibilityModalOpen && (
        <AccessibilityModal onClose={() => setIsAccessibilityModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSDashboard />
    </POSProvider>
  );
}
