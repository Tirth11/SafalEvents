import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Get credit balance
router.get('/balance', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Mock credit balance
    res.json({
      success: true,
      data: {
        balance: 50,
        plan: 'basic',
        transactions: [
          {
            id: '1',
            amount: -2,
            type: 'usage',
            description: 'Added expense via chat',
            createdAt: new Date(),
          },
          {
            id: '2',
            amount: 100,
            type: 'purchase',
            description: 'Credit pack purchase',
            createdAt: new Date(),
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
});

// Purchase credits
router.post('/purchase', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { packId } = req.body;

    res.json({
      success: true,
      message: 'Credits purchased successfully',
      data: {
        creditsAdded: 100,
        newBalance: 150,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
