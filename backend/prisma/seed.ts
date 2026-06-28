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

  const existingProducts = await prisma.product.findMany({ where: { storeId: store.id } });
  if (existingProducts.length === 0) {
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
  }

  // 5. Seed Buyer
  const buyerPassword = await bcrypt.hash('Buyer123!', 12);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer1@seapedia.com' },
    update: {},
    create: {
      username: 'buyer1',
      email: 'buyer1@seapedia.com',
      password: buyerPassword,
      roles: { create: [{ role: 'BUYER' }] },
    },
  });

  // 6. Seed Wallet for Buyer
  await prisma.wallet.upsert({
    where: { buyerId: buyer.id },
    update: {},
    create: {
      buyerId: buyer.id,
      balance: 5000000, // Rp 5.000.000
    },
  });

  // 7. Seed Delivery Address
  const existingAddresses = await prisma.deliveryAddress.findMany({ where: { buyerId: buyer.id } });
  if (existingAddresses.length === 0) {
    await prisma.deliveryAddress.create({
      data: {
        buyerId: buyer.id,
        label: 'Rumah',
        recipientName: 'Budi Utomo',
        phone: '081234567890',
        addressLine: 'Jl. Merdeka No. 10',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postalCode: '10110',
        isDefault: true,
      },
    });
  }

  // 8. Seed Driver
  const driverPassword = await bcrypt.hash('Driver123!', 12);
  await prisma.user.upsert({
    where: { email: 'driver1@seapedia.com' },
    update: {},
    create: {
      username: 'driver1',
      email: 'driver1@seapedia.com',
      password: driverPassword,
      roles: { create: [{ role: 'DRIVER' }] },
    },
  });

  // 9. Seed Multi-role User
  const multiPassword = await bcrypt.hash('Multi123!', 12);
  await prisma.user.upsert({
    where: { email: 'multi@seapedia.com' },
    update: {},
    create: {
      username: 'multi',
      email: 'multi@seapedia.com',
      password: multiPassword,
      roles: {
        create: [
          { role: 'BUYER' },
          { role: 'SELLER' },
          { role: 'DRIVER' },
        ],
      },
    },
  });

  // 10. Seed Vouchers and Promos
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now

  await prisma.voucher.upsert({
    where: { code: 'SAVE10' },
    update: {},
    create: {
      code: 'SAVE10',
      discountType: 'PERCENT',
      discountValue: 10,
      minPurchase: 50000,
      maxDiscount: 100000,
      limitCount: 100,
      storeId: store.id,
      sellerId: seller.id,
      updatedAt: new Date(),
    },
  });

  await prisma.voucher.upsert({
    where: { code: 'HEMAT20000' },
    update: {},
    create: {
      code: 'HEMAT20000',
      discountType: 'FIXED',
      discountValue: 20000,
      minPurchase: 100000,
      limitCount: 50,
      storeId: store.id,
      sellerId: seller.id,
      updatedAt: new Date(),
    },
  });

  await prisma.promo.upsert({
    where: { code: 'PROMO5' },
    update: {},
    create: {
      code: 'PROMO5',
      discountType: 'PERCENT',
      discountValue: 5,
      minPurchase: 0,
      limitCount: 999999,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Seed complete: admin@seapedia.com / Admin123!, seller1@seapedia.com / Seller123!, buyer1@seapedia.com / Buyer123!, driver1@seapedia.com / Driver123!, multi@seapedia.com / Multi123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
