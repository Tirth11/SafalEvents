import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const router = Router();

// Mock chat history
const chatHistories: Map<string, any[]> = new Map();

// AI Intent detection (simplified - replace with actual AI integration)
const detectIntent = (message: string): { intent: string; entities: any } => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expense') || lowerMessage.includes('spent') || lowerMessage.includes('paid')) {
    const amountMatch = message.match(/₹?\$?(\d+[\d,]*)/);
    return {
      intent: 'add_expense',
      entities: {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
        description: message,
      },
    };
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('spending') || lowerMessage.includes('summary')) {
    return { intent: 'generate_report', entities: {} };
  }
  
  if (lowerMessage.includes('warranty')) {
    return { intent: 'check_warranty', entities: {} };
  }
  
  if (lowerMessage.includes('budget')) {
    return { intent: 'check_budget', entities: {} };
  }
  
  if (lowerMessage.includes('receipt') || lowerMessage.includes('upload')) {
    return { intent: 'upload_receipt', entities: {} };
  }
  
  return { intent: 'general_query', entities: { message } };
};

// Process AI message
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, attachments } = req.body;

    if (!message && (!attachments || attachments.length === 0)) {
      throw createError(400, 'Please provide a message or attachments');
    }

    // Get or create chat history for user
    if (!chatHistories.has(req.userId!)) {
      chatHistories.set(req.userId!, []);
    }
    const history = chatHistories.get(req.userId!)!;

    // Add user message to history
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      attachments: attachments || [],
      timestamp: new Date(),
    };
    history.push(userMessage);

    // Detect intent
    const { intent, entities } = detectIntent(message);

    // Generate AI response based on intent
    let aiResponse = '';
    let action: any = null;

    switch (intent) {
      case 'add_expense':
        aiResponse = `I've identified this as an expense. Here's what I understood:\n\n• Amount: $${entities.amount || 'Not detected'}\n• Description: ${entities.description}\n\nWould you like me to add this expense?`;
        action = {
          type: 'add_expense',
          status: 'requires_confirmation',
          creditsUsed: 2,
          data: entities,
        };
        break;
      
      case 'generate_report':
        aiResponse = `Here's your spending summary for this month:\n\n💰 Total Expenses: $2,450.00\n📊 Top Category: Food & Dining ($850.00)\n📈 vs Last Month: +12.5%\n\nWould you like a detailed breakdown?`;
        action = {
          type: 'generate_report',
          status: 'completed',
          creditsUsed: 1,
        };
        break;
      
      case 'check_warranty':
        aiResponse = `I found 3 active warranties:\n\n1. iPhone 15 Pro - Expires in 8 months\n2. Samsung TV - Expires in 11 months\n3. MacBook Pro - Expires in 6 months\n\nWould you like reminders set up for any of these?`;
        action = {
          type: 'check_warranty',
          status: 'completed',
          creditsUsed: 1,
        };
        break;
      
      case 'check_budget':
        aiResponse = `Here's your budget status:\n\n🎯 Monthly Budget: $5,000\n✅ Spent: $2,450 (49%)\n💰 Remaining: $2,550\n\nYou're on track! Keep it up! 💪`;
        action = {
          type: 'check_budget',
          status: 'completed',
          creditsUsed: 1,
        };
        break;
      
      default:
        aiResponse = `I'm here to help you manage your finances! I can assist with:\n\n• Adding expenses (e.g., "Add $50 for groceries")\n• Checking reports (e.g., "Show my spending")\n• Tracking warranties\n• Budget status\n\nWhat would you like to do?`;
        action = {
          type: 'general_query',
          status: 'completed',
          creditsUsed: 1,
        };
    }

    // Add AI response to history
    const assistantMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      action,
      timestamp: new Date(),
    };
    history.push(assistantMessage);

    res.json({
      success: true,
      data: {
        message: assistantMessage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get chat history
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = chatHistories.get(req.userId!) || [];
    
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

// Clear chat history
router.delete('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    chatHistories.delete(req.userId!);
    
    res.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
