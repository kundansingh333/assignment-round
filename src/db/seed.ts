import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set. Please check .env.local');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('🌱 Seeding database...\n');

  // ─── Create Users ───────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const sellerPassword = await bcrypt.hash('Seller@123', 12);
  const buyerPassword = await bcrypt.hash('Buyer@123', 12);

  const [admin] = await db.insert(schema.users).values({
    name: 'Admin User',
    email: 'admin@asamedchem.com',
    passwordHash: adminPassword,
    role: 'ADMIN',
  }).onConflictDoNothing().returning();

  const [seller] = await db.insert(schema.users).values({
    name: 'Rahul Sharma',
    email: 'seller@asamedchem.com',
    passwordHash: sellerPassword,
    role: 'SELLER',
  }).onConflictDoNothing().returning();

  const [buyer] = await db.insert(schema.users).values({
    name: 'Priya Patel',
    email: 'buyer@asamedchem.com',
    passwordHash: buyerPassword,
    role: 'BUYER',
  }).onConflictDoNothing().returning();

  console.log('✅ Users created');
  console.log('   Admin:  admin@asamedchem.com / Admin@123');
  console.log('   Seller: seller@asamedchem.com / Seller@123');
  console.log('   Buyer:  buyer@asamedchem.com / Buyer@123\n');

  // ─── Create Categories ─────────────────────────────────
  const categoryData = [
    { name: 'Inorganic Chemicals', description: 'Salts, acids, bases, and other inorganic compounds' },
    { name: 'Organic Solvents', description: 'Alcohols, ethers, and other organic solvents' },
    { name: 'Acids & Bases', description: 'Strong and weak acids and bases' },
    { name: 'Lab Equipment', description: 'Glassware, instruments, and lab consumables' },
    { name: 'Reagents', description: 'Analytical and research-grade reagents' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const [c] = await db.insert(schema.categories)
      .values(cat)
      .onConflictDoNothing()
      .returning();
    if (c) categories.push(c);
  }

  console.log(`✅ ${categories.length} categories created\n`);

  // ─── Create Products ───────────────────────────────────
  // Prices are per base unit (per gram, per mL, or per unit)
  // Stock quantities are in base units
  if (categories.length > 0) {
    const productData = [
      {
        name: 'Sodium Chloride (NaCl)',
        sku: 'CHEM-NaCl-001',
        description: 'Laboratory grade sodium chloride. Purity ≥99.5%. White crystalline powder suitable for analytical and research applications.',
        categoryId: categories[0]?.id,
        dimension: 'weight' as const,
        baseUnit: 'g' as const,
        basePrice: '0.050000',      // ₹0.05 per gram = ₹50 per kg
        stockQuantity: '50000.000000', // 50 kg = 50,000 grams
        minOrderQuantity: '100.000000',
      },
      {
        name: 'Ethanol (C₂H₅OH) 99%',
        sku: 'SOLV-ETH-001',
        description: 'Absolute ethanol, 99% purity. Suitable for HPLC, spectroscopy, and synthesis. Denatured for laboratory use only.',
        categoryId: categories[1]?.id,
        dimension: 'volume' as const,
        baseUnit: 'mL' as const,
        basePrice: '0.080000',      // ₹0.08 per mL = ₹80 per L
        stockQuantity: '25000.000000', // 25 L = 25,000 mL
        minOrderQuantity: '100.000000',
      },
      {
        name: 'Hydrochloric Acid (HCl) 37%',
        sku: 'ACID-HCl-001',
        description: 'Concentrated hydrochloric acid, 37% w/w. ACS reagent grade. Handle with extreme care. For laboratory and industrial applications.',
        categoryId: categories[2]?.id,
        dimension: 'volume' as const,
        baseUnit: 'mL' as const,
        basePrice: '0.120000',      // ₹0.12 per mL = ₹120 per L
        stockQuantity: '15000.000000', // 15 L
        minOrderQuantity: '500.000000',
      },
      {
        name: 'Borosilicate Glass Beaker Set',
        sku: 'EQUIP-BKR-001',
        description: 'Set of 5 borosilicate glass beakers (50mL, 100mL, 250mL, 500mL, 1000mL). Heat-resistant, graduated markings.',
        categoryId: categories[3]?.id,
        dimension: 'count' as const,
        baseUnit: 'unit' as const,
        basePrice: '450.000000',    // ₹450 per set
        stockQuantity: '120.000000',
        minOrderQuantity: '1.000000',
      },
      {
        name: 'Sulfuric Acid (H₂SO₄) 98%',
        sku: 'ACID-H2SO4-001',
        description: 'Concentrated sulfuric acid, 98% purity. AR grade. Highly corrosive. Use appropriate PPE and fume hood.',
        categoryId: categories[2]?.id,
        dimension: 'volume' as const,
        baseUnit: 'mL' as const,
        basePrice: '0.150000',      // ₹0.15 per mL = ₹150 per L
        stockQuantity: '10000.000000', // 10 L
        minOrderQuantity: '500.000000',
      },
      {
        name: 'Potassium Permanganate (KMnO₄)',
        sku: 'REAG-KMnO4-001',
        description: 'Potassium permanganate crystals, AR grade. Strong oxidizing agent used in titrations, water treatment, and organic synthesis.',
        categoryId: categories[4]?.id,
        dimension: 'weight' as const,
        baseUnit: 'g' as const,
        basePrice: '0.300000',      // ₹0.30 per gram = ₹300 per kg
        stockQuantity: '5000.000000', // 5 kg
        minOrderQuantity: '50.000000',
      },
      {
        name: 'Distilled Water',
        sku: 'SOLV-H2O-001',
        description: 'Triple-distilled water for laboratory use. Conductivity < 1 µS/cm. Suitable for preparation of solutions and rinsing.',
        categoryId: categories[1]?.id,
        dimension: 'volume' as const,
        baseUnit: 'mL' as const,
        basePrice: '0.002000',      // ₹0.002 per mL = ₹2 per L
        stockQuantity: '200000.000000', // 200 L
        minOrderQuantity: '1000.000000',
      },
      {
        name: 'pH Indicator Strips (Universal)',
        sku: 'EQUIP-PH-001',
        description: 'Universal pH indicator strips, range 1-14. Pack of 100 strips with color chart. Quick and reliable pH testing.',
        categoryId: categories[3]?.id,
        dimension: 'count' as const,
        baseUnit: 'unit' as const,
        basePrice: '150.000000',    // ₹150 per pack
        stockQuantity: '200.000000',
        minOrderQuantity: '1.000000',
      },
      {
        name: 'Acetone (CH₃COCH₃)',
        sku: 'SOLV-ACE-001',
        description: 'Acetone, ACS reagent grade ≥99.5%. Common laboratory solvent for cleaning, extraction, and organic synthesis.',
        categoryId: categories[1]?.id,
        dimension: 'volume' as const,
        baseUnit: 'mL' as const,
        basePrice: '0.060000',      // ₹0.06 per mL = ₹60 per L
        stockQuantity: '30000.000000', // 30 L
        minOrderQuantity: '250.000000',
      },
      {
        name: 'Calcium Carbonate (CaCO₃)',
        sku: 'CHEM-CaCO3-001',
        description: 'Precipitated calcium carbonate, pure grade. Fine white powder used in neutralization, as a filler, and in formulations.',
        categoryId: categories[0]?.id,
        dimension: 'weight' as const,
        baseUnit: 'g' as const,
        basePrice: '0.025000',      // ₹0.025 per gram = ₹25 per kg
        stockQuantity: '100000.000000', // 100 kg
        minOrderQuantity: '500.000000',
      },
    ];

    for (const product of productData) {
      await db.insert(schema.products)
        .values(product)
        .onConflictDoNothing();
    }

    console.log(`✅ ${productData.length} products created\n`);
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
