
'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { collection, orderBy, query, where, startAt, endAt } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Plus, Package } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getMarketplaceProducts, addToCart, initializeMarketplace } from '@/app/actions/marketplace';
import Link from 'next/link';

export function MarketplaceClient() {
  const { user } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      let productList = await getMarketplaceProducts();
      
      // Always reinitialize to get latest products
      const result = await initializeMarketplace();
      productList = await getMarketplaceProducts();
      
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({ title: 'Please login to add items to cart', variant: 'destructive' });
      return;
    }

    const result = await addToCart(user.uid, productId);
    toast({ 
      title: result.success ? 'Added to cart' : 'Error', 
      description: result.message,
      variant: result.success ? 'default' : 'destructive'
    });
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  if (loading) {
    return <div className="text-center py-12">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="text-2xl font-semibold mt-4">No products found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm ? `No products match "${searchTerm}"` : 'No products available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2" variant="secondary">{product.category}</Badge>
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white">Only {product.stock} left</Badge>
                )}
                {product.stock === 0 && (
                  <Badge className="absolute top-2 right-2" variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <h3 className="font-semibold text-base line-clamp-2 leading-snug">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{product.description}</p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-muted-foreground/30'}>★</span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{product.rating} ({product.reviews} reviews)</span>
                  </div>
                )}

                {/* Price & Seller */}
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">by {product.seller}</span>
                </div>

                {/* Add to Cart */}
                <Button
                  className="w-full mt-2"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  variant={product.stock === 0 ? 'outline' : 'default'}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Buttons */}
      {user && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Link href="/cart">
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
            </Button>
          </Link>
          <Link href="/orders">
            <Button size="lg" variant="outline" className="rounded-full shadow-lg">
              <Package className="mr-2 h-5 w-5" />
              Orders
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
