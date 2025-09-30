# Data Replacement Mapping - CORIA Mobile App

**Generated**: 2025-09-30
**Scope**: Mobile app (Flutter) → Backend API → Supabase
**Security**: All secrets referenced, never printed

---

## Mapping Strategy

### Data Flow Architecture:
```
Flutter Mobile App
      ↓ (HTTP/HTTPS)
Backend NestJS API (Port 3000)
      ↓ (Supabase Client SDK)
Supabase PostgreSQL + RLS
      ↓ (JSON RPC)
Solana Mainnet-Beta
```

**Rule**: Mobile app NEVER directly accesses Supabase service role or Solana private keys.
**Implementation**: All sensitive operations go through backend API with JWT authentication.

---

## 1. Wallet Service Data Replacement

### Current Mock Implementation
**File**: `lib/features/wallet/data/services/solana_wallet_service.dart`

**Mock Functions**:
```dart
// Line 183-186
String _generateMockAddress() {
  final chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return List.generate(32, (_) => chars[Random().nextInt(chars.length)]).join();
}

// Line 189-191
double _generateMockBalance() {
  return Random().nextDouble() * 10;
}

// Line 194-196
String _generateMockSignature() {
  final chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return List.generate(88, (_) => chars[Random().nextInt(chars.length)]).join();
}
```

### Real Data Mapping

#### A. Connect Wallet (External - Phantom/Solflare)
**Mock**: Line 31, returns fake address
**Real Implementation**:
```dart
// Call backend API
POST http://localhost:3000/api/v1/wallets/connect
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
Body: {
  "publicKey": "<user_wallet_public_key>",  // From wallet app callback
  "provider": "phantom",  // or "solflare", "trust_wallet"
  "signature": "<signed_message>",  // Wallet signature proof
  "type": "external"
}

Response: {
  "id": "uuid",
  "user_id": "uuid",
  "public_key": "real_solana_address",
  "type": "external",
  "provider": "phantom",
  "is_primary": true,
  "balance_lamports": 1500000000,  // 1.5 SOL
  "last_balance_update": "2025-09-30T...",
  "created_at": "2025-09-30T..."
}
```

**Supabase Table**: `solana_wallets`
**Backend Service**: `WalletsController.connectWallet()`

#### B. Get Balance
**Mock**: Line 33, returns random 0.1-10 SOL
**Real Implementation**:
```dart
// Call backend API
GET http://localhost:3000/api/v1/wallets/balance?walletId=<uuid>
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}

Response: {
  "balance_sol": 1.5,
  "balance_lamports": 1500000000,
  "last_updated": "2025-09-30T...",
  "source": "solana_rpc"  // Real-time from Solana network
}
```

**Data Source**:
1. Backend calls Solana RPC: `connection.getBalance(publicKey)`
2. Converts lamports to SOL: `lamports / 1_000_000_000`
3. Updates `solana_wallets.balance_lamports` cache
4. Returns to mobile app

#### C. Send Transaction
**Mock**: Line 81, generates fake signature
**Real Implementation**:
```dart
// Call backend API
POST http://localhost:3000/api/v1/wallets/send
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
Body: {
  "from_wallet_id": "uuid",
  "to_address": "recipient_solana_address",
  "amount_sol": 0.1,
  "memo": "CORIA payment",
  "priority_fee_sol": 0.000005
}

Response: {
  "transaction_id": "uuid",
  "signature": "real_solana_tx_signature",  // From blockchain
  "status": "pending",  // Will become "confirmed" or "failed"
  "from_address": "sender_address",
  "to_address": "recipient_address",
  "amount_sol": 0.1,
  "fee_sol": 0.000005,
  "timestamp": "2025-09-30T..."
}
```

**Data Flow**:
1. Backend creates transaction
2. Backend signs with KMS or wallet private key
3. Backend submits to Solana network
4. Transaction signature returned
5. Background job polls for confirmation
6. Updates `wallet_activities` and `solana_ledger`

---

## 2. Premium Activation Data Replacement

### Current Implementation
**File**: `lib/features/premium/data/services/premium_payment_service.dart`

**Mock**: Premium activation without real SOL payment

### Real Data Mapping

#### A. Generate Activation Nonce
```dart
POST http://localhost:3000/api/v1/premium/nonce
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
Body: {
  "plan_id": "premium_monthly"  // or "premium_annual"
}

Response: {
  "nonce": "unique_32_char_nonce",
  "expires_at": "2025-09-30T23:59:59Z",  // 15 minutes validity
  "amount_sol": 0.025,
  "destination_address": "GKRh2ccdwF4wMSndVfZgrcodQHSN9GxU2iLCiNTHjDxF"
}
```

**Supabase Table**: `premium_nonces` (or similar tracking table)

#### B. User Sends SOL Payment
```dart
// User triggers wallet (Phantom/Solflare) outside app
// Sends 0.025 SOL to PREMIUM_POOL_PUBKEY
// Includes nonce in transaction memo
```

