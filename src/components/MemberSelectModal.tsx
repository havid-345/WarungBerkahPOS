import React, { useState } from 'react';
import { X, UserPlus, Check, User, Sparkles } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Customer } from '../types/pos';
import { formatRupiah } from '../utils/calculations';

interface MemberSelectModalProps {
  onClose: () => void;
}

export const MemberSelectModal: React.FC<MemberSelectModalProps> = ({ onClose }) => {
  const { customers, activeCustomer, setActiveCustomer, addCustomer } = usePOS();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<Customer['memberTier']>('Silver');

  const handleSelect = (customer: Customer | null) => {
    setActiveCustomer(customer);
    onClose();
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const discountMap = {
      VIP: 5,
      Gold: 3,
      Silver: 2,
      Regular: 0,
    };

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || '08123456789',
      address: address.trim() || 'Alamat Toko Sekitar',
      memberTier: tier,
      discountPercent: discountMap[tier],
    });

    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-800 dark:text-white">
            {isAddingNew ? 'Daftarkan Pelanggan Baru' : 'Pilih Pelanggan / Member Kasir'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAddingNew ? (
          <div className="space-y-3">
            {/* General Customer (No member discount) */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                activeCustomer === null
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-white">
                  Pelanggan Umum
                </div>
                <div className="text-[11px] text-slate-400">
                  Tanpa diskon member
                </div>
              </div>
              {activeCustomer === null && <Check className="w-4 h-4 text-purple-600" />}
            </button>

            {/* List of Registered Customers */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {customers.map((c) => {
                const isSelected = activeCustomer?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            {c.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                            {c.memberTier} (-{c.discountPercent}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.address} • Belanja: {formatRupiah(c.totalSpent)}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddingNew(true)}
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Daftarkan Member Baru</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap / Panggilan
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bu Hj. Maryam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nomor WhatsApp / HP
              </label>
              <input
                type="tel"
                placeholder="0812xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Alamat Rumah / Gang
              </label>
              <input
                type="text"
                placeholder="Contoh: Jl. Anggrek No. 5"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tingkat Member (Tier)
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Customer['memberTier'])}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
              >
                <option value="Silver">Member Silver (Diskon 2%)</option>
                <option value="Gold">Member Gold (Diskon 3%)</option>
                <option value="VIP">Member VIP (Diskon 5%)</option>
                <option value="Regular">Regular (0%)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#582be8] hover:bg-[#4820c7] text-white font-bold rounded-xl shadow-md"
              >
                Simpan & Pilih Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
