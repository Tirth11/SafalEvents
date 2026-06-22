import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const events: any[] = [];

// Get all events
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userEvents = events.filter(e => e.userId === req.userId);
    
    res.json({
      success: true,
      data: userEvents,
    });
  } catch (error) {
    next(error);
  }
});

// Create event
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = {
      id: `evt_${Date.now()}`,
      ...req.body,
      userId: req.userId,
      status: 'planned',
      participants: [],
      expenses: [],
      createdAt: new Date(),
    };

    events.push(event);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
