import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onToggleWishlist: (e: React.MouseEvent, id: string | number) => void;
  isWishlisted: boolean;
  isOwner?: boolean;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

export const ProductCard = ({ 
  product, 
  onClick, 
  onToggleWishlist, 
  isWishlisted, 
  isOwner,
  onDelete
}: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-[#0B0E14] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-brand-honey/20 cursor-pointer flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-900/50">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 z-10">
            <div className="w-full h-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-brand-honey/20 animate-spin" />
            </div>
          </div>
        )}

        <img 
          src={product.image_url || product.image} 
          alt={product.name} 
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
            imageError && "grayscale blur-sm opacity-50"
          )}
          referrerPolicy="no-referrer"
        />
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
            {product.category}
          </div>
        </div>

        {/* Favorite Icon */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={(e) => onToggleWishlist(e, product.id)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/20 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-95",
              isWishlisted ? "text-rose-500 border-rose-500/20 bg-rose-500/10" : "text-white/60 hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Local SME Label */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-brand-honey/90 backdrop-blur-sm px-3 py-1 rounded-md text-[9px] font-black text-brand-ink uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-black/20">
            <Sparkles className="w-3 h-3" />
            LOCAL SME
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              {product.sellerName || 'SME Store'}
            </p>
            <h3 className="text-lg font-bold text-gray-100 leading-tight line-clamp-2 transition-colors group-hover:text-brand-honey">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Investment</span>
              <span className="text-2xl font-black text-brand-honey italic">
                RM <span className="text-3xl font-display">{product.price}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-white">{product.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full py-4 bg-brand-honey text-brand-ink rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all active:scale-95 group-hover:translate-y-[-2px]">
          Explore Deal ⚡
        </button>
      </div>

      {/* Owner Badge */}
      {isOwner && (
        <div className="absolute -right-12 top-6 bg-brand-honey text-brand-ink px-14 py-1 rotate-45 text-[8px] font-black uppercase tracking-widest shadow-xl">
          MINE
        </div>
      )}
    </motion.div>
  );
};
