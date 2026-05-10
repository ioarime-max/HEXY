import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Star, MapPin, Filter, MessageSquare, ChevronRight, Heart, Plus, Loader2, X, Bookmark, Trash2, Sparkles, AlertTriangle, RefreshCw, Image as ImageIcon, Upload } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '../api';
import { cn } from '../lib/utils';
import { Product, BusinessProfile } from '../types';
import { Modal } from './ui/Modal';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import Logo from './ui/Logo';
import { honeyService } from '../services/honeyService';
import { ProductCard } from './ui/ProductCard';
import { generateProductListing } from '../services/geminiService';

const CATEGORIES = [
  'All', 
  'Fashion', 
  'Food', 
  'Home & Living', 
  'Beauty', 
  'Crafts', 
  'Agri-Biz', 
  'Technology', 
  'Wellness',
  'Snacks',
  'Services', 
  'Events',
  'Automotive'
];

const INITIAL_SME_PRODUCTS: Partial<Product>[] = [];

const EXACT_IMAGE_MAP: Record<string, string> = {
  // Food & Beverage
  "ipoh white coffee": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Ipoh_White_Coffee.jpg",
  "teh sabah vanilla": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Teh_Tarik_in_Malaysia.jpg",
  "asam laksa paste": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Penang_Asom_Laksa.JPG",
  "serunding daging": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Serunding.JPG",
  "kek lapis": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Kek_lapis_Sarawak.jpg",
  "sarawak layer cake": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Kek_lapis_Sarawak.jpg",
  "durian musang king": "https://upload.wikimedia.org/wikipedia/commons/9/90/Durian_kuning.jpg",
  "gula melaka": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Gula_Melaka_Palm_Sugar.jpg",
  "curry puff": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Karipap.jpg",
  "kuih bahulu": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Kuih_bahulu.jpg",
  "otak-otak": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Otak_otak_Indo.jpg",
  "banana chips": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800",
  "strawberry jam": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800",
  "white pepper": "https://upload.wikimedia.org/wikipedia/commons/6/61/White_pepercorns.jpg",
  "coffee beans": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
  "honey kelulut": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Pot-honey_of_stingless_bees.jpg",

  // Fashion & Accessories
  "songket wallet": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800",
  "peranakan beadwork slippers": "https://upload.wikimedia.org/wikipedia/commons/1/18/Peranakan_slippers.jpg",
  "handmade batik tote bag": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
  "batik silk scarf": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800",
  "premium songket bow tie": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800",
  "handmade rattan sun hat": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
  "jubah": "https://images.unsplash.com/photo-1606131731446-5568d87113aa?auto=format&fit=crop&q=80&w=800",

  // Crafts & Home
  "wau bulan": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Wau_bulan.JPG",
  "mengkuang floor mat": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Anyaman_pandankat_Terengganu.JPG",
  "bamboo tissue holder": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&q=80&w=800",
  "coconut shell bowl": "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&q=80&w=800",
  "handmade pandan basket": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800",
  "Malaysian rattan chair": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
  "mini wau keychain": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Miniature_Wau_Bulan.jpg",

  // Beauty & Wellness
  "skin mist": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
  "charcoal soap": "https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&q=80&w=800",
  "turmeric powder mask": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
  "pure cold-pressed coconut oil": "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&q=80&w=800",
  "roselle herbal tea": "https://images.unsplash.com/photo-1544787210-282713e82ef3?auto=format&fit=crop&q=80&w=800",

  // Others
  "organic seaweed fertilizer": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
  "complete business stationery kit": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
};

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  crafts: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
  "home & living": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  business: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
  "agri-biz": "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  snacks: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
};

