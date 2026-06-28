import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSystemTime, setSystemTimeOffset } from '../utils/time';
import { z } from 'zod';

const timeSimulationSchema = z.object({
  hours: z.number().nonnegative().optional(),
  days: z.number().nonnegative().optional(),
  reset: z.boolean().optional(),
});

// GET /admin/delivery-jobs
export const getDeliveryJobsAdmin = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.order.findMany({
      include: {
        buyer: { select: { username: true } },
        seller: { select: { username: true } },
        store: { select: { name: true } },
        deliveryAddress: true,
        driver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/overdue
export const getOverdueOrdersAdmin = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'] },
      },
      include: {
        buyer: { select: { username: true } },
        store: { select: { name: true } },
        driver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = await getSystemTime();
    
    // Filter overdue orders
    const overdue = orders.filter((order) => {
      const elapsedMs = now.getTime() - order.createdAt.getTime();
      let limitMs = 0;
      if (order.deliveryMethod === 'INSTANT') {
        limitMs = 2 * 60 * 60 * 1000;
      } else if (order.deliveryMethod === 'NEXT_DAY') {
        limitMs = 24 * 60 * 60 * 1000;
      } else {
        limitMs = 72 * 60 * 60 * 1000; // 3 days
      }
      return elapsedMs > limitMs;
    });

    res.json(overdue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/time-simulation
export const getTimeSimulation = async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'time_offset' } });
    const offsetMs = config ? Number(config.value) : 0;
    const virtualTime = new Date(Date.now() + offsetMs);
    
    res.json({
      realTime: new Date(),
      virtualTime,
      offsetMs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/time-simulation
export const updateTimeSimulation = async (req: Request, res: Response) => {
  const parsed = timeSimulationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { hours, days, reset } = parsed.data;

  try {
    let offsetMs = 0;
    
    if (!reset) {
      const config = await prisma.systemConfig.findUnique({ where: { key: 'time_offset' } });
      const currentOffset = config ? Number(config.value) : 0;
      
      const hoursMs = (hours || 0) * 60 * 60 * 1000;
      const daysMs = (days || 0) * 24 * 60 * 60 * 1000;
      offsetMs = currentOffset + hoursMs + daysMs;
    }
    
    await setSystemTimeOffset(offsetMs);
    const virtualTime = new Date(Date.now() + offsetMs);
    
    res.json({
      message: reset ? 'Simulasi waktu direset ke waktu nyata' : `Simulasi waktu dipercepat sebesar ${hours || 0} jam, ${days || 0} hari`,
      realTime: new Date(),
      virtualTime,
      offsetMs,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
