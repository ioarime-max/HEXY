/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Package, MapPin, Plus, Search, Filter, AlertTriangle, Boxes, Trash2, ArrowRightLeft, Loader2 } from 'lucide-react';
import { InventoryItem, WarehouseLocation } from '../types';
import { api } from '../api';
import InventoryCard from './warehouse/InventoryCard';
import InventoryFormModal from './warehouse/InventoryFormModal';
import LocationManager from './warehouse/LocationManager';
import { cn } from '../lib/utils';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { useOutletContext } from 'react-router-dom';
import SubscriptionWall from './SubscriptionWall';
import { BusinessProfile } from '../types';

export default function Warehouse() {
  const { profile, fetchProfile } = useOutletContext<{ profile: BusinessProfile | null, fetchProfile: () => void }>();
  const [activeTab, setActiveTab] = useState<'inventory' | 'locations'>('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const isSubscribed = profile?.subscription_plan && profile.subscription_plan !== 'Worker Bee';

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, locs] = await Promise.all([
        api.getInventory(),
        api.getLocations()
      ]);
      setInventory(inv);
      setLocations(locs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, itemData);
      } else {
        await api.createInventoryItem(itemData);
      }
      loadData();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteInventoryItem(id);
      loadData();
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLocation = async (locData: Partial<WarehouseLocation>) => {
    try {
      await api.createLocation(locData);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await api.deleteLocation(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete location");
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesLocation = selectedLocation === 'All' || item.location_id === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const categories = ['All', ...new Set(inventory.map(i => i.category))];
  const statuses = ['All', 'available', 'low stock', 'out of stock'];

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-honey" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-brand-honey tracking-tight">Stock Station 📦</h1>
          <p className="text-brand-honey font-bold mt-1 text-lg">Hunt for treasures and track every box in your hive.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-honey uppercase tracking-widest">Total SKU</p>
            <p className="text-2xl font-display font-bold text-brand-honey">{inventory.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-honey uppercase tracking-widest">Low Stock</p>
            <p className="text-2xl font-display font-bold text-brand-honey">
              {inventory.filter(i => i.quantity <= i.min_stock && i.quantity > 0).length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-honey uppercase tracking-widest">Out of Stock</p>
            <p className="text-2xl font-display font-bold text-brand-honey">
              {inventory.filter(i => i.quantity <= 0).length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-honey uppercase tracking-widest">Active Zones</p>
            <p className="text-2xl font-display font-bold text-brand-honey">{locations.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 mb-10 w-fit shadow-md">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all",
            activeTab === 'inventory' ? "bg-brand-honey text-brand-ink shadow-lg" : "text-brand-honey/60 hover:bg-brand-honey/10 hover:text-brand-honey"
          )}
        >
          <Boxes className="w-4 h-4" />
          Inventory List
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all",
            activeTab === 'locations' ? "bg-brand-honey text-brand-ink shadow-lg" : "text-brand-honey/60 hover:bg-brand-honey/10 hover:text-brand-honey"
          )}
        >
          <MapPin className="w-4 h-4" />
          Location Manager
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-8">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-brand-honey/20 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-honey" />
                <input 
                  type="text" 
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-brand-honey/5 border border-brand-honey/20 rounded-2xl focus:border-brand-honey focus:ring-0 transition-all outline-none text-brand-honey font-bold shadow-inner placeholder:text-brand-honey/60"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-honey/10 rounded-2xl border border-brand-honey/20 italic text-brand-honey text-xs font-bold">
                <Filter className="w-4 h-4" />
                Quick Filters
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-honey/5 border border-brand-honey/20 rounded-xl outline-none font-bold text-sm text-brand-honey appearance-none"
                >
                  {categories.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-brand-honey">{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-honey/5 border border-brand-honey/20 rounded-xl outline-none font-bold text-sm text-brand-honey appearance-none"
                >
                  {statuses.map(status => <option key={status} value={status} className="bg-white dark:bg-slate-900 text-brand-honey">{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-brand-honey uppercase tracking-widest ml-1">Location</label>
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-honey/5 border border-brand-honey/20 rounded-xl outline-none font-bold text-sm text-brand-honey appearance-none"
                >
                  <option value="All" className="bg-white dark:bg-slate-900 text-brand-honey">All Locations</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-900 text-brand-honey">{loc.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredInventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInventory.map(item => (
                <InventoryCard 
                  key={item.id} 
                  item={item} 
                  onEdit={(i) => {
                    setEditingItem(i);
                    setIsModalOpen(true);
                  }}
                  onDelete={setItemToDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Boxes}
              title="No items found"
              description="Your inventory is empty or no items match your current filters."
              action={{
                label: "Add First Item",
                onClick: () => setIsModalOpen(true),
                icon: Plus
              }}
            />
          )}
        </div>
      ) : (
        <LocationManager 
          locations={locations}
          onAdd={handleAddLocation}
          onDelete={handleDeleteLocation}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Item?"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <p className="text-theme-muted mb-8 font-medium leading-relaxed">
            This action cannot be undone. Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-white">"{inventory.find(i => i.id === itemToDelete)?.name}"</span> from your hive?
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setItemToDelete(null)}
              className="flex-1 py-4 bg-gray-50 dark:bg-slate-800 text-theme-dim font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-slate-700"
            >
              Cancel
            </button>
            <button 
              onClick={() => itemToDelete && handleDeleteItem(itemToDelete)}
              className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

      <InventoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        locations={locations}
      />
    </div>
  );
}
