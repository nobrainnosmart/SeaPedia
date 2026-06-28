import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sanitize } from '../middlewares/sanitize.middleware';

const voucherSchema = z.object({
  code: z.string().min(1, 'Kode voucher wajib diisi').max(20).toUpperCase(),
  discountType: z.enum(['FIXED', 'PERCENT']),
  discountValue: z.number().positive('Nilai diskon harus lebih besar dari 0'),
  minPurchase: z.number().nonnegative('Minimal pembelian tidak boleh negatif'),
  maxDiscount: z.number().positive().optional().nullable(),
  limitCount: z.number().int().positive('Batas penggunaan harus berupa angka positif'),
}).refine((data) => {
  if (data.discountType === 'PERCENT') {
    return data.discountValue <= 100;
  }
  return data.discountValue <= 1000000;
}, {
  message: 'Diskon persen maksimal 100%, diskon tetap maksimal Rp 1.000.000',
  path: ['discountValue'],
});

const promoSchema = z.object({
  code: z.string().min(1, 'Kode promo wajib diisi').max(20).toUpperCase(),
  discountType: z.enum(['FIXED', 'PERCENT']),
  discountValue: z.number().positive('Nilai diskon harus lebih besar dari 0'),
  minPurchase: z.number().nonnegative('Minimal pembelian tidak boleh negatif'),
  maxDiscount: z.number().positive().optional().nullable(),
  limitCount: z.number().int().positive('Batas penggunaan harus berupa angka positif'),
}).refine((data) => {
  if (data.discountType === 'PERCENT') {
    return data.discountValue <= 100;
  }
  return data.discountValue <= 1000000;
}, {
  message: 'Diskon persen maksimal 100%, diskon tetap maksimal Rp 1.000.000',
  path: ['discountValue'],
});

const validateSchema = z.object({
  code: z.string().min(1, 'Kode wajib diisi').toUpperCase(),
});

// Seller Vouchers
export const createVoucher = async (req: Request, res: Response) => {
  const parsed = voucherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const sanitizedCode = sanitize(data.code).toUpperCase();

  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) {
    return res.status(400).json({ error: 'Buat toko terlebih dahulu' });
  }

  // Check unique code
  const existingVoucher = await prisma.voucher.findUnique({ where: { code: sanitizedCode } });
  const existingPromo = await prisma.promo.findUnique({ where: { code: sanitizedCode } });
  if (existingVoucher || existingPromo) {
    return res.status(409).json({ error: 'Kode diskon sudah digunakan' });
  }

  const voucher = await prisma.voucher.create({
    data: {
      ...data,
      code: sanitizedCode,
      storeId: store.id,
      sellerId: req.user!.userId,
    },
  });

  res.status(201).json(voucher);
};

export const getSellerVouchers = async (req: Request, res: Response) => {
  const vouchers = await prisma.voucher.findMany({
    where: { sellerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(vouchers);
};

// Admin Promos
export const createPromo = async (req: Request, res: Response) => {
  const parsed = promoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const sanitizedCode = sanitize(data.code).toUpperCase();

  // Check unique code
  const existingVoucher = await prisma.voucher.findUnique({ where: { code: sanitizedCode } });
  const existingPromo = await prisma.promo.findUnique({ where: { code: sanitizedCode } });
  if (existingVoucher || existingPromo) {
    return res.status(409).json({ error: 'Kode diskon sudah digunakan' });
  }

  const promo = await prisma.promo.create({
    data: {
      ...data,
      code: sanitizedCode,
    },
  });

  res.status(201).json(promo);
};

export const getPromos = async (req: Request, res: Response) => {
  const promos = await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(promos);
};

// Public/Buyer code validation
export const validateDiscount = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { code } = parsed.data;

  const sanitizedCode = sanitize(code).toUpperCase();

  // Fetch cart
  const cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Keranjang belanja kosong' });
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Check Promo first
  const promo = await prisma.promo.findUnique({ where: { code: sanitizedCode } });
  if (promo) {
    if (promo.usedCount >= promo.limitCount) {
      return res.status(400).json({ error: 'Kuota promo sudah habis' });
    }
    if (subtotal < promo.minPurchase) {
      return res.status(400).json({
        error: `Minimal pembelian untuk promo adalah Rp ${promo.minPurchase.toLocaleString('id-ID')}`,
      });
    }

    let discount = 0;
    if (promo.discountType === 'FIXED') {
      discount = promo.discountValue;
    } else {
      discount = subtotal * (promo.discountValue / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    }
    discount = Math.min(discount, subtotal);

    return res.json({
      type: 'PROMO',
      code: promo.code,
      discountAmount: discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });
  }

  // Check Store Voucher
  const voucher = await prisma.voucher.findUnique({ where: { code: sanitizedCode } });
  if (voucher) {
    if (voucher.storeId !== cart.storeId) {
      return res.status(400).json({ error: 'Voucher tidak berlaku untuk produk di keranjang ini' });
    }
    if (voucher.usedCount >= voucher.limitCount) {
      return res.status(400).json({ error: 'Kuota voucher sudah habis' });
    }
    if (subtotal < voucher.minPurchase) {
      return res.status(400).json({
        error: `Minimal pembelian untuk voucher adalah Rp ${voucher.minPurchase.toLocaleString('id-ID')}`,
      });
    }

    let discount = 0;
    if (voucher.discountType === 'FIXED') {
      discount = voucher.discountValue;
    } else {
      discount = subtotal * (voucher.discountValue / 100);
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    }
    discount = Math.min(discount, subtotal);

    return res.json({
      type: 'VOUCHER',
      code: voucher.code,
      discountAmount: discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
    });
  }

  res.status(404).json({ error: 'Kode diskon tidak ditemukan atau tidak valid' });
};
