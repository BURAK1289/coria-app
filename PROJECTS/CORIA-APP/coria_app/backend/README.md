# CORIA Backend - NestJS Solana Wallet & Premium System

🌱 **CORIA** - Vegan Lifestyle App Backend API built with NestJS, Supabase, and Solana Web3.js

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main.ts                     # Application entry point
│   ├── app.module.ts               # Root module
│   ├── common/                     # Global services and utilities
│   │   ├── common.module.ts
│   │   ├── services/
│   │   │   ├── supabase.service.ts # Supabase client with RLS
│   │   │   ├── solana.service.ts   # Solana Web3.js integration
│   │   │   ├── signing.service.ts  # KMS signing (stub)
│   │   │   └── logger.service.ts   # Structured logging
│   │   └── types/                  # TypeScript types
│   │       └── index.ts
│   ├── auth/                       # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # Login, register, verify
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── supabase.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── supabase-auth.guard.ts
│   ├── wallets/                    # Wallet management
│   │   ├── wallets.module.ts
│   │   ├── wallets.controller.ts   # Custodial & external wallets
│   │   ├── wallets.service.ts
│   │   └── dto/
│   │       └── wallets.dto.ts
│   ├── payments/                   # Payment processing
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts  # SOL payments & confirmations
│   │   ├── payments.service.ts
│   │   └── dto/
│   │       └── payments.dto.ts
│   ├── premium/                    # Premium subscriptions
│   │   ├── premium.module.ts
│   │   ├── premium.controller.ts   # Premium status & benefits
│   │   ├── premium.service.ts
│   │   └── dto/
│   │       └── premium.dto.ts
│   ├── webhooks/                   # Webhook handlers
│   │   ├── webhooks.module.ts
│   │   ├── webhooks.controller.ts  # Solana transaction webhooks
│   │   ├── webhooks.service.ts
│   │   └── dto/
│   │       └── webhooks.dto.ts
│   └── jobs/                       # Background jobs
│       ├── jobs.module.ts
│       ├── jobs.service.ts         # Bull queue jobs
│       └── processors/
│           ├── payment.processor.ts
│           └── cleanup.processor.ts
├── package.json                    # Dependencies
├── nest-cli.json                   # NestJS CLI config
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment variables
└── README.md                       # This file
```

## 🚀 Quick Start

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Configure your environment variables
```

### 3. Required Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Solana Configuration
SOLANA_NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com

# Premium & Pool Configuration
PREMIUM_PRICE_SOL=1.0
DONATION_POOL_PUBKEY=11111111111111111111111111111111
PREMIUM_POOL_PUBKEY=11111111111111111111111111111111

