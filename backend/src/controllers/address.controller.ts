import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sanitize } from '../middlewares/sanitize.middleware';

const addressSchema = z.object({
  label: z.string().min(1, 'Label wajib diisi').max(50),
  recipientName: z.string().min(1, 'Nama penerima wajib diisi').max(100),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, 'Nomor telepon tidak valid'),
  addressLine: z.string().min(1, 'Alamat lengkap wajib diisi').max(500),
  city: z.string().min(1, 'Kota wajib diisi').max(100),
  province: z.string().min(1, 'Provinsi wajib diisi').max(100),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit angka'),
  isDefault: z.boolean().optional(),
});

export const getAddresses = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const addresses = await prisma.deliveryAddress.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(addresses);
};

export const createAddress = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const sanitizedData = {
    label: sanitize(data.label),
    recipientName: sanitize(data.recipientName),
    phone: sanitize(data.phone),
    addressLine: sanitize(data.addressLine),
    city: sanitize(data.city),
    province: sanitize(data.province),
    postalCode: sanitize(data.postalCode),
    isDefault: data.isDefault,
  };

  const address = await prisma.$transaction(async (tx) => {
    if (sanitizedData.isDefault) {
      await tx.deliveryAddress.updateMany({
        where: { buyerId },
        data: { isDefault: false },
      });
    }

    return tx.deliveryAddress.create({
      data: {
        ...sanitizedData,
        isDefault: sanitizedData.isDefault || false,
        buyerId,
      },
    });
  });

  res.status(201).json(address);
};

export const updateAddress = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { id } = req.params;
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const sanitizedData = {
    label: sanitize(data.label),
    recipientName: sanitize(data.recipientName),
    phone: sanitize(data.phone),
    addressLine: sanitize(data.addressLine),
    city: sanitize(data.city),
    province: sanitize(data.province),
    postalCode: sanitize(data.postalCode),
    isDefault: data.isDefault,
  };

  const existing = await prisma.deliveryAddress.findUnique({ where: { id } });
  if (!existing || existing.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Alamat tidak ditemukan' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (sanitizedData.isDefault) {
      await tx.deliveryAddress.updateMany({
        where: { buyerId },
        data: { isDefault: false },
      });
    }

    return tx.deliveryAddress.update({
      where: { id },
      data: {
        ...sanitizedData,
        isDefault: sanitizedData.isDefault || false,
      },
    });
  });

  res.json(updated);
};

export const deleteAddress = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.deliveryAddress.findUnique({ where: { id } });
  if (!existing || existing.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Alamat tidak ditemukan' });
  }

  await prisma.deliveryAddress.delete({ where: { id } });
  res.json({ message: 'Alamat dihapus' });
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { id } = req.params;

  const existing = await prisma.deliveryAddress.findUnique({ where: { id } });
  if (!existing || existing.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Alamat tidak ditemukan' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.deliveryAddress.updateMany({
      where: { buyerId },
      data: { isDefault: false },
    });

    return tx.deliveryAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  });

  res.json(updated);
};
