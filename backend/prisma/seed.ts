import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Admin
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@seapedia.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@seapedia.com',
      password: adminPassword,
      roles: { create: [{ role: 'ADMIN' }] },
    },
  });

  // 2. Seed Seller
  const sellerPassword = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller1@seapedia.com' },
    update: {},
    create: {
      username: 'seller1',
      email: 'seller1@seapedia.com',
      password: sellerPassword,
      roles: { create: [{ role: 'SELLER' }] },
    },
  });

  // 3. Seed Store
  const store = await prisma.store.upsert({
    where: { sellerId: seller.id },
    update: {},
    create: {
      name: 'Toko Elektronik Jaya',
      description: 'Pusat gadget dan komputer terlengkap dan terpercaya.',
      sellerId: seller.id,
    },
  });

  // 4. Seed Products
  const products = [
    { name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro 128GB Titanium Hitam.', price: 20000000, stock: 10 },
    { name: 'Macbook Air M2', description: 'Apple Macbook Air M2 8GB 256GB SSD 13.6-inch.', price: 17500000, stock: 5 },
    { name: 'iPad Air 5', description: 'Apple iPad Air 5 64GB Wi-Fi Only Space Gray.', price: 10000000, stock: 8 },
    { name: 'AirPods Pro 2', description: 'Apple AirPods Pro Gen 2 Active Noise Cancellation.', price: 3500000, stock: 15 },
    { name: 'Apple Watch Series 9', description: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum.', price: 7000000, stock: 12 },
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        storeId: store.id,
      },
    });
  }

  console.log('✅ Seed complete: admin@seapedia.com / Admin123!, seller1@seapedia.com / Seller123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
