'use server';

import { getAdminFirestore } from '@/firebase/admin';

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent?: number;
  imageUrl: string;
  stock: number;
  seller: string;
  rating: number;
  reviews: number;
  unit?: string;
  badge?: string;
  specs?: {
    activeIngredient?: string;
    targetCrops?: string;
    dosage?: string;
    applicationMethod?: string;
    shelfLife?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

const DEFAULT_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-seed-paddy-ir36',
    name: 'Paddy IR-36 Certified Seeds (5kg)',
    description: 'High-yield IR-36 paddy seeds with >90% germination rate. Resistant to stem borer & leaf blast. Suitable for Kharif & Rabi seasons.',
    price: 349,
    mrp: 450,
    discountPercent: 22,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    stock: 200,
    seller: 'National Seeds Corp',
    rating: 4.8,
    reviews: 312,
    unit: '5 kg Bag',
    badge: 'Govt. Certified',
    specs: {
      activeIngredient: 'Certified F1 Paddy Seed (IR-36)',
      targetCrops: 'Paddy / Rice (Lowland & Irrigated)',
      dosage: '15-20 kg / Acre for nursery sowing',
      applicationMethod: 'Direct broadcasting / Transplanting',
      shelfLife: '9 Months from packaging',
    }
  },
  {
    id: 'prod-seed-wheat-hd2967',
    name: 'Wheat HD-2967 High-Yield Seeds (10kg)',
    description: 'Premium HD-2967 certified wheat seeds known for high tillering and yellow rust resistance. High grain quality for North Indian plains.',
    price: 520,
    mrp: 650,
    discountPercent: 20,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    stock: 150,
    seller: 'AgriSeeds India',
    rating: 4.7,
    reviews: 198,
    unit: '10 kg Bag',
    badge: 'Bestseller',
    specs: {
      activeIngredient: 'Certified Wheat Seed HD-2967',
      targetCrops: 'Wheat (Winter / Rabi)',
      dosage: '40 kg / Acre',
      applicationMethod: 'Seed drill sowing / Line sowing',
      shelfLife: '12 Months',
    }
  },
  {
    id: 'prod-seed-tomato-hybrid',
    name: 'Hybrid Tomato F1 Seeds (50g)',
    description: 'F1 hybrid tomato seeds with high fruit firmness and disease resistance against Tomato Leaf Curl Virus (ToLCV) & early blight.',
    price: 180,
    mrp: 240,
    discountPercent: 25,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    stock: 300,
    seller: 'GreenThumb Seeds',
    rating: 4.9,
    reviews: 421,
    unit: '50g Pack',
    badge: 'Top Rated',
    specs: {
      activeIngredient: 'Hybrid F1 Solanum lycopersicum',
      targetCrops: 'Tomato (Open field & Polyhouse)',
      dosage: '40-50g / Acre nursery',
      applicationMethod: 'Nursery bed raised seedlings',
      shelfLife: '18 Months',
    }
  },
  {
    id: 'prod-fert-dap-50kg',
    name: 'DAP Fertilizer 18:46:0 (50kg)',
    description: 'Di-Ammonium Phosphate fertilizer for robust root formation, early tillering, and vigorous plant vigor. Essential basal fertilizer.',
    price: 1350,
    mrp: 1450,
    discountPercent: 7,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
    stock: 80,
    seller: 'IFFCO Agro Center',
    rating: 4.6,
    reviews: 267,
    unit: '50 kg Bag',
    badge: 'Govt. Subsidized',
    specs: {
      activeIngredient: '18% Nitrogen (Ammoniacal), 46% Phosphate (P2O5)',
      targetCrops: 'All crops (Paddy, Wheat, Sugarcane, Cotton, Maize)',
      dosage: '50-100 kg / Acre at sowing time',
      applicationMethod: 'Basal soil broadcasting during land prep',
      shelfLife: '24 Months dry storage',
    }
  },
  {
    id: 'prod-fert-vermicompost-10kg',
    name: 'Bio-Enriched Organic Vermicompost (10kg)',
    description: '100% pure earthworm compost enriched with Trichoderma & Mycorrhizae. Restores soil microbial flora, humus, and water retention.',
    price: 299,
    mrp: 399,
    discountPercent: 25,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80',
    stock: 200,
    seller: 'EcoGrow Organic Labs',
    rating: 4.9,
    reviews: 534,
    unit: '10 kg Bag',
    badge: '100% Organic',
    specs: {
      activeIngredient: 'Organic matter > 40%, NPK 1.8:1.5:1.2, Humic acid',
      targetCrops: 'Vegetables, Fruits, Flowers, Kitchen Garden, Field crops',
      dosage: '250-500 kg / Acre or 200g per plant',
      applicationMethod: 'Soil incorporation / Root ring application',
      shelfLife: '12 Months',
    }
  },
  {
    id: 'prod-fert-npk-191919',
    name: '100% Water Soluble NPK 19:19:19 (1kg)',
    description: 'Imported water-soluble fertilizer for instant foliar nutrition and drip fertigation. Boosts vegetative growth, branching, and fruit size.',
    price: 195,
    mrp: 260,
    discountPercent: 25,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    stock: 150,
    seller: 'FarmNutrients Ltd.',
    rating: 4.7,
    reviews: 189,
    unit: '1 kg Pack',
    badge: 'Fast Absorption',
    specs: {
      activeIngredient: '19% N, 19% P2O5, 19% K2O with micro-nutrients',
      targetCrops: 'Vegetables, Cotton, Paddy, Chilli, Grapes, Pomegranate',
      dosage: '4-5g per Liter of water (Foliar spray)',
      applicationMethod: 'Foliar spray / Drip irrigation',
      shelfLife: '36 Months',
    }
  },
  {
    id: 'prod-med-tricyclazole-120g',
    name: 'Tricyclazole 75% WP - Blast Cure (120g)',
    description: 'Specialty systemic fungicide with protective and curative action against rice leaf blast, neck blast, and node blast.',
    price: 245,
    mrp: 320,
    discountPercent: 23,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    stock: 150,
    seller: 'CropHealth Labs',
    rating: 4.8,
    reviews: 302,
    unit: '120g Pack',
    badge: 'Expert Choice',
    specs: {
      activeIngredient: 'Tricyclazole 75% WP',
      targetCrops: 'Paddy / Rice',
      dosage: '0.6g per Liter of water (120g per Acre)',
      applicationMethod: 'Foliar spray at first appearance of blast spots',
      shelfLife: '24 Months',
    }
  },
  {
    id: 'prod-med-copper-oxychloride',
    name: 'Copper Oxychloride 50% WP (500g)',
    description: 'Broad-spectrum protective copper fungicide for controlling bacterial blight, downy mildew, leaf spots, and anthracnose.',
    price: 210,
    mrp: 280,
    discountPercent: 25,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    stock: 160,
    seller: 'PlantCare Solutions',
    rating: 4.6,
    reviews: 189,
    unit: '500g Pack',
    badge: 'Broad Spectrum',
    specs: {
      activeIngredient: 'Copper Oxychloride 50% WP (metallic copper 25%)',
      targetCrops: 'Paddy, Tomato, Potato, Citrus, Banana, Cardamom',
      dosage: '2.5g - 3g per Liter of water',
      applicationMethod: 'Foliar spray on both leaf surfaces',
      shelfLife: '24 Months',
    }
  },
  {
    id: 'prod-pest-neemoil-10000',
    name: 'Cold-Pressed Neem Oil 10,000 PPM (1L)',
    description: 'Pure bio-pesticide with 10,000 ppm Azadirachtin. Organic repellent and anti-feedant for aphids, whiteflies, mites, and thrips.',
    price: 399,
    mrp: 550,
    discountPercent: 27,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    stock: 250,
    seller: 'OrganicGuard Agri',
    rating: 4.9,
    reviews: 612,
    unit: '1 Litre Bottle',
    badge: 'Organic Certified',
    specs: {
      activeIngredient: 'Azadirachtin 1% (10,000 PPM EC)',
      targetCrops: 'All agricultural & horticultural crops',
      dosage: '2-3 ml per Liter of water',
      applicationMethod: 'Foliar spray early morning or late evening',
      shelfLife: '24 Months',
    }
  },
  {
    id: 'prod-pest-imidacloprid-250ml',
    name: 'Imidacloprid 17.8% SL Systemic (250ml)',
    description: 'Rapid systemic insecticide for strong knock-down control of sucking pests like brown plant hopper (BPH), aphids, and whiteflies.',
    price: 320,
    mrp: 410,
    discountPercent: 22,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    stock: 120,
    seller: 'PestGuard India',
    rating: 4.7,
    reviews: 278,
    unit: '250 ml Bottle',
    badge: 'Bestseller',
    specs: {
      activeIngredient: 'Imidacloprid 17.8% SL',
      targetCrops: 'Paddy, Cotton, Chilli, Sugarcane, Mango, Okra',
      dosage: '0.5 ml per Liter of water (50-100ml / Acre)',
      applicationMethod: 'Foliar spray with knapsack or power sprayer',
      shelfLife: '24 Months',
    }
  },
  {
    id: 'prod-irrig-drip-1acre',
    name: 'Complete Drip Irrigation Kit (1 Acre)',
    description: 'Comprehensive drip irrigation system for 1 acre. Includes 16mm inline lateral pipe (400m), screen filter, punch, connectors, and drippers.',
    price: 4500,
    mrp: 5999,
    discountPercent: 25,
    category: 'Irrigation',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80',
    stock: 30,
    seller: 'WaterWise Systems',
    rating: 4.8,
    reviews: 156,
    unit: '1 Acre Kit',
    badge: 'Saves 55% Water',
    specs: {
      activeIngredient: 'Virgin UV-stabilized HDPE / LDPE polymers',
      targetCrops: 'Vegetables, Orchards, Sugarcane, Cotton, Bananas',
      dosage: '1 complete system covering 1 acre field',
      applicationMethod: 'Surface or subsurface drip layout',
      shelfLife: '5+ Years field warranty',
    }
  },
  {
    id: 'prod-tool-battery-sprayer-16l',
    name: '16L Rechargeable Battery Sprayer (12V)',
    description: 'Heavy-duty 16-litre knapsack sprayer with 12V 12Ah battery, pressure regulator dial, telescopic brass lance, and 4 nozzles.',
    price: 2199,
    mrp: 2999,
    discountPercent: 27,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23961?auto=format&fit=crop&w=600&q=80',
    stock: 60,
    seller: 'AgriEquip Direct',
    rating: 4.8,
    reviews: 324,
    unit: '1 Unit Box',
    badge: '12V Long Battery',
    specs: {
      activeIngredient: '12V 12Ah Lead-acid battery, high-pressure auto-cutoff pump',
      targetCrops: 'Foliar pesticide, herbicide, and liquid fertilizer spraying',
      dosage: 'Covers up to 25-30 tanks per full charge',
      applicationMethod: 'Ergonomic backpack with padded straps',
      shelfLife: '1 Year motor & battery warranty',
    }
  },
  {
    id: 'prod-tool-soil-tester-digital',
    name: 'Digital 4-in-1 Soil pH & Moisture Meter',
    description: 'Precision probe device measuring soil pH (3.5 - 9.0), soil moisture level, ground temperature (°C/°F), and sunlight lux with backlit LCD.',
    price: 599,
    mrp: 899,
    discountPercent: 33,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    seller: 'SoilTest Pro',
    rating: 4.6,
    reviews: 267,
    unit: '1 Device',
    badge: 'High Precision',
    specs: {
      activeIngredient: '200mm Aluminum alloy sensor probe with LCD display',
      targetCrops: 'Soil health monitoring for all farm and greenhouse plots',
      dosage: 'Insert 10-15cm into soil for instant reading',
      applicationMethod: 'Direct soil insertion measurement',
      shelfLife: '3 Years lifespan with 9V battery',
    }
  }
];

