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
  voucherCode?: string;
  promoCode?: string;
}

export const executeCheckout = async ({
  buyerId,
  deliveryAddressId,
  deliveryMethod,
  voucherCode,
  promoCode,
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

    let voucherDiscount = 0;
    let promoDiscount = 0;
    let dbVoucher = null;
    let dbPromo = null;

    if (voucherCode) {
      dbVoucher = await tx.voucher.findUnique({ where: { code: voucherCode } });
      if (!dbVoucher) {
        throw new Error('Voucher tidak ditemukan');
      }
      if (dbVoucher.storeId !== storeId) {
        throw new Error('Voucher tidak berlaku untuk toko ini');
      }
      if (dbVoucher.usedCount >= dbVoucher.limitCount) {
        throw new Error('Kuota voucher sudah habis');
      }
      if (subtotal < dbVoucher.minPurchase) {
        throw new Error(`Minimal pembelian untuk voucher adalah Rp ${dbVoucher.minPurchase.toLocaleString('id-ID')}`);
      }

      if (dbVoucher.discountType === 'FIXED') {
        voucherDiscount = dbVoucher.discountValue;
      } else {
        voucherDiscount = subtotal * (dbVoucher.discountValue / 100);
        if (dbVoucher.maxDiscount) {
          voucherDiscount = Math.min(voucherDiscount, dbVoucher.maxDiscount);
        }
      }
      voucherDiscount = Math.min(voucherDiscount, subtotal);
    }

    if (promoCode) {
      dbPromo = await tx.promo.findUnique({ where: { code: promoCode } });
      if (!dbPromo) {
        throw new Error('Promo tidak ditemukan');
      }
      if (dbPromo.usedCount >= dbPromo.limitCount) {
        throw new Error('Kuota promo sudah habis');
      }
      const remainingSubtotal = subtotal - voucherDiscount;
      if (remainingSubtotal < dbPromo.minPurchase) {
        throw new Error(`Minimal pembelian untuk promo adalah Rp ${dbPromo.minPurchase.toLocaleString('id-ID')}`);
      }

      if (dbPromo.discountType === 'FIXED') {
        promoDiscount = dbPromo.discountValue;
      } else {
        promoDiscount = remainingSubtotal * (dbPromo.discountValue / 100);
        if (dbPromo.maxDiscount) {
          promoDiscount = Math.min(promoDiscount, dbPromo.maxDiscount);
        }
      }
      promoDiscount = Math.min(promoDiscount, remainingSubtotal);
    }

    const discountAmount = voucherDiscount + promoDiscount;
    const deliveryFee = DELIVERY_FEES[deliveryMethod];

    const taxBase = Math.max(0, subtotal - discountAmount) + deliveryFee;
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
        voucherId: dbVoucher?.id || null,
        promoId: dbPromo?.id || null,
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

    // 11. Increment voucher / promo counters
    if (dbVoucher) {
      await tx.voucher.update({
        where: { id: dbVoucher.id },
        data: { usedCount: { increment: 1 } },
      });
    }
    if (dbPromo) {
      await tx.promo.update({
        where: { id: dbPromo.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 12. Empty cart
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
