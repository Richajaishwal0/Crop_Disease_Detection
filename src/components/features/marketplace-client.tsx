
'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { collection, orderBy, query, where, startAt, endAt } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Plus, Package } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
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
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">${product.price}</span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{product.rating} ({product.reviews})</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">by {product.seller}</p>
                <p className="text-sm text-green-600">{product.stock} in stock</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardFooter>
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