const getProductImage = (product: Product) => {
  const name = product.name?.toLowerCase().trim() || "";
  const category = product.category?.toLowerCase().trim() || "";
  const image_url = product.image_url || "";

  // 1. Use existing URL if it's already a full clear web URL or base64 data
  if (image_url && (image_url.startsWith('http') || image_url.startsWith('https') || image_url.startsWith('data:'))) {
    // If it's a generic unsplash keyword URL, we might want to override it with our map for better precision
    if (image_url.includes('source.unsplash.com/featured')) {
      // Continue to exact mapping
    } else {
      return image_url;
    }
  }

  // 2. Exact product image matching from our high-fidelity map
  for (const key in EXACT_IMAGE_MAP) {
    if (name.includes(key)) {
      return EXACT_IMAGE_MAP[key];
    }
  }

  // 3. Keyword-level fallbacks for common Malaysian terms
  if (name.includes("wallet")) return "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800";
  if (name.includes("cake") || name.includes("kek") || name.includes("biscuit") || name.includes("tart")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800";
  if (name.includes("sambal") || name.includes("paste") || name.includes("sauce")) return "https://upload.wikimedia.org/wikipedia/commons/d/df/Sambal_terasi.jpg";
  if (name.includes("honey")) return "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800";
  if (name.includes("coffee")) return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800";
  if (name.includes("pepper") || name.includes("spice") || name.includes("rub")) return "https://upload.wikimedia.org/wikipedia/commons/6/61/White_pepercorns.jpg";
  if (name.includes("basket") || name.includes("rattan") || name.includes("bamboo") || name.includes("woven")) return "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=800";
  if (name.includes("batik") || name.includes("scarf") || name.includes("kebaya") || name.includes("tote")) return "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800";
  if (name.includes("soap") || name.includes("mist") || name.includes("mask") || name.includes("beauty")) return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800";

  // 4. Category fallback from high-quality curated links
  return CATEGORY_FALLBACK_IMAGE[category] || 
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=800";
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<BusinessProfile | null>(null);
  const [prodToDelete, setProdToDelete] = useState<string | null>(null);
  const [discountClaimed, setDiscountClaimed] = useState<{ id: string | number, amount: number } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Fashion',
    image: '', // keyword field
    image_url: '' // direct override field
  });

  const loadData = async () => {
    try {
      const [prodData, wishData, profileData] = await Promise.all([
        api.getProducts(),
        api.getWishlist(),
        api.getProfile()
      ]);
      setProducts(prodData);
      setWishlist(wishData);
      setCurrentUser(profileData.user);
      setCurrentProfile(profileData.businessProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      setLoading(true);
      const rating = (Math.random() * (5 - 3) + 3).toFixed(1);
      
      await api.createProduct({
        ...newProduct,
        image_url: newProduct.image_url || getProductImage({ ...newProduct, id: 'temp' } as any),
        rating: Number(rating),
        reviews: Math.floor(Math.random() * 50)
      });
      
      await honeyService.reward('PRODUCT_LISTED', `Listed new treasure: ${newProduct.name}`);
      await loadData();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Fashion',
        image: '',
        image_url: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      await loadData();
      setProdToDelete(null);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWishlist = async (id: string | number) => {
    const item = wishlist.find(w => w.product_id === id);
    if (item) {
      await api.removeFromWishlist(item.id);
    } else {
      await api.addToWishlist(id);
    }
    loadData();
  };

  const handleResetMarketplace = async () => {
    if (!confirm("Are you sure you want to regenerate the entire marketplace? This will restore the default SME treasures.")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset-marketplace', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('honeybee_token')}` }
      });
      if (response.ok) {
        await loadData();
        toast.success("The Hive has been freshly regenerated! 🐝");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to regenerate market.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large! Max 10MB please.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setNewProduct(prev => ({ ...prev, image_url: base64Data }));
      toast.success("Image uploaded successfully! 📸");
      
      // STREAMLINE: Automatically trigger AI analysis if it's a new product
      if (!newProduct.name || newProduct.name === '') {
        await handleAutoAnalysis(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAutoAnalysis = async (imageData: string) => {
    setIsGeneratingAI(true);
    try {
      const result = await generateProductListing(
        CATEGORIES.slice(1), 
        undefined, 
        imageData
      );
      
      setNewProduct(prev => ({
        ...prev,
        name: result.name || prev.name,
        description: result.description,
        category: result.category,
        price: result.price,
        image: result.tags
      }));
      toast.success("AI has identified your treasure! ✨");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAIGenerate = async () => {
    // We allow generation if there's either a name OR an image
    if (!newProduct.name && !newProduct.image_url) {
      toast.error("Please enter a product name or upload an image first!");
      return;
    }

    setIsGeneratingAI(true);
    try {
      // If it's a base64 image, we use it for visual AI
      const isBase64 = newProduct.image_url.startsWith('data:');
      const result = await generateProductListing(
        CATEGORIES.slice(1), 
        newProduct.name || undefined,
        isBase64 ? newProduct.image_url : undefined
      );

      setNewProduct(prev => ({
        ...prev,
        name: result.name || prev.name,
        description: result.description,
        category: result.category,
        price: result.price,
        image: result.tags
      }));
      toast.success("AI has crafted your treasure listing! ✨");
    } catch (err) {
      console.error(err);
      toast.error("AI was a bit shy today. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };



  const filteredProducts = products.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (p.sellerName || (p as any).seller_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-honey" />
          <p className="text-theme-muted font-bold uppercase tracking-[0.2em] text-xs">Market is waking up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight flex items-center gap-4">
            The Hive Market <Logo variant="icon" showText={false} className="bg-transparent shadow-none" />
            <button 
              onClick={handleResetMarketplace}
              className="bg-brand-honey/10 hover:bg-brand-honey/20 text-brand-honey text-[10px] font-black px-4 py-2 rounded-full border border-brand-honey/20 transition-all uppercase tracking-widest flex items-center gap-2 group ml-4"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              Regenerate Market
            </button>
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-theme-muted text-xl font-medium">Buzzing with local treasures from Malaysian SMEs.</p>
            <button 
              onClick={() => navigate('/community?category=Marketplace')}
              className="px-4 py-1.5 bg-brand-honey text-brand-ink text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-honey shadow-sm transition-all"
            >
              Discuss in Forum 🐝
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowWishlist(!showWishlist)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-[2rem] font-bold text-sm transition-all border-2",
              showWishlist 
                ? "bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink border-brand-ink dark:border-amber-400 shadow-xl" 
                : "bg-theme-bg dark:bg-slate-900 text-theme-muted border-theme-border hover:border-brand-honey hover:text-brand-honey"
            )}
          >
            <Heart className={cn("w-5 h-5", showWishlist ? "fill-current" : "text-theme-muted")} />
            {showWishlist ? "All Treasures" : "My Stash"}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-brand-honey text-brand-ink rounded-[2rem] font-bold text-sm hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 shadow-amber-200/20"
          >
            <Plus className="w-5 h-5" /> <span>List Product</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-theme-muted group-focus-within:text-brand-honey transition-colors" />
          <input 
            type="text" 
            placeholder="Search local treasures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-theme-bg dark:bg-slate-900 border-2 border-theme-border/60 rounded-[2rem] focus:border-brand-honey focus:ring-0 transition-all shadow-xl shadow-gray-200/5 dark:shadow-none font-medium text-lg placeholder:text-theme-dim outline-none text-theme-text"
          />
        </div>
        {!showWishlist && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 rounded-[1.5rem] text-sm font-bold whitespace-nowrap transition-all border-2",
                  activeCategory === cat 
                    ? "bg-brand-honey text-brand-ink border-brand-honey shadow-lg scale-105" 
                    : "bg-brand-honey/10 text-brand-honey border-brand-honey/30 shadow-sm hover:scale-105"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {showWishlist ? (
        <div className="bg-theme-bg dark:bg-slate-900/50 p-10 md:p-14 rounded-[4rem] border border-theme-border shadow-2xl space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-display font-bold text-theme-text">The Stash ❤️</h3>
              <Badge variant="warning">{wishlist.length} Items Saved</Badge>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map((item, idx) => {
                const product = products.find(p => p.id === item.product_id);
                if (!product) return null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    className="flex gap-6 bg-theme-card dark:bg-slate-900 p-6 rounded-[2.5rem] border border-transparent hover:border-brand-honey transition-all group shadow-sm border-theme-border"
                  >
                    <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-3xl overflow-hidden shrink-0">
                      <img src={getProductImage(product)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <h4 className="font-bold text-theme-text transition-colors line-clamp-1">{product.name}</h4>
                       <p className="text-[10px] font-bold text-theme-text opacity-70 uppercase tracking-widest">{product.sellerName || (product as any).seller_name}</p>
                       <div className="flex items-center justify-between mt-4">
                          <span className="font-bold text-theme-text text-lg italic transition-colors">RM {product.price}</span>
                          <button 
                    onClick={() => handleToggleWishlist(product.id)}
                    className="p-2 text-theme-text opacity-50 hover:text-rose-500 hover:bg-theme-secondary rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
              {wishlist.length === 0 && (
                <div className="col-span-full py-10">
                  <EmptyState 
                    icon={Heart}
                    title="Your stash is empty"
                    description="Explore the market and save your favorite SME treasures here."
                    action={{
                      label: "Explore Market",
                      onClick: () => setShowWishlist(false),
                      icon: Search
                    }}
                  />
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => {
            const isWishlisted = wishlist.some(w => w.product_id === product.id);
            const isOwner = currentUser && (product.sellerId === currentUser.id || (product as any).user_id === currentUser.id);
            
            return (
              <ProductCard 
                key={product.id}
                product={{
                  ...product,
                  image_url: getProductImage(product)
                }}
                isWishlisted={isWishlisted}
                isOwner={isOwner}
                onClick={setSelectedProduct}
                onToggleWishlist={(e, id) => {
                  e.stopPropagation();
                  handleToggleWishlist(id);
                }}
                onDelete={(e, id) => {
                  e.stopPropagation();
                  setProdToDelete(id);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Sell Your Magic ✨"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8">
           <div className="bg-brand-honey/5 p-4 rounded-2xl border border-brand-honey/10 flex items-center gap-4 -mt-4">
              <div className="w-12 h-12 bg-brand-honey/20 rounded-full flex items-center justify-center text-xl">🪄</div>
              <p className="text-brand-honey text-xs font-bold uppercase tracking-widest leading-relaxed">
                Streamlined Listing: Just upload a photo and our <span className="text-brand-ink dark:text-amber-400">Bee-Vision AI</span> will draft your listing details for you!
              </p>
           </div>

            <div className="flex flex-col md:flex-row gap-10">
               {/* Image Preview / Upload Section */}
               <div className="w-full md:w-2/5 flex flex-col gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-4 flex justify-between items-center">
                      <span>Product Visual</span>
                      {newProduct.image_url && (
                        <button 
                          onClick={() => setNewProduct(prev => ({ ...prev, image_url: '' }))}
                          className="text-rose-500 hover:text-rose-600 transition-colors text-[9px] font-bold uppercase tracking-tighter"
                        >
                          Clear
                        </button>
                      )}
                    </label>
                    <div 
                      className={cn(
                        "relative aspect-[1/1] bg-theme-bg dark:bg-slate-800 rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center text-center p-4 cursor-pointer",
                        isDragging ? "border-brand-honey bg-brand-honey/5 scale-105" : "border-theme-border/50 hover:border-brand-honey"
                      )}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e); }}
                      onClick={() => fileInputRef.current?.click()}>
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileChange} 
                         accept="image/*" 
                         className="hidden" 
                       />
                       {newProduct.image_url || (newProduct.name && getProductImage({ ...newProduct, id: 'preview' } as any)) ? (
                          <>
                             <img 
                                src={newProduct.image_url || getProductImage({ ...newProduct, id: 'preview' } as any)} 
                                alt="Preview" 
                                className={cn(
                                  "absolute inset-0 w-full h-full object-cover transition-all duration-700",
                                  isGeneratingAI ? "opacity-30 scale-110 blur-sm" : "opacity-100 group-hover:scale-110"
                                )}
                                referrerPolicy="no-referrer"
                             />
                             {isGeneratingAI && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-honey/10 backdrop-blur-sm z-10">
                                  <div className="relative">
                                    <div className="w-20 h-20 border-4 border-brand-honey border-t-transparent rounded-full animate-spin"></div>
                                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-brand-honey animate-pulse" />
                                  </div>
                                  <p className="text-brand-honey font-black text-xs uppercase tracking-widest mt-6 animate-bounce">Analyzing Vision...</p>
                                </div>
                             )}
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                                <div className="flex gap-4">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                    className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/40 transition-all flex items-center justify-center"
                                  >
                                    <Upload className="w-6 h-6 text-white" />
                                  </button>
                                  {newProduct.image_url.startsWith('data:') && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleAIGenerate(); }}
                                      disabled={isGeneratingAI}
                                      className="w-14 h-14 bg-brand-honey/80 backdrop-blur-md rounded-2xl hover:bg-brand-honey text-brand-ink transition-all disabled:opacity-50 flex items-center justify-center shadow-lg"
                                      title="Re-run AI Analysis"
                                    >
                                      {isGeneratingAI ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                    </button>
                                  )}
                                </div>
                                <p className="text-white text-[10px] font-bold mt-4 uppercase tracking-widest bg-brand-ink/40 px-3 py-1 rounded-full border border-white/20">Change Photo</p>
                             </div>
                          </>
                       ) : (
                          <div className="space-y-6">
                             <div className="w-24 h-24 bg-brand-honey/10 text-brand-honey rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-inner group-hover:bg-brand-honey/20">
                                <Upload className="w-10 h-10" />
                             </div>
                             <div className="space-y-2">
                               <p className="text-lg text-theme-text font-bold">Snap or Drop Photo</p>
                               <p className="text-[10px] text-theme-muted font-bold uppercase tracking-widest opacity-60">High quality visuals sell 3x faster</p>
                             </div>
                          </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-theme-muted uppercase tracking-widest block ml-6">Or Direct Image Link</label>
                    <input 
                      type="text"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-6 py-4 bg-theme-bg dark:bg-slate-800 border-2 border-theme-border/40 rounded-[2rem] focus:border-brand-honey transition-all outline-none text-xs text-theme-text font-medium"
                    />
                  </div>
               </div>

               <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                       <div className="space-y-3 relative group/field">
                          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-6 flex justify-between items-center group-focus-within/field:text-brand-honey transition-colors">
                            <span>Catchy Title</span>
                            {(newProduct.name || newProduct.image_url) && (
                              <button 
                                onClick={(e) => { e.preventDefault(); handleAIGenerate(); }}
                                disabled={isGeneratingAI}
                                className="flex items-center gap-1.5 text-brand-honey hover:text-amber-600 transition-all font-black uppercase tracking-tighter disabled:opacity-50 group/ai p-1 px-2 bg-brand-honey/10 rounded-lg"
                                title="Refine with AI"
                              >
                                {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 group-hover/ai:rotate-12 transition-transform" />}
                                <span className="text-[9px]">AI Magic</span>
                              </button>
                            )}
                          </label>
                          <input 
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="What are you listing today?"
                            className="w-full px-8 py-5 bg-theme-bg dark:bg-slate-800 border-2 border-transparent rounded-[2.5rem] focus:border-brand-honey transition-all outline-none font-bold text-2xl text-theme-text shadow-xl"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-6">Classification</label>
                          <select 
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-8 py-5 bg-theme-bg dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent focus:border-brand-honey focus:ring-0 font-bold text-base cursor-pointer appearance-none text-theme-text shadow-xl"
                          >
                             {CATEGORIES.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-6">Price (RM)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-theme-muted">RM</span>
                            <input 
                              type="number"
                              value={newProduct.price || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                              placeholder="0.00"
                              className="w-full pl-14 pr-8 py-5 bg-theme-bg dark:bg-slate-800 border-2 border-transparent rounded-[2.5rem] focus:border-brand-honey transition-all outline-none font-display font-bold text-3xl text-theme-text shadow-xl"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-6">The Story (Description)</label>
                       <textarea 
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Craft a story that connects with your buyers..."
                        rows={4}
                        className="w-full px-8 py-6 bg-theme-bg dark:bg-slate-800 border-2 border-transparent rounded-[3rem] focus:border-brand-honey transition-all outline-none font-medium resize-none text-theme-text shadow-xl leading-relaxed"
                       />
                    </div>
                  </div>

                  <div className="pt-8 flex items-center gap-4">
                     <button 
                       onClick={() => setShowAddModal(false)}
                       className="px-8 py-5 bg-theme-bg dark:bg-slate-800 text-theme-muted rounded-[2.5rem] font-bold text-base hover:bg-theme-border transition-all border border-theme-border"
                     >
                        Cancel
                     </button>
                     <button 
                       onClick={handleCreateProduct}
                       disabled={loading || !newProduct.name || !newProduct.price}
                       className="flex-1 py-5 bg-brand-honey text-brand-ink rounded-[2.5rem] font-bold text-xl hover:shadow-2xl hover:scale-[1.02] transition-all shadow-xl shadow-amber-200/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                     >
                       {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                         <>
                           <span>Launch Listing</span>
                           <Sparkles className="w-5 h-5" />
                         </>
                       )}
                     </button>
                  </div>
               </div>
            </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      <AnimatePresence>
      {selectedProduct && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brand-ink/60 dark:bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
        >
           <motion.div 
            initial={{ scale: 0.9, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 100 }}
            className="bg-theme-card dark:bg-slate-900 rounded-[4.5rem] w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-theme-border"
           >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-10 right-10 z-10 w-14 h-14 bg-white/20 dark:bg-slate-800/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-honey hover:text-brand-ink transition-all hover:rotate-90"
              >
                 <X className="w-8 h-8" />
              </button>
              
              <div className="md:w-1/2 h-full bg-gray-100 dark:bg-slate-950 overflow-hidden relative">
                 <img src={getProductImage(selectedProduct)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 to-transparent"></div>
                 <div className="absolute bottom-12 left-12 right-12 text-white space-y-3">
                    <Badge variant="default" className="bg-white/20 backdrop-blur-md border-none">{selectedProduct.category}</Badge>
                    <h3 className="text-5xl font-display font-bold leading-tight">{selectedProduct.name}</h3>
                 </div>
              </div>
              
              <div className="md:w-1/2 h-full p-12 md:p-16 flex flex-col justify-between bg-theme-card dark:bg-slate-900 overflow-y-auto scrollbar-hide">
                 <div className="space-y-12">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <Avatar 
                            src={selectedProduct.sellerAvatar || (selectedProduct as any).seller_avatar} 
                            alt={selectedProduct.sellerName || (selectedProduct as any).seller_name} 
                            size="md" 
                            className="bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700"
                          />
                          <div>
                             <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Master Artisan</p>
                             <h4 className="text-xl font-bold text-theme-text">{selectedProduct.sellerName || (selectedProduct as any).seller_name}</h4>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center gap-1 text-brand-honey justify-end mb-1">
                             {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                          </div>
                          <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">{selectedProduct.reviews || 0} reviews</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h5 className="text-[10px] font-bold text-theme-muted uppercase tracking-widest px-4 border-l-4 border-brand-honey">About this treasure</h5>
                       <p className="text-theme-muted text-lg leading-relaxed font-medium italic">"{selectedProduct.description}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-10 border-y border-theme-border">
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Origin</p>
                          <div className="flex items-center gap-3 font-bold text-theme-text">
                             <MapPin className="w-5 h-5 text-brand-honey" />
                             {selectedProduct.location || 'Local Mart'}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Availability</p>
                          <div className="flex items-center gap-3 font-bold text-theme-text">
                             <ShoppingBag className="w-5 h-5 text-brand-honey" />
                             Stock Ready
                          </div>
                       </div>
                    </div>
                 </div>

                   {/* Honey Discount Section */}
                   {selectedProduct && currentUser && (selectedProduct.sellerId !== currentUser.id && (selectedProduct as any).user_id !== currentUser.id) && !discountClaimed && (
                     <div className="bg-brand-honey/5 border-2 border-dashed border-brand-honey/30 rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-brand-honey rounded-full flex items-center justify-center text-lg animate-bounce">🍯</div>
                              <div>
                                 <h6 className="font-bold text-brand-ink dark:text-brand-honey">Honey Discount</h6>
                                 <p className="text-[10px] font-bold text-amber-700/60 dark:text-amber-500/60 uppercase tracking-widest">Limited SME Benefit</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-black text-brand-ink dark:text-brand-honey">Cost: 100 🍯</p>
                              <p className="text-[9px] font-bold text-amber-700/40">Earned via Buzz</p>
                           </div>
                        </div>
                        <p className="text-sm font-medium text-amber-900/60 dark:text-amber-200/60 italic leading-relaxed">"Redeem 100 Honey Gems for a RM 5.00 discount voucher on this treasure."</p>
                        <button 
                          disabled={(currentProfile?.honey || 0) < 100}
                          onClick={async () => {
                            try {
                              await honeyService.spend(100, `Redeemed voucher for ${selectedProduct.name}`);
                              setDiscountClaimed({ id: selectedProduct.id, amount: 5 });
                              loadData();
                            } catch (err) {
                              alert("Not enough Honey! Earn more by buzzin' in the community.");
                            }
                          }}
                          className="w-full py-4 bg-brand-honey text-brand-ink rounded-2xl font-bold text-sm shadow-lg hover:shadow-brand-honey/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        >
                          {(currentProfile?.honey || 0) < 100 ? 'Need more Honey Gems' : 'Redeem My Honey 🐝'}
                        </button>
                     </div>
                   )}

                   {discountClaimed && selectedProduct && discountClaimed.id === selectedProduct.id && (
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-[2.5rem] p-8 flex items-center gap-6 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                           <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                           <h6 className="text-xl font-display font-bold text-emerald-600">Voucher Applied!</h6>
                           <p className="text-sm font-bold text-emerald-600/60">RM {discountClaimed.amount} has been deducted from your checkout.</p>
                        </div>
                     </div>
                   )}

                   <div className="pt-12 flex items-center gap-6">
                    <div className="flex-1">
                       <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-1 px-4">Investment</p>
                       <div className="flex items-end gap-2">
                         <div className={cn(
                           "font-display font-bold text-theme-text italic transition-all",
                           discountClaimed ? "text-xl line-through opacity-30" : "text-4xl"
                         )}>RM {selectedProduct.price}</div>
                         {discountClaimed && selectedProduct && (
                           <div className="text-4xl font-display font-bold text-emerald-500 italic">
                             RM {Math.max(0, selectedProduct.price - discountClaimed.amount)}
                           </div>
                         )}
                       </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(selectedProduct.id);
                      }}
                      className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all border-2",
                        wishlist.some(w => w.product_id === selectedProduct.id)
                          ? "bg-brand-honey border-brand-honey text-brand-ink shadow-xl"
                          : "bg-theme-bg dark:bg-slate-800 border-theme-border text-theme-text opacity-50 dark:text-gray-600 hover:text-brand-honey"
                      )}
                    >
                       <Heart className={cn("w-8 h-8", wishlist.some(w => w.product_id === selectedProduct.id) && "fill-brand-ink")} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        alert(`Contacting ${selectedProduct.sellerName || (selectedProduct as any).seller_name}...`);
                        setSelectedProduct(null);
                      }}
                      className="px-12 py-6 bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink rounded-[2rem] font-bold text-lg hover:shadow-2xl transition-all shadow-xl"
                    >
                       Say Hello 👋
                    </motion.button>
                 </div>
              </div>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Product Modal */}
      <Modal
        isOpen={!!prodToDelete}
        onClose={() => setProdToDelete(null)}
        title="Remove Listing?"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <p className="text-theme-muted mb-8 font-medium leading-relaxed">
            Are you sure you want to remove this listing? Buyers won't be able to see it anymore.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setProdToDelete(null)}
              className="flex-1 py-4 bg-theme-secondary text-theme-muted font-bold rounded-2xl"
            >
              Wait, No
            </button>
            <button 
              onClick={() => prodToDelete && handleDeleteProduct(prodToDelete)}
              className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-500/20"
            >
              Yes, Remove
            </button>
          </div>
        </div>
      </Modal>

      {filteredProducts.length === 0 && !showWishlist && !loading && (
        <EmptyState 
          icon={ShoppingBag}
          title="Market is Quiet"
          description="We couldn't find any treasures matching your search today."
          action={{
            label: "Clear Search",
            onClick: () => setSearchQuery(''),
            icon: X
          }}
        />
      )}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

