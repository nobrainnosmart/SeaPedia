import { prisma } from '../utils/prisma';

export const DELIVERY_FEES: Record<string, number> = {
  INSTANT: 25000,
  NEXT_DAY: 15000,
  REGULAR: 9000,
};

interface CheckoutParams {
  buyerId: string;
  deliveryAddressId: string;
  deliveryMethod: 'INSTANT' | 'NEXT_DAY' | 'REGULAR';
}

export const executeCheckout = async ({
  buyerId,
  deliveryAddressId,
  deliveryMethod,
}: CheckoutParams) => {
  if (!DELIVERY_FEES[deliveryMethod]) {
    throw new Error('Metode pengiriman tidak valid');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Cart and items
    const cart = await tx.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang kosong');
    }

    const storeId = cart.storeId;
    if (!storeId) {
      throw new Error('Informasi toko tidak ditemukan di keranjang');
    }

    // Find store owner (sellerId)
    const store = await tx.store.findUnique({
      where: { id: storeId },
      select: { sellerId: true },
    });
    if (!store) {
      throw new Error('Toko tidak ditemukan');
    }

    // 2. Fetch address and verify ownership
    const address = await tx.deliveryAddress.findUnique({
      where: { id: deliveryAddressId },
    });
    if (!address || address.buyerId !== buyerId) {
      throw new Error('Alamat pengiriman tidak valid');
    }

    // 3. Compute costs
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = DELIVERY_FEES[deliveryMethod];
    const discountAmount = 0; // (Will support Level 4 discounts later)

    const taxBase = subtotal - discountAmount + deliveryFee;
    const taxAmount = taxBase * 0.12; // 12% PPN
    const totalAmount = taxBase + taxAmount;

    // 4. Verify wallet balance
    const wallet = await tx.wallet.upsert({
      where: { buyerId },
      create: { buyerId, balance: 0 },
      update: {},
    });

    if (wallet.balance < totalAmount) {
      throw new Error('Saldo tidak mencukupi');
    }

    // 5. Decrement stock and verify availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Stok produk '${item.product.name}' tidak mencukupi`);
      }
      if (!item.product.isActive) {
        throw new Error(`Produk '${item.product.name}' sudah tidak aktif`);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 6. Create Order
    const order = await tx.order.create({
      data: {
        buyerId,
        sellerId: store.sellerId,
        storeId,
        deliveryMethod,
        deliveryAddressId,
        subtotal,
        discountAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        status: 'SEDANG_DIKEMAS',
      },
    });

    // 7. Create OrderItems snapshot
    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        },
      });
    }

    // 8. Create OrderStatusHistory
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'SEDANG_DIKEMAS',
        note: 'Pesanan dibuat',
      },
    });

    // 9. Deduct buyer wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: totalAmount } },
    });

    // 10. Record transaction
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'PAYMENT',
        amount: totalAmount,
        description: `Pembayaran pesanan #${order.id.slice(-8)}`,
        orderId: order.id,
      },
    });

    // 11. Empty cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    await tx.cart.update({
      where: { id: cart.id },
      data: { storeId: null },
    });

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        statusHistory: true,
      },
    });
  });
};
