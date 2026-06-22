import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const receipts: any[] = [];

// Get all receipts
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userReceipts = receipts.filter(r => r.userId === req.userId);
    
    res.json({
      success: true,
      data: userReceipts,
    });
  } catch (error) {
    next(error);
  }
});

// Upload receipt
router.post('/upload', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // In production, handle file upload with multer
    const receipt = {
      id: `rec_${Date.now()}`,
      userId: req.userId,
      imageUrl: '/uploads/receipt.jpg',
      status: 'pending',
      createdAt: new Date(),
    };

    receipts.push(receipt);

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
});

// Process receipt with OCR
router.post('/:id/process', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receipt = receipts.find(r => r.id === req.params.id && r.userId === req.userId);
    
    if (!receipt) {
      throw createError(404, 'Receipt not found');
    }

    // Simulate OCR processing
    const ocrData = {
      storeName: 'Mock Store',
      totalAmount: 99.99,
      confidence: 95,
    };

    receipt.ocrData = ocrData;
    receipt.status = 'processed';

    res.json({
      success: true,
      data: ocrData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
