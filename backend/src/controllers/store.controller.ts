import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sanitize } from '../middlewares/sanitize.middleware';

const storeSchema = z.object({
  name: z.string().min(1, 'Nama toko wajib diisi').max(100, 'Nama toko maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

export const createStore = async (req: Request, res: Response) => {
  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description } = parsed.data;

  const sanitizedName = sanitize(name);
  const sanitizedDescription = description ? sanitize(description) : undefined;

  // Check unique name
  const existingName = await prisma.store.findUnique({ where: { name: sanitizedName } });
  if (existingName) {
    return res.status(409).json({ error: 'Nama toko sudah digunakan' });
  }

  // Check if seller already has a store
  const existingStore = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (existingStore) {
    return res.status(400).json({ error: 'Anda sudah memiliki toko' });
  }

  const store = await prisma.store.create({
    data: {
      name: sanitizedName,
      description: sanitizedDescription,
      sellerId: req.user!.userId,
    },
  });

  res.status(201).json(store);
};

export const getSellerStore = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({
    where: { sellerId: req.user!.userId },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!store) {
    return res.status(404).json({ error: 'Toko belum dibuat' });
  }

  res.json(store);
};

export const updateStore = async (req: Request, res: Response) => {
  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description } = parsed.data;

  const sanitizedName = sanitize(name);
  const sanitizedDescription = description ? sanitize(description) : undefined;

  const ownStore = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!ownStore) {
    return res.status(404).json({ error: 'Toko tidak ditemukan' });
  }

  // Check unique name (excluding own store)
  const existingName = await prisma.store.findFirst({
    where: {
      name: sanitizedName,
      id: { not: ownStore.id },
    },
  });
  if (existingName) {
    return res.status(409).json({ error: 'Nama toko sudah digunakan' });
  }

  const updated = await prisma.store.update({
    where: { id: ownStore.id },
    data: { name: sanitizedName, description: sanitizedDescription },
  });

  res.json(updated);
};

export const getStorePublic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  const store = await prisma.store.findUnique({
    where: { id },
  });
  if (!store) {
    return res.status(404).json({ error: 'Toko tidak ditemukan' });
  }

  const products = await prisma.product.findMany({
    where: { storeId: id, isActive: true },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.product.count({
    where: { storeId: id, isActive: true },
  });

  res.json({
    store,
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};
