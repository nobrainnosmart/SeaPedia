import { prisma } from './prisma';

let cachedOffset: number | null = null;
let lastFetched = 0;
const CACHE_TTL = 1000; // 1 second cache TTL to avoid database overhead

export const getSystemTime = async (): Promise<Date> => {
  const now = Date.now();
  if (cachedOffset !== null && now - lastFetched < CACHE_TTL) {
    return new Date(now + cachedOffset);
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'time_offset' },
    });
    if (config) {
      cachedOffset = Number(config.value) || 0;
    } else {
      cachedOffset = 0;
    }
  } catch (err) {
    cachedOffset = 0;
  }
  lastFetched = now;
  return new Date(Date.now() + cachedOffset);
};

export const setSystemTimeOffset = async (offsetMs: number): Promise<void> => {
  await prisma.systemConfig.upsert({
    where: { key: 'time_offset' },
    create: { key: 'time_offset', value: String(offsetMs) },
    update: { value: String(offsetMs) },
  });
  cachedOffset = offsetMs;
  lastFetched = Date.now();
};
