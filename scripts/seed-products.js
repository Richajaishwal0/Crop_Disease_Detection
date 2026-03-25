const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({ credential: cert(require('../service-account.json')) });
const db = getFirestore(app);

const products = [
  // Seeds
  {
    name: 'Paddy IR-36 Seeds (5kg)',
    description: 'High-yield IR-36 paddy seeds with excellent disease resistance. Suitable for both kharif and rabi seasons. Germination rate above 90%.',
    price: 349,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
    stock: 200,
    seller: 'AgriSeeds India',
    rating: 4.7,
    reviews: 312,
  },
  {
    name: 'Wheat HD-2967 Seeds (10kg)',
    description: 'Premium HD-2967 wheat seeds known for high yield and rust resistance. Ideal for North Indian plains.',
    price: 520,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
    stock: 150,
    seller: 'FarmSeeds Ltd.',
    rating: 4.6,
    reviews: 198,
  },
  {
    name: 'Hybrid Tomato Seeds (50g)',
    description: 'F1 hybrid tomato seeds with high yield potential. Resistant to leaf curl virus and early blight.',
    price: 180,
    category: 'Seeds',
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600',
    stock: 300,
    seller: 'GreenThumb Seeds',
    rating: 4.8,
    reviews: 421,
  },

  // Fertilizers
  {
    name: 'DAP Fertilizer (50kg)',
    description: 'Di-Ammonium Phosphate fertilizer for strong root development and early crop growth. Suitable for all crops.',
    price: 1350,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600',
    stock: 80,
    seller: 'FarmNutrients Ltd.',
    rating: 4.5,
    reviews: 267,
  },
  {
    name: 'Urea Fertilizer (45kg)',
    description: 'High nitrogen content urea fertilizer for boosting vegetative growth. Best for paddy, wheat and sugarcane.',
    price: 266,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600',
    stock: 120,
    seller: 'KisanFert Co.',
    rating: 4.4,
    reviews: 189,
  },
  {
    name: 'Organic Vermicompost (10kg)',
    description: 'Premium vermicompost enriched with beneficial microorganisms. Improves soil structure and water retention.',
    price: 299,
    category: 'Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    stock: 200,
    seller: 'EcoGrow Solutions',
    rating: 4.9,
    reviews: 534,
  },

  // Plant Medicines & Pesticides
  {
    name: 'Tricyclazole 75% WP - Blast Fungicide (100g)',
    description: 'Highly effective fungicide for controlling rice blast disease (Pyricularia oryzae). Systemic action with protective and curative properties.',
    price: 245,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031d8ab?w=600',
    stock: 150,
    seller: 'CropHealth Labs',
    rating: 4.8,
    reviews: 302,
  },
  {
    name: 'Mancozeb 75% WP - Broad Spectrum Fungicide (500g)',
    description: 'Contact fungicide effective against early blight, late blight, and downy mildew in vegetables and field crops.',
    price: 185,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031d8ab?w=600',
    stock: 180,
    seller: 'PlantCare Solutions',
    rating: 4.6,
    reviews: 215,
  },
  {
    name: 'Imidacloprid 17.8% SL - Insecticide (250ml)',
    description: 'Systemic insecticide for controlling sucking pests like aphids, whiteflies, and brown plant hopper in paddy and vegetables.',
    price: 320,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=600',
    stock: 120,
    seller: 'PestGuard India',
    rating: 4.7,
    reviews: 278,
  },
  {
    name: 'Neem Oil 10000 PPM (1 Litre)',
    description: 'Cold-pressed neem oil for organic pest and disease management. Effective against mites, aphids, and fungal infections. Safe for beneficial insects.',
    price: 399,
    category: 'Pesticides',
    imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600',
    stock: 250,
    seller: 'OrganicGuard',
    rating: 4.9,
    reviews: 612,
  },
  {
    name: 'Copper Oxychloride 50% WP (500g)',
    description: 'Broad-spectrum copper fungicide for controlling bacterial blight, downy mildew, and leaf spot diseases in paddy and vegetables.',
    price: 210,
    category: 'Plant Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031d8ab?w=600',
    stock: 160,
    seller: 'PlantCare Solutions',
    rating: 4.5,
    reviews: 189,
  },

  // Tools & Equipment
  {
    name: 'Manual Paddy Weeder',
    description: 'Ergonomic manual weeder for paddy fields. Reduces weeding time by 60% compared to hand weeding. Adjustable width.',
    price: 850,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    stock: 75,
    seller: 'KisanTools Co.',
    rating: 4.6,
    reviews: 143,
  },
  {
    name: 'Knapsack Sprayer 16L',
    description: 'High-quality 16-litre knapsack sprayer with adjustable nozzle. Ideal for spraying pesticides and fertilizers on field crops.',
    price: 1299,
    category: 'Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    stock: 60,
    seller: 'AgriEquip Direct',
    rating: 4.7,
    reviews: 324,
  },
  {
    name: 'Soil pH & Moisture Tester',
    description: 'Digital 3-in-1 soil tester measuring pH, moisture, and sunlight. Essential for precision farming and crop planning.',
    price: 599,
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600',
    stock: 100,
    seller: 'SoilTest Pro',
    rating: 4.5,
    reviews: 267,
  },

  // Irrigation
  {
    name: 'Drip Irrigation Kit (1 Acre)',
    description: 'Complete drip irrigation system for 1 acre. Includes mainline, sub-mainline, drippers, and fittings. Saves up to 50% water.',
    price: 4500,
    category: 'Irrigation',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600',
    stock: 30,
    seller: 'WaterWise Systems',
    rating: 4.8,
    reviews: 156,
  },
];

async function seed() {
  console.log('Seeding products...');

  // Clear existing
  const existing = await db.collection('products').get();
  if (existing.size > 0) {
    const batch = db.batch();
    existing.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log('Cleared', existing.size, 'existing products');
  }

  // Add new
  const batch = db.batch();
  for (const product of products) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      ...product,
      uid: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await batch.commit();
  console.log('Added ' + products.length + ' products successfully.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
