import crypto from 'crypto';
import redis from '../config/redis.js';

const generateKey = () => `sk_${crypto.randomBytes(24).toString('hex')}`;
const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

const listKey = 'apikeys:list';

const addToList = async (id) => {
  await redis.sadd(listKey, id);
};

export const normPhoneId = (raw) => {
  let s = String(raw || '').replace(/\D/g, '');
  if (!s) return null;
  if (s.startsWith('62')) s = '0' + s.slice(2);
  else if (s.startsWith('8')) s = '0' + s;
  return s;
};

export const createApiKey = async ({
  name,
  nomor,
  type = 'user',
  expiresAt,
  expiresInDays,
  createdBy = 'admin',
}) => {
  const id = `k_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const key = type === 'admin' ? `skadm_${crypto.randomBytes(24).toString('hex')}` : generateKey();
  const hashedKey = hashKey(key);

  let expiryIso = '';
  if (expiresInDays !== undefined && expiresInDays !== null && String(expiresInDays) !== '') {
    const days = Number(expiresInDays);
    if (!isNaN(days) && days > 0) {
      expiryIso = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
  } else if (expiresAt) {
    expiryIso = new Date(expiresAt).toISOString();
  }

  const record = {
    id,
    hashedKey,
    name: name || 'Unnamed',
    nomor: nomor ? normPhoneId(nomor) || String(nomor).trim() : '',
    type,
    active: '1',
    createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: expiryIso,
  };

  await redis.hset(`apikey:${id}`, record);
  await redis.set(`apikey:hash:${hashedKey}`, id);
  await addToList(id);

  return {
    id,
    key,
    name: record.name,
    nomor: record.nomor || null,
    type,
    expiresAt: expiryIso || null,
    createdAt: record.createdAt,
  };
};

export const verifyApiKey = async (rawKey) => {
  if (!rawKey) return { valid: false, reason: 'MISSING_API_KEY' };

  const id = await redis.get(`apikey:hash:${hashKey(rawKey)}`);
  if (!id) return { valid: false, reason: 'INVALID_API_KEY' };

  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return { valid: false, reason: 'INVALID_API_KEY' };

  if (String(rec.active) !== '1') return { valid: false, reason: 'REVOKED_API_KEY', id, rec };

  if (rec.expiresAt) {
    const exp = new Date(rec.expiresAt).getTime();
    if (!isNaN(exp) && Date.now() > exp) {
      return { valid: false, reason: 'EXPIRED_API_KEY', id, rec };
    }
  }

  return { valid: true, id, rec };
};

export const listApiKeys = async () => {
  const ids = await redis.smembers(listKey);
  const keys = await Promise.all(
    ids.map(async (id) => {
      const rec = await redis.hgetall(`apikey:${id}`);
      if (!rec || !rec.id) return null;
      const { hashedKey, ...safe } = rec;
      return safe;
    })
  );
  return keys.filter(Boolean);
};

export const getApiKeyById = async (id) => {
  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return null;
  const { hashedKey, ...safe } = rec;
  return safe;
};

export const revokeApiKey = async (id) => {
  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return null;
  await redis.hset(`apikey:${id}`, { active: '0' });
  return { ...rec, active: '0' };
};

export const activateApiKey = async (id) => {
  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return null;
  await redis.hset(`apikey:${id}`, { active: '1' });
  return { ...rec, active: '1' };
};

export const updateApiKeyExpiry = async (id, expiresAt) => {
  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return null;
  const iso = expiresAt ? new Date(expiresAt).toISOString() : '';
  await redis.hset(`apikey:${id}`, { expiresAt: iso });
  return { ...rec, expiresAt: iso };
};

export const deleteApiKey = async (id) => {
  const rec = await redis.hgetall(`apikey:${id}`);
  if (!rec || !rec.id) return null;
  await redis.del(`apikey:${id}`);
  await redis.del(`apikey:hash:${rec.hashedKey}`);
  await redis.srem(listKey, id);
  return true;
};

export const checkApiKeys = async (rawKeys) => {
  return Promise.all(
    rawKeys.map(async (rawKey) => {
      const trimmed = String(rawKey || '').trim();
      if (!trimmed) return { key: trimmed, valid: false, status: 'invalid' };

      const id = await redis.get(`apikey:hash:${hashKey(trimmed)}`);
      if (!id) return { key: trimmed, valid: false, status: 'invalid' };

      const rec = await redis.hgetall(`apikey:${id}`);
      if (!rec || !rec.id) return { key: trimmed, valid: false, status: 'invalid' };

      const item = {
        key: trimmed,
        id: rec.id,
        name: rec.name,
        nomor: rec.nomor || null,
        type: rec.type || 'user',
        createdAt: rec.createdAt,
        expiresAt: rec.expiresAt || null,
      };

      if (String(rec.active) !== '1') {
        return { ...item, valid: false, status: 'revoked' };
      }

      if (rec.expiresAt) {
        const exp = new Date(rec.expiresAt).getTime();
        if (!isNaN(exp) && Date.now() > exp) {
          return { ...item, valid: false, status: 'expired' };
        }
        item.sisaHari = Math.floor((exp - Date.now()) / 86400000);
      }

      return { ...item, valid: true, status: 'active' };
    })
  );
};
