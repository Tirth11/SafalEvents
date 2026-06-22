import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const purchases: any[] = [];

// Get all purchases
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userPurchases = purchases.filter(p => p.userId === req.userId);
    
    res.json({
      success: true,
      data: userPurchases,
    });
  } catch (error) {
    next(error);
  }
});

// Create purchase
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, brand, category, price, purchaseDate, store, quantity, notes, warranty } = req.body;

    const purchase = {
      id: `pur_${Date.now()}`,
      userId: req.userId,
      name,
      brand: brand || null,
      category,
      price: parseFloat(price),
      currency: 'USD',
      purchaseDate: purchaseDate || new Date().toISOString(),
      store: store || null,
      quantity: quantity || 1,
      notes: notes || null,
      warranty: warranty || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    purchases.push(purchase);

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
