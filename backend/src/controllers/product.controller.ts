import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(100, 'Nama produk maksimal 100 karakter'),
  description: z.string().min(1, 'Deskripsi produk wajib diisi').max(1000, 'Deskripsi maksimal 1000 karakter'),
  price: z.number().positive('Harga harus lebih besar dari 0'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().url('URL gambar tidak valid').or(z.string().length(0)).optional().nullable(),
});

export const createProduct = async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, price, stock, imageUrl } = parsed.data;

  // Find seller's store
  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) {
    return res.status(400).json({ error: 'Buat toko terlebih dahulu' });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl: imageUrl || null,
      storeId: store.id,
    },
  });

  res.status(201).json(product);
};

export const getSellerProducts = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({ where: { sellerId: req.user!.userId } });
  if (!store) {
    return res.status(400).json({ error: 'Buat toko terlebih dahulu' });
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(products);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, price, stock, imageUrl } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }

  if (product.store.sellerId !== req.user!.userId) {
    return res.status(403).json({ error: 'Anda tidak berhak memperbarui produk ini' });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      stock,
      imageUrl: imageUrl || null,
    },
  });

  res.json(updated);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }

  if (product.store.sellerId !== req.user!.userId) {
    return res.status(403).json({ error: 'Anda tidak berhak menghapus produk ini' });
  }

  // Soft delete
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({ message: 'Produk dihapus' });
};

export const getProductsPublic = async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    isActive: true,
    name: { contains: search },
  };

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      store: {
        select: { name: true },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.product.count({ where: whereClause });

  res.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const getProductPublic = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      store: {
        select: { id: true, name: true },
      },
    },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }

  res.json(product);
};
