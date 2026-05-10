import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Map, Layout, Box } from 'lucide-react';
import { WarehouseLocation } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

interface LocationManagerProps {
  locations: WarehouseLocation[];
  onAdd: (location: Partial<WarehouseLocation>) => void;
  onDelete: (id: string) => void;
}

export default function LocationManager({ locations, onAdd, onDelete }: LocationManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    
    onAdd({
      name: newLocName,
      description: newLocDesc,
      status: 'active'
    });
    
    setNewLocName('');
    setNewLocDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-display font-bold text-theme-text">Storage Locations 📍</h3>
          <p className="text-theme-muted font-medium mt-1">Define where your "honey" is stored.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-brand-ink dark:bg-white text-white dark:text-brand-ink rounded-3xl font-bold hover:shadow-2xl transition-all shadow-xl active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create Zone
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-amber-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-amber-100 dark:border-slate-800 animate-in slide-in-from-top-6 duration-500">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-bold text-theme-text opacity-70 uppercase tracking-widest px-2">Location Name</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-dim" />
                <input
                  required
                  type="text"
                  value={newLocName}
                  onChange={e => setNewLocName(e.target.value)}
                  placeholder="e.g. Warehouse A"
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-theme-text font-bold transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-[10px] font-bold text-theme-text opacity-70 uppercase tracking-widest px-2">Description (Optional)</label>
              <input
                type="text"
                value={newLocDesc}
                onChange={e => setNewLocDesc(e.target.value)}
                placeholder="e.g. Shelf 1, Near Entrance"
                className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl focus:border-brand-honey focus:ring-0 outline-none text-theme-text font-bold transition-all"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button
                type="submit"
                className="flex-[2] py-4 bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink font-bold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all"
              >
                Save Zone
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-4 border border-theme-border text-theme-dim font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute -right-6 -bottom-6 text-gray-50 dark:text-slate-800 opacity-20 group-hover:opacity-40 transition-opacity rotate-12">
              <Map className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                    <Layout className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-display font-bold text-theme-text mb-1">{loc.name}</h4>
                    <Badge variant={loc.status === 'active' ? 'success' : 'default'}>
                      {loc.status}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(loc.id)}
                  className="w-10 h-10 bg-theme-secondary text-theme-dim hover:text-rose-50 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {loc.description ? (
                <div className="bg-theme-secondary p-5 rounded-2xl border border-theme-border flex items-start gap-4 shadow-inner">
                   <Box className="w-5 h-5 text-theme-text opacity-40 mt-0.5 shrink-0" />
                   <p className="text-sm font-bold text-theme-text opacity-70 italic leading-relaxed">"{loc.description}"</p>
                </div>
              ) : (
                <div className="py-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !showAddForm && (
        <EmptyState 
          icon={MapPin}
          title="No Storage Zones"
          description="Create your first storage zone to start tracking where your stock is kept."
          action={{
            label: "Create First Zone",
            onClick: () => setShowAddForm(true),
            icon: Plus
          }}
        />
      )}
    </div>
  );
}
