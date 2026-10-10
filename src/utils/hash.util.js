import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (plain) => {
  return bcrypt.hash(plain, 10);
};

export const comparePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

export const generateApiKey = () => {
  return `sk_${crypto.randomBytes(24).toString('hex')}`;
};

export const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};
