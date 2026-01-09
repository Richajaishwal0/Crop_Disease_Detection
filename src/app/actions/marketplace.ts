'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc, getDoc } from 'firebase/firestore';

const { firestore } = initializeFirebase();

// Sample agricultural products data
const sampleProducts = [
  // Seeds & Plants
  {
    name: 'Organic Tomato Seeds',
    description: 'High-yield organic tomato seeds, perfect for home gardens and commercial farming.',
    price: 25.99,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400',
    stock: 100,
    seller: 'GreenThumb Seeds Co.',
    rating: 4.8,
    reviews: 156
  },
  {
    name: 'Hybrid Corn Seeds',
    description: 'Disease-resistant hybrid corn seeds with excellent yield potential.',
    price: 45.99,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    stock: 75,
    seller: 'AgriSeeds Pro',
    rating: 4.7,
    reviews: 89
  },
  {
    name: 'Wheat Seeds Premium',
    description: 'High-quality wheat seeds for commercial farming with excellent germination rate.',
    price: 35.99,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    stock: 120,
    seller: 'FarmSeeds Ltd.',
    rating: 4.6,
    reviews: 67
  },

  // Fertilizers & Nutrients
  {
    name: 'NPK Fertilizer 20-20-20',
    description: 'Balanced NPK fertilizer for all-purpose plant nutrition. 50lb bag.',
    price: 89.99,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    stock: 45,
    seller: 'FarmNutrients Ltd.',
    rating: 4.6,
    reviews: 89
  },
  {
    name: 'Organic Compost 40lb',
    description: 'Premium organic compost enriched with beneficial microorganisms.',
    price: 24.99,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 80,
    seller: 'EcoGrow Solutions',
    rating: 4.8,
    reviews: 134
  },
  {
    name: 'Liquid Calcium Supplement',
    description: 'Fast-acting liquid calcium to prevent blossom end rot and strengthen plants.',
    price: 19.99,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    stock: 65,
    seller: 'PlantHealth Pro',
    rating: 4.5,
    reviews: 78
  },

  // Equipment & Machinery
  {
    name: 'Garden Tractor 42" Cut',
    description: 'Reliable garden tractor with 42-inch cutting deck, perfect for medium-sized properties.',
    price: 2499.99,
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    stock: 8,
    seller: 'AgriMachinery Pro',
    rating: 4.9,
    reviews: 34
  },
  {
    name: 'Rotary Tiller 16HP',
    description: 'Heavy-duty rotary tiller for soil preparation and cultivation.',
    price: 1899.99,
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
    stock: 12,
    seller: 'FarmEquip Direct',
    rating: 4.7,
    reviews: 56
  },
  {
    name: 'Seed Drill Planter',
    description: 'Precision seed drill for accurate planting and optimal seed spacing.',
    price: 3299.99,
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    stock: 5,
    seller: 'PrecisionFarm Tech',
    rating: 4.8,
    reviews: 23
  },

  // Irrigation Systems
  {
    name: 'Drip Irrigation Kit',
    description: 'Complete drip irrigation system for up to 100 plants. Water-efficient and easy to install.',
    price: 149.99,
    category: 'Irrigation',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400',
    stock: 25,
    seller: 'WaterWise Systems',
    rating: 4.7,
    reviews: 67
  },
  {
    name: 'Sprinkler System Pro',
    description: 'Professional sprinkler system with timer and multiple zones.',
    price: 299.99,
    category: 'Irrigation',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 18,
    seller: 'IrrigationMax',
    rating: 4.6,
    reviews: 45
  },

  // Plant Medicine & Protection
  {
    name: 'Fungicide Copper Spray',
    description: 'Organic copper-based fungicide for treating plant diseases and infections.',
    price: 28.99,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031d8ab?w=400',
    stock: 85,
    seller: 'PlantCare Solutions',
    rating: 4.7,
    reviews: 112
  },
  {
    name: 'Neem Oil Concentrate',
    description: 'Natural neem oil for pest control and disease prevention. Safe for organic farming.',
    price: 22.99,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400',
    stock: 95,
    seller: 'OrganicGuard',
    rating: 4.8,
    reviews: 167
  },
  {
    name: 'Bacterial Blight Treatment',
    description: 'Specialized treatment for bacterial blight in tomatoes, peppers, and beans.',
    price: 34.99,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    stock: 42,
    seller: 'CropHealth Labs',
    rating: 4.6,
    reviews: 78
  },
  {
    name: 'Root Rot Remedy',
    description: 'Effective treatment for root rot and soil-borne fungal diseases.',
    price: 31.99,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400',
    stock: 38,
    seller: 'RootCare Pro',
    rating: 4.5,
    reviews: 89
  },
  {
    name: 'Powdery Mildew Spray',
    description: 'Fast-acting spray for powdery mildew prevention and treatment.',
    price: 26.99,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    stock: 67,
    seller: 'FungiFree Solutions',
    rating: 4.7,
    reviews: 134
  },

  // Pesticides & Pest Control
  {
    name: 'Organic Pesticide Spray',
    description: 'Natural, organic pesticide safe for vegetables and fruits. 32oz bottle.',
    price: 34.99,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=400',
    stock: 78,
    seller: 'EcoFarm Solutions',
    rating: 4.5,
    reviews: 123
  },
  {
    name: 'Aphid Control Concentrate',
    description: 'Targeted aphid control that is safe for beneficial insects.',
    price: 18.99,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 92,
    seller: 'BugBuster Pro',
    rating: 4.6,
    reviews: 156
  },
  {
    name: 'Slug & Snail Bait',
    description: 'Iron phosphate-based slug and snail control, pet and wildlife safe.',
    price: 15.99,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    stock: 110,
    seller: 'GardenGuard',
    rating: 4.4,
    reviews: 87
  },

  // Tools & Instruments
  {
    name: 'Greenhouse Thermometer',
    description: 'Digital min/max thermometer with humidity sensor for greenhouse monitoring.',
    price: 19.99,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    stock: 150,
    seller: 'GrowTech Instruments',
    rating: 4.4,
    reviews: 201
  },
  {
    name: 'Soil pH Meter',
    description: 'Digital soil pH and moisture meter for optimal growing conditions.',
    price: 29.99,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    stock: 85,
    seller: 'SoilTest Pro',
    rating: 4.6,
    reviews: 167
  },
  {
    name: 'Pruning Shears Professional',
    description: 'High-quality steel pruning shears with ergonomic grip.',
    price: 24.99,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 125,
    seller: 'CutRight Tools',
    rating: 4.8,
    reviews: 234
  },

  // Livestock Medicine
  {
    name: 'Cattle Dewormer Injectable',
    description: 'Broad-spectrum dewormer for cattle, effective against internal parasites.',
    price: 45.99,
    category: 'Livestock Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
    stock: 35,
    seller: 'VetFarm Supplies',
    rating: 4.7,
    reviews: 89
  },
  {
    name: 'Poultry Antibiotics',
    description: 'Water-soluble antibiotics for treating respiratory infections in poultry.',
    price: 32.99,
    category: 'Livestock Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
    stock: 48,
    seller: 'PoultryHealth Pro',
    rating: 4.6,
    reviews: 67
  },
  {
    name: 'Sheep Foot Rot Treatment',
    description: 'Specialized treatment for foot rot in sheep and goats.',
    price: 28.99,
    category: 'Livestock Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=400',
    stock: 25,
    seller: 'LivestockCare Ltd.',
    rating: 4.5,
    reviews: 43
  },

  // Composting & Soil
  {
    name: 'Compost Bin 80 Gallon',
    description: 'Large capacity compost bin with easy-turn design for efficient composting.',
    price: 129.99,
    category: 'Composting',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 32,
    seller: 'CompostMaster Inc.',
    rating: 4.6,
    reviews: 78
  },
  {
    name: 'Worm Composting Kit',
    description: 'Complete vermiculture kit with red worms for organic waste composting.',
    price: 89.99,
    category: 'Composting',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock: 28,
    seller: 'WormFarm Solutions',
    rating: 4.7,
    reviews: 92
  },

  // Lighting & Climate
  {
    name: 'Plant Growth LED Lights',
    description: 'Full spectrum LED grow lights for indoor plants and seedlings. 45W panel.',
    price: 79.99,
    category: 'Lighting',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    stock: 60,
    seller: 'IndoorGrow Tech',
    rating: 4.8,
    reviews: 145
  },
  {
    name: 'Greenhouse Heater',
    description: 'Electric greenhouse heater with thermostat control for winter growing.',
    price: 159.99,
    category: 'Climate Control',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    stock: 22,
    seller: 'ClimateGrow Pro',
    rating: 4.5,
    reviews: 67
  }
];