#### C. Backend Verifies & Activates
```dart
POST http://localhost:3000/api/v1/premium/activate
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
Body: {
  "transaction_signature": "real_solana_tx_signature",
  "nonce": "nonce_from_step_a"
}

Response: {
  "subscription_id": "bigint",
  "status": "active",
  "product_id": "premium_monthly",
  "started_at": "2025-09-30T...",
  "expires_at": "2025-10-30T...",
  "features": ["feature1", "feature2", ...]
}
```

**Backend Verification**:
1. Fetch transaction from Solana: `connection.getTransaction(signature)`
2. Verify:
   - Destination matches `PREMIUM_POOL_PUBKEY`
   - Amount >= `PREMIUM_PRICE_SOL`
   - Memo contains valid nonce
   - Transaction confirmed on-chain
3. Insert into `premium_subscriptions`
4. Grant premium features

---

## 3. Environment Configuration Data Replacement

### Current Placeholders
**File**: `lib/core/config/env.dart`

```dart
// Line 39-40: Placeholder Supabase
supabaseUrl => 'https://placeholder.supabase.co'
supabaseAnonKey => 'placeholder_key'

// Line 90-91: Weak dev secrets
jwtSecret => 'dev_jwt_secret_key'
encryptionKey => 'dev_encryption_key'

// Line 94-95: Placeholder backend
apiBaseUrl => 'https://api.coria.app/v1'
websocketUrl => 'wss://ws.coria.app'
```

### Real Data Sources

**Mobile .env file** (create at project root):
```bash
# Supabase (Safe - Anon key is public)
SUPABASE_URL=https://bwvkhwppllcfzozajtbh.supabase.co
SUPABASE_ANON_KEY=<REFERENCE: backend/.env line 14>

# Backend API
API_BASE_URL=http://localhost:3000/api/v1  # Development
# API_BASE_URL=https://api.coria.app/api/v1  # Production

# App Security (Not used in client, but for reference)
# JWT_SECRET and ENCRYPTION_KEY stay in backend only
# Mobile app receives JWT tokens from backend auth endpoints

# Websocket (Future feature)
WEBSOCKET_URL=ws://localhost:3000/ws
```

**Update env.dart**:
```dart
// Remove placeholder defaults
String get supabaseUrl => getRequired('SUPABASE_URL');
String get supabaseAnonKey => getRequired('SUPABASE_ANON_KEY');
String get apiBaseUrl => getRequired('API_BASE_URL');
```

---

## 4. Backend API Endpoints (Already Production-Ready)

### Wallet Endpoints
```
✅ GET    /api/v1/wallets/me               - Get user wallets
✅ GET    /api/v1/wallets/balance          - Get balance
✅ POST   /api/v1/wallets/send             - Send SOL
✅ POST   /api/v1/wallets/custodial        - Create custodial wallet
✅ POST   /api/v1/wallets/connect          - Connect external wallet
✅ POST   /api/v1/wallets/:id/refresh      - Refresh balance
```

### Payment Endpoints
```
✅ POST   /api/v1/payments                 - Create payment intent
✅ POST   /api/v1/payments/:id/confirm     - Confirm payment
✅ GET    /api/v1/payments/config          - Get payment config
```

### Premium Endpoints
```
✅ POST   /api/v1/premium/nonce            - Generate activation nonce
✅ POST   /api/v1/premium/activate         - Activate premium
✅ GET    /api/v1/premium/subscription     - Get subscription status
✅ POST   /api/v1/premium/check-access/:feature  - Check feature access
```

**Backend Configuration**: `backend/.env` (see reference document)
- Solana Network: `mainnet-beta` ✅
- RPC Endpoint: `https://api.mainnet-beta.solana.com` ✅
- Pool Addresses: Configured ✅
- Supabase: Connected ✅

---

## 5. Supabase Tables (Real Data Schema)

### A. solana_wallets
```sql
id                   uuid PRIMARY KEY
user_id              uuid NOT NULL REFERENCES auth.users(id)
public_key           varchar NOT NULL UNIQUE
type                 wallet_type (custodial|external)
provider             varchar
is_primary           boolean DEFAULT false
name                 varchar
balance_lamports     bigint DEFAULT 0
last_balance_update  timestamptz
kms_key_id           varchar  -- AWS KMS reference for custodial
derivation_path      varchar  -- BIP44 path for custodial
is_active            boolean DEFAULT true
metadata             jsonb
created_at           timestamptz DEFAULT now()
updated_at           timestamptz DEFAULT now()
```

### B. premium_subscriptions
```sql
id                       bigint PRIMARY KEY
user_id                  uuid REFERENCES auth.users(id)
plan_id                  text
revenue_cat_customer_id  text  -- For future RevenueCat integration
product_id               text NOT NULL
purchase_token           text
status                   text NOT NULL  -- active, expired, cancelled
started_at               timestamptz
expires_at               timestamptz
cancelled_at             timestamptz
auto_renewing            boolean DEFAULT false
purchase_country         text
original_transaction_id  text  -- Solana transaction signature
created_at               timestamptz DEFAULT now()
updated_at               timestamptz DEFAULT now()
```

