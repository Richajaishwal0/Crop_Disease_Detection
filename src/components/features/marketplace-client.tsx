'use client';

import { useUser } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  BadgePercent, 
  FlaskConical, 
  Eye, 
  X, 
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
  Check,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  getMarketplaceProducts, 
  addToCart, 
  getCartItems, 
  removeFromCart, 
  updateCartQuantity,
  initializeMarketplace, 
  MarketplaceProduct 
} from '@/app/actions/marketplace';
import Link from 'next/link';

// Category icons and labels
const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: Sparkles },
  { id: 'Seeds', label: 'Seeds', icon: Tag },
  { id: 'Fertilizers', label: 'Fertilizers', icon: FlaskConical },
  { id: 'Plant Medicine', label: 'Plant Protection', icon: ShieldCheck },
  { id: 'Pesticides', label: 'Pesticides', icon: BadgePercent },
  { id: 'Irrigation', label: 'Irrigation', icon: TrendingUp },
  { id: 'Tools', label: 'Tools & Equipment', icon: Package },
];

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  'Seeds': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  'Fertilizers': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
  'Plant Medicine': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
  'Pesticides': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
  'Irrigation': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80',
  'Tools': 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23961?auto=format&fit=crop&w=600&q=80',
};

export function MarketplaceClient() {
  const { user } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under300' | '300to1000' | 'above1000'>('all');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<MarketplaceProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await initializeMarketplace();
      const productList = await getMarketplaceProducts();
      setProducts(productList);

      if (user) {
        const userCart = await getCartItems(user.uid);
        setCartItems(userCart);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    if (!user) return;
    try {
      const userCart = await getCartItems(user.uid);
      setCartItems(userCart);
    } catch (e) {
      console.error('Failed to reload cart', e);
    }
  };

  // Map of product ID to cart quantity
  const cartQuantityMap = useMemo(() => {
    const map: Record<string, { cartItemId: string; quantity: number }> = {};
    for (const item of cartItems) {
      map[item.productId] = {
        cartItemId: item.id,
        quantity: item.quantity,
      };
    }
    return map;
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 1)), 0);
  }, [cartItems]);

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in Required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    setAddingId(productId);
    try {
      const result = await addToCart(user.uid, productId, 1);
      if (result.success) {
        await refreshCart();
        toast({
          title: 'Added to Cart',
          description: 'Item successfully added to your shopping cart.',
        });
      } else {
        toast({
          title: 'Cart Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      await handleRemoveCartItem(cartItemId);
      return;
    }
    setCartLoading(true);
    try {
      await updateCartQuantity(cartItemId, newQty);
      await refreshCart();
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveCartItem = async (cartItemId: string) => {
    setCartLoading(true);
    try {
      await removeFromCart(cartItemId);
      await refreshCart();
      toast({ title: 'Item removed from cart' });
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.seller.toLowerCase().includes(term) ||
        p.specs?.activeIngredient?.toLowerCase().includes(term) ||
        p.specs?.targetCrops?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Price range
    if (priceRange === 'under300') {
      filtered = filtered.filter(p => p.price < 300);
    } else if (priceRange === '300to1000') {
      filtered = filtered.filter(p => p.price >= 300 && p.price <= 1000);
    } else if (priceRange === 'above1000') {
      filtered = filtered.filter(p => p.price > 1000);
    }

    // In-stock
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'discount':
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        case 'featured':
        default:
          return (b.reviews || 0) - (a.reviews || 0);
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, priceRange, sortBy, inStockOnly]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading genuine agricultural products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Formal Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and purchase verified seeds, fertilizers, crop protection, and farming equipment.
          </p>
        </div>

        {/* Action Buttons: Cart & Orders */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="default"
            className="h-10 px-4 rounded-xl font-medium shadow-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="ml-2 bg-background text-foreground text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalCartCount}
              </span>
            )}
          </Button>
          <Link href="/orders">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-medium"
            >
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="space-y-4">
        {/* Search Bar & Sorter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, category, crop, or active ingredient..."
              className="pl-10 pr-10 h-11 rounded-xl bg-card border-border/80 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[170px] h-11 rounded-xl bg-card border-border/80 shadow-sm">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={inStockOnly ? 'default' : 'outline'}
              onClick={() => setInStockOnly(!inStockOnly)}
              className="h-11 rounded-xl px-3.5 shrink-0"
              title="Show only available stock"
            >
              {inStockOnly ? <Check className="h-4 w-4 mr-1.5" /> : null}
              In Stock
            </Button>
          </div>
        </div>

        {/* Visual Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/70 border-border/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Price Range Pills */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground/80">Price:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'under300', label: 'Under ₹300' },
              { id: '300to1000', label: '₹300 - ₹1,000' },
              { id: 'above1000', label: '₹1,000+' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriceRange(p.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  priceRange === p.id
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-muted/80 hover:bg-muted text-muted-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <span className="shrink-0 font-medium">
            Showing <strong className="text-foreground">{filteredProducts.length}</strong> products
          </span>
        </div>
      </div>

      {/* 3. Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center border-dashed rounded-3xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No matching farm products found</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
            We couldn't find any products matching your current filters. Try changing your search keywords or category filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setPriceRange('all');
              setInStockOnly(false);
            }}
            className="mt-5 rounded-xl"
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => {
            const inCart = cartQuantityMap[product.id];
            const isOutOfStock = product.stock <= 0;
            const fallbackImage = FALLBACK_CATEGORY_IMAGES[product.category] || FALLBACK_CATEGORY_IMAGES['Seeds'];

            return (
              <Card
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 hover:border-primary/50 bg-card hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image Header */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                  <img
                    src={product.imageUrl || fallbackImage}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Category Chip */}
                  <span className="absolute top-2.5 left-2.5 bg-background/90 text-foreground backdrop-blur-md text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-border/40">
                    {product.category}
                  </span>

                  {/* Discount Badge */}
                  {product.discountPercent && product.discountPercent > 0 && (
                    <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow-md">
                      {product.discountPercent}% OFF
                    </span>
                  )}

                  {/* Feature Tag */}
                  {product.badge && (
                    <span className="absolute bottom-2.5 left-2.5 bg-emerald-700/90 text-white backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Quick View Button on Image */}
                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Quick View Specifications"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card Body */}
                <CardContent className="flex flex-col flex-1 p-4 gap-2.5">
                  {/* Seller & Rating */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium flex items-center gap-1 text-foreground/80 truncate max-w-[150px]">
                      {product.seller}
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating || 4.7}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">({product.reviews || 120})</span>
                    </div>
                  </div>

                  {/* Product Title */}
                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  {/* Unit or Target Info */}
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {product.unit && (
                      <span className="bg-muted px-2 py-0.5 rounded font-medium text-foreground/70">
                        {product.unit}
                      </span>
                    )}
                    {product.specs?.targetCrops && (
                      <span className="truncate" title={product.specs.targetCrops}>
                        For: {product.specs.targetCrops}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mt-0.5">
                    {product.description}
                  </p>

                  {/* Pricing Block */}
                  <div className="pt-2 border-t border-border/50 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{product.price}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      {product.mrp && product.mrp > product.price && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                          Save ₹{product.mrp - product.price}
                        </p>
                      )}
                    </div>

                    {/* Stock status pill */}
                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                          Out of Stock
                        </span>
                      ) : product.stock <= 10 ? (
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          Only {product.stock} left
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Add To Cart / Quantity Button */}
                  <div className="pt-2 mt-auto">
                    {inCart ? (
                      <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(inCart.cartItemId, inCart.quantity - 1)}
                          className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-primary/20"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-bold text-primary px-2">
                          {inCart.quantity} in Cart
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(inCart.cartItemId, inCart.quantity + 1)}
                          className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-primary/20"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isOutOfStock || addingId === product.id}
                        className="w-full h-10 rounded-xl font-semibold shadow-sm transition-all"
                        variant={isOutOfStock ? 'secondary' : 'default'}
                      >
                        {addingId === product.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Quick View Product Dialog */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
        {quickViewProduct && (
          <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={quickViewProduct.imageUrl || FALLBACK_CATEGORY_IMAGES[quickViewProduct.category]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                  {quickViewProduct.category}
                </Badge>
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Seller:</span>
                    <strong className="text-foreground">{quickViewProduct.seller}</strong>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <DialogTitle className="text-xl font-extrabold leading-snug">
                    {quickViewProduct.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-sm text-amber-500 font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{quickViewProduct.rating || 4.7} / 5</span>
                    <span className="text-xs text-muted-foreground">({quickViewProduct.reviews || 120} verified farmer reviews)</span>
                  </div>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
                    {quickViewProduct.description}
                  </DialogDescription>
                </div>

                {/* Agronomic Technical Specs */}
                <div className="bg-muted/60 p-3.5 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-primary" />
                    Agronomic Specifications & Dosage
                  </h4>
                  {quickViewProduct.specs?.activeIngredient && (
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span className="text-muted-foreground">Composition:</span>
                      <span className="font-medium text-right text-foreground">{quickViewProduct.specs.activeIngredient}</span>
                    </div>
                  )}
                  {quickViewProduct.specs?.targetCrops && (
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span className="text-muted-foreground">Target Crops:</span>
                      <span className="font-medium text-right text-foreground">{quickViewProduct.specs.targetCrops}</span>
                    </div>
                  )}
                  {quickViewProduct.specs?.dosage && (
                    <div className="flex justify-between border-b border-border/40 pb-1">
                      <span className="text-muted-foreground">Recommended Dosage:</span>
                      <span className="font-medium text-right text-emerald-600 dark:text-emerald-400">{quickViewProduct.specs.dosage}</span>
                    </div>
                  )}
                  {quickViewProduct.specs?.applicationMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Application:</span>
                      <span className="font-medium text-right text-foreground">{quickViewProduct.specs.applicationMethod}</span>
                    </div>
                  )}
                </div>

                {/* Price and Cart Action */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{quickViewProduct.price}
                    </span>
                    {quickViewProduct.mrp && (
                      <span className="text-sm text-muted-foreground line-through">
                        MRP ₹{quickViewProduct.mrp}
                      </span>
                    )}
                    {quickViewProduct.discountPercent && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        {quickViewProduct.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      handleAddToCart(quickViewProduct.id);
                      setQuickViewProduct(null);
                    }}
                    disabled={quickViewProduct.stock <= 0}
                    className="w-full h-11 rounded-xl font-bold shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart • ₹{quickViewProduct.price}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* 5. Slide-Over Cart Sheet Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-6">
          <SheetHeader className="text-left space-y-1 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-extrabold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Shopping Cart
              </SheetTitle>
              <Badge variant="secondary" className="font-bold">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            <SheetDescription className="text-xs">
              {cartSubtotal >= 499 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Eligible for Free Delivery
                </span>
              ) : (
                <span>Add ₹{499 - cartSubtotal} more for <strong>Free Delivery</strong></span>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Cart Items Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-base">Your cart is empty</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Explore certified seeds, fertilizers, and tools and add them to your cart.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 rounded-xl text-xs"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/60"
                >
                  <img
                    src={item.product?.imageUrl || FALLBACK_CATEGORY_IMAGES['Seeds']}
                    alt={item.product?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-xl bg-card shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        ₹{item.product?.price} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Buttons */}
                      <div className="flex items-center border border-border/80 rounded-lg bg-background">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(item.product?.price || 0) * item.quantity}
                        </span>
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-muted-foreground hover:text-rose-600 p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <SheetFooter className="mt-auto border-t border-border/60 pt-4 flex-col gap-3 sm:flex-col">
              <div className="space-y-1.5 text-xs w-full">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalCartCount} items)</span>
                  <span className="font-semibold text-foreground">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className={cartSubtotal >= 499 ? 'text-emerald-600 font-bold' : 'text-foreground'}>
                    {cartSubtotal >= 499 ? 'FREE' : '₹50'}
                  </span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between text-sm font-extrabold text-foreground">
                  <span>Estimated Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ₹{cartSubtotal + (cartSubtotal >= 499 ? 0 : 50)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full">
                  <Button className="w-full h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setIsCartOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-9 rounded-xl text-xs">
                    View Full Cart Page
                  </Button>
                </Link>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
