import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const warranties: any[] = [];

// Get all warranties
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userWarranties = warranties.filter(w => w.userId === req.userId);
    
    res.json({
      success: true,
      data: userWarranties,
    });
  } catch (error) {
    next(error);
  }
});

// Create warranty
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const warranty = {
      id: `war_${Date.now()}`,
      ...req.body,
      userId: req.userId,
      createdAt: new Date(),
    };

    warranties.push(warranty);

    res.status(201).json({
      success: true,
      data: warranty,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
