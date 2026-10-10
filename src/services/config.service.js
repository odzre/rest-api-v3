import redis from '../config/redis.js';

const CONFIG_KEY = 'config:getcontact';

export const CONFIG_FIELDS = [
  'baseURL',
  'clientDeviceId',
  'hmacSecretKey',
  'androidOS',
  'appVersion',
  'lang',
  'countryCode',
  'finalKey',
  'token',
];

const SENSITIVE_FIELDS = ['finalKey', 'token', 'hmacSecretKey'];

export const getGetContactConfig = async () => {
  const stored = await redis.hgetall(CONFIG_KEY);
  return stored || {};
};

export const setGetContactConfig = async (values) => {
  const update = {};
  for (const f of CONFIG_FIELDS) {
    if (values[f] !== undefined && values[f] !== null && String(values[f]).trim() !== '') {
      update[f] = String(values[f]).trim();
    }
  }
  if (Object.keys(update).length > 0) {
    await redis.hset(CONFIG_KEY, update);
  }
  return update;
};

export const clearGetContactConfig = async () => {
  await redis.del(CONFIG_KEY);
};

export const maskConfig = (config) => {
  const out = {};
  for (const [k, v] of Object.entries(config)) {
    if (!v) {
      out[k] = null;
    } else if (SENSITIVE_FIELDS.includes(k)) {
      out[k] = String(v).length > 10 ? '••••••••' + String(v).slice(-6) : '••••••••';
    } else {
      out[k] = v;
    }
  }
  return out;
};
