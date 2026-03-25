'use server';

import { getAdminFirestore } from '@/firebase/admin';

export async function initializeMarketplace(): Promise<{ success: boolean; message: string }> {
  // No-op: do not wipe and re-seed on every load
  return { success: true, message: 'Marketplace ready' };
}

export async function getMarketplaceProducts(): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('products').get();
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminFirestore();
    const cartSnapshot = await db.collection('cart')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    if (!cartSnapshot.empty) {
      const cartItem = cartSnapshot.docs[0];
      await cartItem.ref.update({
        quantity: cartItem.data().quantity + quantity,
        updatedAt: new Date(),
      });
    } else {
      await db.collection('cart').add({
        userId,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { success: true, message: 'Item added to cart' };
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return { success: false, message: 'Failed to add to cart' };
  }
}

export async function getCartItems(userId: string): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const cartSnapshot = await db.collection('cart').where('userId', '==', userId).get();

    const cartItems = [];
    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      const productDoc = await db.collection('products').doc(cartData.productId).get();

      if (productDoc.exists) {
        const productData = productDoc.data()!;
        cartItems.push({
          id: cartDoc.id,
          ...cartData,
          createdAt: cartData.createdAt?.toDate?.() || cartData.createdAt,
          updatedAt: cartData.updatedAt?.toDate?.() || cartData.updatedAt,
          product: {
            id: productDoc.id,
            ...productData,
            createdAt: productData.createdAt?.toDate?.() || productData.createdAt,
            updatedAt: productData.updatedAt?.toDate?.() || productData.updatedAt,
          },
        });
      }
    }

    return cartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}

export async function removeFromCart(cartItemId: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminFirestore();
    await db.collection('cart').doc(cartItemId).delete();
    return { success: true, message: 'Item removed from cart' };
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return { success: false, message: 'Failed to remove from cart' };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminFirestore();
    await db.collection('cart').doc(cartItemId).update({ quantity, updatedAt: new Date() });
    return { success: true, message: 'Cart updated' };
  } catch (error) {
    console.error('Failed to update cart:', error);
    return { success: false, message: 'Failed to update cart' };
  }
}

export async function createOrder(userId: string, items: any[], totalAmount: number, orderData?: any): Promise<{ success: boolean; orderId?: string; message: string }> {
  try {
    const db = getAdminFirestore();

    const orderDoc = await db.collection('orders').add({
      userId,
      items,
      totalAmount,
      shippingAddress: orderData?.shippingAddress || null,
      paymentMethod: orderData?.paymentMethod || 'card',
      status: orderData?.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear cart after order
    const cartSnapshot = await db.collection('cart').where('userId', '==', userId).get();
    await Promise.all(cartSnapshot.docs.map(d => d.ref.delete()));

    return { success: true, orderId: orderDoc.id, message: 'Order created successfully' };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, message: 'Failed to create order' };
  }
}

export async function getUserOrders(userId: string): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('orders').where('userId', '==', userId).get();
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}
