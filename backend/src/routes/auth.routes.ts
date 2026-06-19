import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock user database (replace with Prisma in production)
const users: any[] = [];

// Generate JWT Token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  // expiresIn in seconds: 7 days = 604800 seconds
  return jwt.sign({ userId }, secret, { expiresIn: 604800 });
};

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createError(400, 'Please provide all required fields');
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw createError(400, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      currency: 'USD',
      language: 'en',
      subscription: {
        plan: 'free',
        creditsBalance: 20,
        creditsUsed: 0,
      },
      createdAt: new Date(),
    };

    users.push(user);

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'Please provide email and password');
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      throw createError(401, 'Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      throw createError(404, 'User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.userId);
    
    if (userIndex === -1) {
      throw createError(404, 'User not found');
    }

    const { name, phone, currency, language } = req.body;

    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(phone && { phone }),
      ...(currency && { currency }),
      ...(language && { language }),
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userIndex = users.findIndex(u => u.id === req.userId);
    
    if (userIndex === -1) {
      throw createError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isMatch) {
      throw createError(401, 'Current password is incorrect');
    }

    // Hash new password
    users[userIndex].password = await bcrypt.hash(newPassword, 12);

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
