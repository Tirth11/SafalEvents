import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock database
const expenses: any[] = [];

// Get all expenses
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;

    let filteredExpenses = expenses.filter(e => e.userId === req.userId);

    // Apply filters
    if (category) {
      filteredExpenses = filteredExpenses.filter(e => e.category === category);
    }
    if (startDate) {
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= new Date(startDate as string));
    }
    if (endDate) {
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= new Date(endDate as string));
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedExpenses = filteredExpenses.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      data: paginatedExpenses,
      meta: {
        total: filteredExpenses.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(filteredExpenses.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get expense by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = expenses.find(e => e.id === req.params.id && e.userId === req.userId);
    
    if (!expense) {
      throw createError(404, 'Expense not found');
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
});

// Create expense
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, category, subcategory, description, date, paymentMethod, tags, familyMemberId, eventId } = req.body;

    if (!amount || !category || !description) {
      throw createError(400, 'Please provide amount, category, and description');
    }

    const expense = {
      id: `exp_${Date.now()}`,
      userId: req.userId,
      amount: parseFloat(amount),
      currency: 'USD',
      category,
      subcategory: subcategory || null,
      description,
      date: date || new Date().toISOString(),
      paymentMethod: paymentMethod || null,
      tags: tags || [],
      familyMemberId: familyMemberId || null,
      eventId: eventId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expenses.push(expense);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
});

// Update expense
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expenseIndex = expenses.findIndex(e => e.id === req.params.id && e.userId === req.userId);
    
    if (expenseIndex === -1) {
      throw createError(404, 'Expense not found');
    }

    const updates = req.body;
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      ...updates,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: expenses[expenseIndex],
    });
  } catch (error) {
    next(error);
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expenseIndex = expenses.findIndex(e => e.id === req.params.id && e.userId === req.userId);
    
    if (expenseIndex === -1) {
      throw createError(404, 'Expense not found');
    }

    expenses.splice(expenseIndex, 1);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get expense statistics
router.get('/stats/summary', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userExpenses = expenses.filter(e => e.userId === req.userId);
    
    const total = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryBreakdown = userExpenses.reduce((acc: any, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total,
        count: userExpenses.length,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
