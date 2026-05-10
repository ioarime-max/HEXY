import { Package, MapPin, Tag, AlertTriangle, Edit2, Trash2, Calendar, MoreVertical } from 'lucide-react';
import { InventoryItem } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export default function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'low stock': return 'warning';
      case 'out of stock': return 'error';
      default: return 'default';
    }
  };

  const isLowStock = item.quantity <= item.min_stock && item.quantity > 0;
  const isOutOfStock = item.quantity <= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
      {/* Decorative Background Icon */}
      <div className="absolute -right-6 -top-6 text-gray-50 dark:text-slate-800/10 opacity-40 group-hover:opacity-60 transition-opacity">
        <Package className="w-32 h-32 rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-110",
              isOutOfStock ? "bg-rose-50 dark:bg-rose-900/30 text-rose-500" : 
              isLowStock ? "bg-amber-50 dark:bg-amber-900/30 text-amber-500" : "bg-brand-honey/10 text-brand-honey border border-brand-honey/20"
            )}>
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-brand-honey leading-tight mb-1">{item.name}</h3>
              <p className="text-[10px] text-brand-honey/60 font-black uppercase tracking-widest">{item.sku}</p>
            </div>
          </div>
          <Badge variant={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}>
            {item.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-brand-honey/5 p-4 rounded-2xl border border-brand-honey/10">
            <p className="text-[9px] text-brand-honey font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Category
            </p>
            <p className="text-xs font-bold text-brand-honey truncate">{item.category}</p>
          </div>
          <div className="bg-brand-honey/5 p-4 rounded-2xl border border-brand-honey/10">
            <p className="text-[9px] text-brand-honey font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="text-xs font-bold text-brand-honey truncate">{item.location_name || 'Unassigned'}</p>
          </div>
        </div>

        <div className="bg-brand-honey text-brand-ink p-5 rounded-3xl mb-8 flex justify-between items-center shadow-xl shadow-amber-500/10 transition-transform group-hover:scale-[1.02]">
          <div>
            <p className="text-[9px] opacity-60 font-black uppercase tracking-[0.2em] mb-1">Quantity</p>
            <p className="text-3xl font-display font-bold">
              {item.quantity} <span className="text-xs opacity-50 ml-1 font-sans">{item.unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] opacity-60 font-black uppercase tracking-[0.2em] mb-1">Est. Value</p>
            <p className="text-xl font-bold">RM {(item.quantity * item.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {item.notes && (
          <p className="text-xs text-theme-muted mb-8 line-clamp-2 italic font-medium leading-relaxed">
             "{item.notes}"
          </p>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-slate-800">
          <div className="flex items-center gap-2 text-gray-300 dark:text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {item.updated_at ? format(new Date(item.updated_at), 'MMM dd, yyyy') : '--'}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(item)}
              className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-theme-dim hover:text-brand-honey hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all flex items-center justify-center"
              title="Edit Item"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="w-10 h-10 bg-gray-50 dark:bg-slate-800 text-theme-dim hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all flex items-center justify-center"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
