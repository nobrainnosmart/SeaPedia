import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  quantity: z.number().int().min(1, 'Kuantitas minimal 1'),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Kuantitas minimal 1'),
});

const getCartWithSubtotal = async (buyerId: string) => {
  let cart = await prisma.cart.upsert({
    where: { buyerId },
    create: { buyerId },
    update: {},
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true, stock: true },
          },
        },
      },
      store: {
        select: { id: true, name: true },
      },
    },
  });

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return {
    ...cart,
    subtotal,
  };
};

export const getCart = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const cart = await getCartWithSubtotal(buyerId);
  res.json(cart);
};

export const addCartItem = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const parsed = cartItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { productId, quantity } = parsed.data;

  // 1. Fetch product
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Produk tidak ditemukan' });
  }

  // 2. Get/create cart
  let cart = await prisma.cart.upsert({
    where: { buyerId },
    create: { buyerId },
    update: {},
  });

  // 3. Single Store Rule
  if (cart.storeId && cart.storeId !== product.storeId) {
    return res.status(409).json({
      error: 'Keranjang sudah berisi produk dari toko lain. Silakan kosongkan keranjang terlebih dahulu.',
      currentStoreId: cart.storeId,
    });
  }

  // 4. Check stock
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  if (product.stock < targetQuantity) {
    return res.status(400).json({ error: `Stok tidak mencukupi. Tersedia: ${product.stock}` });
  }

  // 5. Update items & store relation
  await prisma.$transaction(async (tx) => {
    await tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { storeId: product.storeId },
    });
  });

  const updatedCart = await getCartWithSubtotal(buyerId);
  res.json(updatedCart);
};

export const updateCartItem = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { itemId } = req.params;
  const parsed = updateCartItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { quantity } = parsed.data;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!item || item.cart.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Item keranjang tidak ditemukan' });
  }

  if (item.product.stock < quantity) {
    return res.status(400).json({ error: `Stok tidak mencukupi. Tersedia: ${item.product.stock}` });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const updatedCart = await getCartWithSubtotal(buyerId);
  res.json(updatedCart);
};

export const removeCartItem = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { itemId } = req.params;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Item keranjang tidak ditemukan' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.delete({ where: { id: itemId } });

    // Check if cart is now empty
    const remainingCount = await tx.cartItem.count({
      where: { cartId: item.cartId },
    });

    if (remainingCount === 0) {
      await tx.cart.update({
        where: { id: item.cartId },
        data: { storeId: null },
      });
    }
  });

  const updatedCart = await getCartWithSubtotal(buyerId);
  res.json(updatedCart);
};

export const clearCart = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;

  const cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) return res.status(404).json({ error: 'Keranjang tidak ditemukan' });

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { storeId: null },
    });
  });

  const updatedCart = await getCartWithSubtotal(buyerId);
  res.json(updatedCart);
};
