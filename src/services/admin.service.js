import redis from '../config/redis.js';

const key = 'admin';

export const ensureAdmin = async () => {
  const exists = await redis.exists(key);
  if (!exists) {
    console.warn('[WARN] Admin belum di-set. Jalankan script setup: npm run setup-admin');
  }
};

export const getAdmin = async () => {
  return await redis.hgetall(key);
};

export const setAdmin = async ({ email, passwordHash }) => {
  await redis.hset(key, {
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
};
