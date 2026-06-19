import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Generate report
router.post('/generate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.body;

    // Mock report data
    const report = {
      id: `rpt_${Date.now()}`,
      type,
      startDate,
      endDate,
      data: {
        totalExpenses: 2450.00,
        categoryBreakdown: [
          { category: 'Food & Dining', amount: 850, percentage: 35 },
          { category: 'Transportation', amount: 500, percentage: 20 },
          { category: 'Shopping', amount: 650, percentage: 27 },
          { category: 'Others', amount: 450, percentage: 18 },
        ],
        insights: [
          'Your food expenses increased by 15% compared to last month',
          'You saved $200 by reducing entertainment spending',
        ],
      },
      generatedAt: new Date(),
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
