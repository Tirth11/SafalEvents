import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error.middleware';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Not authorized. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    req.userId = decoded.userId;
    
    // In production, fetch user from database
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    // if (!user) throw createError(401, 'User not found');
    // req.user = user;

    next();
  } catch (error) {
    next(createError(401, 'Not authorized. Invalid token.'));
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    next();
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // In production, check if user has admin role
  // if (!req.user || req.user.role !== 'admin') {
  //   throw createError(403, 'Access denied. Admin only.');
  // }
  next();
};