### C. solana_payments
```sql
id                  uuid PRIMARY KEY
user_id             uuid REFERENCES auth.users(id)
wallet_id           uuid REFERENCES solana_wallets(id)
type                payment_type (premium|donation|refund)
status              payment_status (pending|confirmed|failed)
tx_signature        varchar UNIQUE  -- Solana transaction signature
amount_lamports     bigint NOT NULL
recipient_address   varchar NOT NULL
source_address      varchar NOT NULL
memo                text
confirmations       integer DEFAULT 0
block_time          timestamptz
created_at          timestamptz DEFAULT now()
verified_at         timestamptz
```

---

## 6. Mobile App Integration Pattern

### A. Authentication Flow
```dart
// 1. User signs up/logs in
POST /api/v1/auth/register or /api/v1/auth/login
Body: { "email": "user@example.com", "password": "secure_password" }
Response: { "access_token": "jwt_token", "user": {...} }

// 2. Store JWT token securely
// Use flutter_secure_storage
await secureStorage.write(key: 'jwt_token', value: jwtToken);

// 3. Add JWT to all API requests
dio.options.headers['Authorization'] = 'Bearer $jwtToken';
```

### B. Wallet Screen Flow (Settings → My Wallet)
```dart
// Step 1: Check if user has wallets
GET /api/v1/wallets/me
Response: { "wallets": [wallet1, wallet2, ...] }

// Step 2: If no wallets, show options:
// - "Create Custodial Wallet" → POST /api/v1/wallets/custodial
// - "Connect External Wallet" → POST /api/v1/wallets/connect

// Step 3: Display wallet balance
GET /api/v1/wallets/balance?walletId=<uuid>
Response: { "balance_sol": 1.5, "balance_lamports": 1500000000 }

// Step 4: Send SOL
POST /api/v1/wallets/send
Body: { "from_wallet_id": "uuid", "to_address": "...", "amount_sol": 0.1 }
Response: { "signature": "...", "status": "pending" }
```

### C. Premium Activation Flow
```dart
// Step 1: Generate nonce
POST /api/v1/premium/nonce
Body: { "plan_id": "premium_monthly" }
Response: { "nonce": "abc123", "amount_sol": 0.025, "destination_address": "..." }

// Step 2: User sends payment via Phantom/Solflare
// (Outside app, user's wallet handles this)

// Step 3: Verify and activate
POST /api/v1/premium/activate
Body: { "transaction_signature": "...", "nonce": "abc123" }
Response: { "subscription_id": 123, "status": "active", "expires_at": "..." }
```

---

## 7. Security Considerations

### Mobile App (Client-Side)
- ✅ Only use `SUPABASE_ANON_KEY` (safe for client)
- ✅ All sensitive operations via backend API with JWT
- ✅ Never embed private keys or service role keys
- ✅ Use `flutter_secure_storage` for JWT tokens
- ✅ Validate all user inputs before API calls

### Backend (Server-Side)
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` (has full access)
- ✅ JWT authentication on all protected endpoints
- ✅ Rate limiting (100 requests/minute)
- ✅ AWS KMS for custodial wallet encryption (production)
- ✅ Transaction signing with secured private keys
- ✅ RLS policies enforce user isolation in Supabase

---

## 8. Environment Variables Summary

### Mobile App (.env)
```bash
SUPABASE_URL=<REFERENCE: backend/.env line 13>
SUPABASE_ANON_KEY=<REFERENCE: backend/.env line 14>
API_BASE_URL=http://localhost:3000/api/v1
WEBSOCKET_URL=ws://localhost:3000/ws
ENVIRONMENT=development
```

### Backend (.env) - Already Configured ✅
```bash
# See: /Users/burakcemyaman/PROJECTS/CORIA-APP/coria_app/backend/.env
SUPABASE_URL=https://bwvkhwppllcfzozajtbh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<REFERENCE: Line 15>
SOLANA_NETWORK=mainnet-beta
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
PREMIUM_POOL_PUBKEY=GKRh2ccdwF4wMSndVfZgrcodQHSN9GxU2iLCiNTHjDxF
DONATION_POOL_PUBKEY=7oV4PGX3nvkfCaeJqZgqTW2HkY36xg3JefNWqRQ7XWHZ
```

---

## 9. Action Items (Implementation Order)

1. **Create Mobile .env** ✓ (Next step)
2. **Update env.dart** - Remove placeholders, require real values
3. **Create BackendApiService** - HTTP client for backend endpoints
4. **Update SolanaWalletService** - Replace mock functions with API calls
5. **Update Wallet Screens** - Integrate with real backend flow
6. **Update Premium Screens** - Implement SOL payment + activation flow
7. **Testing** - E2E tests with real backend + Supabase
8. **Documentation** - Update user guide with real wallet setup

---

**Mapping Complete**: ✅
**Security**: All secrets referenced, never exposed
**Backend**: Production-ready (mainnet-beta)
**Next**: Implement replacement in mobile app code

**Important**: Never commit real API keys or private keys to git. Use .env files and add them to .gitignore.