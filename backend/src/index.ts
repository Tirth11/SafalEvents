import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import expenseRoutes from './routes/expense.routes';
import purchaseRoutes from './routes/purchase.routes';
import receiptRoutes from './routes/receipt.routes';
import warrantyRoutes from './routes/warranty.routes';
import eventRoutes from './routes/event.routes';
import reportRoutes from './routes/report.routes';
import creditRoutes from './routes/credit.routes';
import familyRoutes from './routes/family.routes';
import chatRoutes from './routes/chat.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Safal-AI Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless
export default app;