export async function initializeMarketplace(): Promise<{ success: boolean; message: string }> {
  try {
    // Clear existing products first
    const existingSnapshot = await getDocs(collection(firestore, 'marketplaceProducts'));
    const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Add sample products
    const promises = sampleProducts.map(product => 
      addDoc(collection(firestore, 'marketplaceProducts'), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );

    await Promise.all(promises);
    return { success: true, message: `Added ${sampleProducts.length} products to marketplace` };
  } catch (error) {
    console.error('Failed to initialize marketplace:', error);
    return { success: false, message: 'Failed to initialize marketplace' };
  }
}

export async function getMarketplaceProducts(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(firestore, 'marketplaceProducts'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
  try {
    // Check if item already in cart
    const cartQuery = query(
      collection(firestore, 'cart'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const cartSnapshot = await getDocs(cartQuery);

    if (cartSnapshot.docs.length > 0) {
      // Update quantity
      const cartItem = cartSnapshot.docs[0];
      await updateDoc(cartItem.ref, {
        quantity: cartItem.data().quantity + quantity,
        updatedAt: new Date()
      });
    } else {
      // Add new item
      await addDoc(collection(firestore, 'cart'), {
        userId,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
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
    const cartQuery = query(collection(firestore, 'cart'), where('userId', '==', userId));
    const cartSnapshot = await getDocs(cartQuery);
    
    const cartItems = [];
    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      const productDoc = await getDoc(doc(firestore, 'marketplaceProducts', cartData.productId));
      
      if (productDoc.exists()) {
        const productData = productDoc.data();
        cartItems.push({
          id: cartDoc.id,
          ...cartData,
          createdAt: cartData.createdAt?.toDate?.() || cartData.createdAt,
          updatedAt: cartData.updatedAt?.toDate?.() || cartData.updatedAt,
          product: {
            id: productDoc.id,
            ...productData,
            createdAt: productData.createdAt?.toDate?.() || productData.createdAt,
            updatedAt: productData.updatedAt?.toDate?.() || productData.updatedAt
          }
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
    await deleteDoc(doc(firestore, 'cart', cartItemId));
    return { success: true, message: 'Item removed from cart' };
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return { success: false, message: 'Failed to remove from cart' };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  try {
    await updateDoc(doc(firestore, 'cart', cartItemId), {
      quantity,
      updatedAt: new Date()
    });
    return { success: true, message: 'Cart updated' };
  } catch (error) {
    console.error('Failed to update cart:', error);
    return { success: false, message: 'Failed to update cart' };
  }
}

export async function createOrder(userId: string, items: any[], totalAmount: number, orderData?: any): Promise<{ success: boolean; orderId?: string; message: string }> {
  try {
    const orderDoc = await addDoc(collection(firestore, 'orders'), {
      userId,
      items,
      totalAmount,
      shippingAddress: orderData?.shippingAddress || null,
      paymentMethod: orderData?.paymentMethod || 'card',
      status: orderData?.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Clear cart after order
    const cartQuery = query(collection(firestore, 'cart'), where('userId', '==', userId));
    const cartSnapshot = await getDocs(cartQuery);
    const deletePromises = cartSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return { success: true, orderId: orderDoc.id, message: 'Order created successfully' };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, message: 'Failed to create order' };
  }
}

export async function getUserOrders(userId: string): Promise<any[]> {
  try {
    const ordersQuery = query(collection(firestore, 'orders'), where('userId', '==', userId));
    const ordersSnapshot = await getDocs(ordersQuery);
    return ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}