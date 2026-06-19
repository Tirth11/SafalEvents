import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const familyMembers: any[] = [];

// Get family members
router.get('/members', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const members = familyMembers.filter(m => m.userId === req.userId);
    
    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

// Add family member
router.post('/members', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const member = {
      id: `fm_${Date.now()}`,
      ...req.body,
      userId: req.userId,
      joinedAt: new Date(),
    };

    familyMembers.push(member);

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
