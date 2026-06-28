import { prisma } from '../utils/prisma';
import { getSystemTime } from '../utils/time';

export const checkAndProcessOverdueOrders = async () => {
  const now = await getSystemTime();
  const activeStatuses = ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'];

  const orders = await prisma.order.findMany({
    where: {
      status: { in: activeStatuses },
    },
  });

  let processedCount = 0;

  for (const order of orders) {
    const elapsedMs = now.getTime() - order.createdAt.getTime();
    let limitMs = 0;
    if (order.deliveryMethod === 'INSTANT') {
      limitMs = 2 * 60 * 60 * 1000; // 2 hours
    } else if (order.deliveryMethod === 'NEXT_DAY') {
      limitMs = 24 * 60 * 60 * 1000; // 24 hours
    } else {
      limitMs = 72 * 60 * 60 * 1000; // 72 hours (3 days)
    }

    if (elapsedMs > limitMs) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update status
          await tx.order.update({
            where: { id: order.id },
            data: { 
              status: 'DIKEMBALIKAN',
              updatedAt: now
            }
          });

          // 2. Add history
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'DIKEMBALIKAN',
              note: 'Pesanan dibatalkan otomatis oleh sistem karena keterlambatan pengiriman (melebihi batas waktu SLA)',
              createdAt: now
            }
          });

          // 3. Refund wallet
          const wallet = await tx.wallet.upsert({
            where: { buyerId: order.buyerId },
            create: { buyerId: order.buyerId, balance: order.totalAmount },
            update: { balance: { increment: order.totalAmount } }
          });

          // 4. Record transaction
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'REFUND',
              amount: order.totalAmount,
              description: `Refund otomatis pesanan #${order.id.slice(-8)} akibat keterlambatan`,
              orderId: order.id,
              createdAt: now
            }
          });

          // 5. Restore product stock
          const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          }
        });
        processedCount++;
      } catch (err: any) {
        console.error(`[CRON] Failed to cancel overdue order #${order.id}:`, err.message);
      }
    }
  }

  if (processedCount > 0) {
    console.log(`[CRON] Overdue check ran. Processed: ${processedCount} orders`);
  }
};