export async function initializeMarketplace(): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('products').limit(1).get();
    if (snapshot.empty) {
      const batch = db.batch();
      for (const prod of DEFAULT_PRODUCTS) {
        const ref = db.collection('products').doc(prod.id);
        batch.set(ref, {
          ...prod,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await batch.commit();
      return { success: true, message: 'Marketplace seeded with curated products' };
    }
    return { success: true, message: 'Marketplace ready' };
  } catch (error) {
    console.warn('Initialize marketplace error, returning defaults:', error);
    return { success: true, message: 'Marketplace ready' };
  }
}

export async function getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('products').get();
    if (snapshot.empty) {
      return DEFAULT_PRODUCTS;
    }
    
    // Map existing products and enrich with default specs/mrp if missing
    const firestoreProducts = snapshot.docs.map(d => {
      const data = d.data();
      const defaultMatch = DEFAULT_PRODUCTS.find(p => p.id === d.id || p.name === data.name);
      
      const price = data.price || defaultMatch?.price || 100;
      const mrp = data.mrp || defaultMatch?.mrp || Math.round(price * 1.25);
      const discountPercent = data.discountPercent || defaultMatch?.discountPercent || Math.max(5, Math.round(((mrp - price) / mrp) * 100));

      return {
        id: d.id,
        name: data.name || defaultMatch?.name || 'Agri Product',
        category: data.category || defaultMatch?.category || 'General',
        description: data.description || defaultMatch?.description || '',
        price,
        mrp,
        discountPercent,
        imageUrl: (data.imageUrl && !data.imageUrl.includes('photo-1585435557343')) ? data.imageUrl : (defaultMatch?.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'),
        stock: typeof data.stock === 'number' ? data.stock : (defaultMatch?.stock ?? 50),
        seller: data.seller || defaultMatch?.seller || 'Farmingo Verified Seller',
        rating: data.rating || defaultMatch?.rating || 4.7,
        reviews: data.reviews || defaultMatch?.reviews || 120,
        unit: data.unit || defaultMatch?.unit || '1 Unit',
        badge: data.badge || defaultMatch?.badge || 'Genuine',
        specs: data.specs || defaultMatch?.specs || {
          targetCrops: 'All agricultural crops',
          dosage: 'As recommended by agronomist',
          applicationMethod: 'Foliar / Soil application'
        },
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as MarketplaceProduct;
    });

    // If Firestore has fewer products than default, combine or return firestore enriched
    if (firestoreProducts.length < 5) {
      return DEFAULT_PRODUCTS;
    }

    return firestoreProducts;
  } catch (error) {
    console.error('Error fetching products from firestore, using curated defaults:', error);
    return DEFAULT_PRODUCTS;
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
