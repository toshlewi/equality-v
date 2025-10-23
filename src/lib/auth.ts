import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-jwt-key'; // Use NEXTAUTH_SECRET for consistency
const JWT_EXPIRES_IN = '7d'; // Token expiration time

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAuthToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAuthToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};

// Server-side session helper
export const getServerSession = async () => {
  // This will be implemented with NextAuth's getServerSession
  // For now, return null - will be updated when NextAuth is configured
  return null;
};

// Middleware helper for protected routes
export const requireAuth = (roles?: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      // This will be implemented with NextAuth middleware
      // For now, just pass through - will be updated when NextAuth is configured
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication required' });
    }
  };
};

export default {
  hashPassword,
  verifyPassword,
  generateAuthToken,
  verifyAuthToken,
  getServerSession,
  requireAuth
};