import React, { useState, useEffect } from 'react';
import { Package, Tag, Hash, Boxes, MapPin, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { InventoryItem, WarehouseLocation } from '../../types';
import { Modal } from '../ui/Modal';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  initialData?: InventoryItem | null;
  locations: WarehouseLocation[];
}

export default function InventoryFormModal({ isOpen, onClose, onSave, initialData, locations }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    sku: '',
    category: 'General',
    quantity: 0,
    unit: 'pcs',
    min_stock: 5,
    cost: 0,
    location_id: '',
    status: 'available',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'General',
        quantity: 0,
        unit: 'pcs',
        min_stock: 5,
        cost: 0,
        location_id: '',
        status: 'available',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate status based on quantity and min_stock
    let status: 'available' | 'low stock' | 'out of stock' = 'available';
    if (Number(formData.quantity) <= 0) {
      status = 'out of stock';
    } else if (Number(formData.quantity) <= Number(formData.min_stock)) {
      status = 'low stock';
    }

    onSave({ 
      ...formData, 
      status,
      quantity: Number(formData.quantity),
      min_stock: Number(formData.min_stock),
      cost: Number(formData.cost)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item ✏️' : 'Add New Item 📦'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Item Name</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Raw Fabric"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">SKU / Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
              <input
                required
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SKU-12345"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all appearance-none"
              >
                <option value="Raw Material" className="bg-white dark:bg-slate-900 text-brand-honey">Raw Material</option>
                <option value="Finished Goods" className="bg-white dark:bg-slate-900 text-brand-honey">Finished Goods</option>
                <option value="Work in Progress" className="bg-white dark:bg-slate-900 text-brand-honey">Work in Progress</option>
                <option value="Packaging" className="bg-white dark:bg-slate-900 text-brand-honey">Packaging</option>
                <option value="General" className="bg-white dark:bg-slate-900 text-brand-honey">General</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Unit of Measure</label>
            <div className="relative">
              <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
              <input
                required
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. pcs, kg, boxes"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-amber-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Quantity</label>
              <input
                required
                type="number"
                min="0"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Min Stock</label>
              <input
                required
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={e => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Cost / Unit</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Storage Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
            {locations.length > 0 ? (
              <select
                required
                value={formData.location_id}
                onChange={e => {
                  const loc = locations.find(l => l.id === e.target.value);
                  setFormData({ ...formData, location_id: e.target.value, location_name: loc?.name });
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all appearance-none"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-brand-honey">Select a location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-900 text-brand-honey">{loc.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">Please create a storage location first.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest px-1">Notes</label>
          <div className="relative">
            <FileText className="absolute left-4 top-6 w-4 h-4 text-theme-dim" />
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-brand-honey font-bold transition-all min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-5 border border-gray-200 dark:border-slate-800 text-gray-500 font-bold rounded-3xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={locations.length === 0}
            type="submit"
            className="flex-1 py-5 bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink font-bold rounded-3xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            {initialData ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