# KMS Configuration (for production)
KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678...
KMS_ENABLED=false

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
```

### 4. Run Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Once running, access Swagger documentation at:
- **Development**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🔧 Core Features

### 🔐 Authentication (`/auth`)
- **Email/Password Auth**: Supabase Auth integration
- **JWT Tokens**: Internal token management
- **Password Reset**: Email-based password recovery
- **Profile Management**: User profile with premium status

### 💳 Wallet Management (`/wallets`)
- **Custodial Wallets**: KMS-secured server-side wallets
- **External Wallets**: Phantom, Backpack wallet connections
- **Balance Tracking**: Real-time Solana balance updates
- **Primary Wallet**: User-selected default wallet

### 💰 Payment Processing (`/payments`)
- **Idempotent Payments**: Duplicate-safe payment creation
- **Transaction Confirmation**: Solana signature verification
- **Payment History**: User payment analytics
- **Multi-destination**: Donation and premium pools

### 👑 Premium System (`/premium`)
- **SOL-based Subscriptions**: 1 SOL = 1 month premium
- **Automatic Activation**: Payment confirmation triggers premium
- **Benefits Tracking**: Feature usage monitoring
- **Expiration Management**: Automatic status updates

### 🔗 Webhooks (`/webhooks`)
- **Transaction Updates**: Solana network notifications
- **Payment Confirmations**: Real-time status updates
- **Security Validation**: Signed webhook verification

### ⚙️ Background Jobs (`/jobs`)
- **Payment Monitoring**: Transaction status polling
- **Data Cleanup**: Expired data maintenance
- **Balance Updates**: Periodic wallet syncing

## 🛡️ Security Features

### Row Level Security (RLS)
- **User Isolation**: Users can only access their own data
- **Service Role Access**: Backend administrative operations
- **Audit Logging**: All sensitive operations tracked

### Solana Integration
- **Address Validation**: Public key format verification
- **Signature Validation**: Transaction signature checking
- **Network Support**: Devnet, testnet, mainnet-beta

### KMS Integration (Production)
- **Private Key Security**: AWS KMS key management
- **Development Stub**: Local signing for development
- **Hierarchical Derivation**: BIP44 path generation

## 🔄 Database Integration

### Supabase RPC Functions Used
- `initiate_payment_idempotent()` - Safe payment creation
- `confirm_payment()` - Transaction confirmation
- `get_payment_status()` - Payment details
- `get_user_payment_stats()` - Analytics

### Database Tables
- `solana_wallets` - Wallet management
- `solana_payments` - Payment records
- `solana_ledger` - Transaction audit trail
- `payment_idempotency_keys` - Duplicate prevention
- `wallet_activities` - User activity log
- `premium_benefits_usage` - Feature tracking

## 🧪 Development Commands

```bash
# Code quality
npm run lint              # ESLint checking
npm run format            # Prettier formatting
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests

# Database
npm run migration:generate  # Create new migration
npm run migration:up       # Apply migrations
npm run migration:reset    # Reset database
```

## 📊 Monitoring & Logging

### Structured Logging
- **Payment Events**: Transaction lifecycle tracking
- **Wallet Events**: Wallet operations monitoring
- **Security Events**: Authentication and authorization
- **Performance Metrics**: API response times

### Error Handling
- **Global Exception Filter**: Consistent error responses
- **Validation Pipes**: Request data validation
- **Rate Limiting**: DoS protection
- **Security Headers**: Helmet integration

## 🚀 Deployment

### Environment-specific Configuration
```bash
# Development
NODE_ENV=development
SOLANA_NETWORK=devnet
KMS_ENABLED=false

# Production
NODE_ENV=production
SOLANA_NETWORK=mainnet-beta
KMS_ENABLED=true
```

### Health Checks
- **Database Connection**: Supabase connectivity
- **Solana Network**: RPC endpoint status
- **KMS Service**: Signing service availability
- **Redis Queue**: Background job processing

## 🤝 Integration Points

### Frontend (Flutter App)
- **Authentication**: JWT token-based auth
- **Wallet Connection**: QR code or deep links
- **Payment Flow**: Idempotent payment processing
- **Real-time Updates**: WebSocket notifications

### External Services
- **Supabase**: Database and authentication
- **Solana RPC**: Blockchain interactions
- **AWS KMS**: Production key management
- **Redis**: Job queue and caching

## 📝 API Examples

### Create Custodial Wallet
```bash
POST /api/v1/wallets/custodial
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My Savings Wallet",
  "isPrimary": true
}
```

### Process Payment
```bash
POST /api/v1/payments/initiate
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "walletId": "uuid",
  "kind": "premium",
  "amountSol": 1.0,
  "idempotencyKey": "unique-key-123"
}
```

### Confirm Payment
```bash
POST /api/v1/payments/:paymentId/confirm
Authorization: Bearer <service-role-token>
Content-Type: application/json

{
  "txSignature": "signature-from-solana",
  "blockhash": "blockhash",
  "slot": 123456
}
```

## 🔮 Future Enhancements

- **Multi-token Support**: SPL token integration
- **NFT Marketplace**: Vegan NFT trading
- **DeFi Integration**: Yield farming features
- **Mobile Wallet**: In-app wallet SDK
- **Analytics Dashboard**: Business intelligence

---

**Built with 💚 for a sustainable future**