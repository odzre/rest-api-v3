import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'change-this-to-a-random-secret';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

export const signAdminToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAdminToken = (token) => {
  return jwt.verify(token, secret);
};
