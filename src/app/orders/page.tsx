'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, DollarSign } from 'lucide-react';
import { getUserOrders } from '@/app/actions/marketplace';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mt-4">Please login to view your orders</h2>
        <Link href="/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mt-4">No orders yet</h2>
          <p className="text-muted-foreground mt-2">Start shopping to see your orders here</p>
          <Link href="/marketplace">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Method */}
                  {order.paymentMethod && (
                    <div>
                      <h4 className="font-semibold mb-2">Payment Method</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                      </p>
                    </div>
                  )}
                  
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ${item.price}
                            </p>
                          </div>
                          <p className="font-semibold">${item.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}