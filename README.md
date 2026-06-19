# Safal-AI

**Your AI Assistant for Expenses, Purchases, Receipts, Warranties, Events, and Financial Insights.**

## Overview

Safal-AI is an AI-first conversational financial management platform built for existing SafalMyBuy users. Instead of manually entering expenses, purchases, bills, warranties, or reports, users can talk, type, upload, or share information with Safal-AI, and the AI will automatically understand the request and update records.

## Features

### Core Features (MVP)
- 🤖 **AI Chat Interface** - Natural language expense tracking
- 💰 **Expense Management** - Add, edit, search expenses with AI
- 🛒 **Purchase Tracking** - Track purchased items and warranties
- 📄 **Receipt Scanning** - OCR-powered receipt data extraction
- ⏰ **Warranty Tracking** - Automated warranty expiry reminders
- 📊 **AI Reports** - Natural language financial reports
- 👨‍👩‍👧‍👦 **Family Management** - Shared expense tracking
- 🎉 **Event Expenses** - Budget creation and cost splitting
- 💳 **Credit System** - Pay-per-use AI credits

### Phase 2 Features
- 🎤 Voice commands
- 📱 WhatsApp integration
- 🌐 Multilingual support
- 🧠 AI memory and personalization

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Recharts** - Charts and analytics
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication
- **Multer** - File uploads

### Deployment
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting (recommended)
- **PostgreSQL** - Database

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Tirth11/SafalAI.git
cd SafalAI
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push

npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### Backend (.env)
```
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/safal_ai"
JWT_SECRET=your-jwt-secret
```

## Project Structure

```
SafalAI/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── chat/        # AI chat interface
│   │   │   ├── expenses/    # Expense management
│   │   │   ├── purchases/   # Purchase tracking
│   │   │   ├── receipts/    # Receipt scanning
│   │   │   ├── warranties/  # Warranty tracking
│   │   │   ├── family/      # Family management
│   │   │   ├── events/      # Event expenses
│   │   │   ├── reports/     # AI reports
│   │   │   ├── credits/     # Subscription
│   │   │   ├── settings/    # User settings
│   │   │   └── admin/       # Admin dashboard
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and API
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── index.ts         # Server entry
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Chat
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Receipts
- `POST /api/receipts/upload` - Upload receipt
- `POST /api/receipts/:id/process` - Process with OCR

### More endpoints in the API documentation...

## Credit System

AI actions consume credits:

| Action | Credits |
|--------|---------|
| Basic chat query | 1 |
| Add expense by text | 2 |
| Receipt scan | 5 |
| Invoice extraction | 8 |
| Report generation | 10 |
| Voice command | 3 |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software for SafalMyBuy.

## Contact

For questions or support, contact the development team.

---

**Safal-AI makes financial management as simple as sending a message.**
