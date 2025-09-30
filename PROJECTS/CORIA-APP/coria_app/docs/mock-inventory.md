# Mock Data Inventory - CORIA Mobile App

**Generated**: 2025-09-30
**Scope**: Mobile app only (Flutter)
**Status**: Complete scan of wallet, premium, and core services

---

## 1. Mobile App Mock Data (lib/)

### A. Wallet Feature Mock Data

**File**: `lib/features/wallet/data/services/solana_wallet_service.dart`

**Mock Functions Detected**:
```dart
Line 31:  address: _generateMockAddress()
Line 33:  balance: _generateMockBalance()
Line 81:  final signature = _generateMockSignature()
Line 183: String _generateMockAddress()
Line 189: double _generateMockBalance()
Line 194: String _generateMockSignature()
```

**Mock Data Pattern**:
- **Mock Address**: Random 32-character base58 string
- **Mock Balance**: Random 0.1-10 SOL
- **Mock Signature**: Random 88-character base58 transaction signature
- **Mock Connection**: 2-second delay simulation
- **Mock Transaction History**: Empty or fake transactions

**Real Data Source**:
- **Table**: `solana_wallets` (Supabase)
- **Schema**:
  ```sql
  id                   uuid PRIMARY KEY
  user_id              uuid NOT NULL
  public_key           varchar NOT NULL
  type                 wallet_type (custodial|external)
  provider             varchar (phantom|solflare|trust_wallet|etc)
  is_primary           boolean
  name                 varchar
  balance_lamports     bigint
  last_balance_update  timestamptz
  kms_key_id           varchar (AWS KMS reference)
  derivation_path      varchar (for custodial wallets)
  is_active            boolean
  metadata             jsonb
  created_at           timestamptz
  updated_at           timestamptz
  ```

**Integration Pattern**: Mobile app should fetch from Supabase via backend RPC functions, never directly access tables.

---

### B. Premium Feature Mock Data

**Files Scanned**:
- `lib/features/premium/data/services/premium_payment_service.dart`
- `lib/features/premium/data/models/*.dart`

**Mock Pattern**: No explicit mock functions detected, but placeholder data exists in:
- Test files
- Generated .g.dart files (JSON serialization)

**Real Data Source**:
- **Table**: `premium_subscriptions`
- **Schema**:
  ```sql
  id                       bigint PRIMARY KEY
  user_id                  uuid
  plan_id                  text
  revenue_cat_customer_id  text
  product_id               text NOT NULL
  purchase_token           text
  status                   text NOT NULL
  started_at               timestamptz
  expires_at               timestamptz
  cancelled_at             timestamptz
  auto_renewing            boolean
  purchase_country         text
  original_transaction_id  text
  created_at               timestamptz
  updated_at               timestamptz
  ```

**Real Data Source**: `premium_plans` table
```sql
id          bigint PRIMARY KEY
name        text NOT NULL
price_sol   numeric NOT NULL
duration    text NOT NULL
features    jsonb
metadata    jsonb
created_at  timestamptz
```

---

### C. Environment Configuration Mock Data

**File**: `lib/core/config/env.dart`

**Placeholder Values Detected**:
```dart
Line 39: supabaseUrl => 'https://placeholder.supabase.co'
Line 40: supabaseAnonKey => 'placeholder_key'
Line 90: jwtSecret => 'dev_jwt_secret_key'
Line 91: encryptionKey => 'dev_encryption_key'
Line 94: apiBaseUrl => 'https://api.coria.app/v1'
Line 95: websocketUrl => 'wss://ws.coria.app'
```

**Required Real Values** (from .env or .env.local):
```bash
# Supabase (Real values already configured)
SUPABASE_URL=https://bwvkhwppllcfzozajtbh.supabase.co
SUPABASE_ANON_KEY=<anon_key>

# Backend API (should point to backend service)
API_BASE_URL=http://localhost:3000/api/v1  # Dev
# API_BASE_URL=https://api.coria.app/v1    # Prod

# Security (Generate new for production)
JWT_SECRET=<secure_64_char_secret>
ENCRYPTION_KEY=<secure_32_char_key>

# Websocket (Future feature)
WEBSOCKET_URL=ws://localhost:3000/ws  # Dev
```

---

### D. Backend Integration Mock Data

**Pattern**: Mobile app should NEVER use mock data for:
- Wallet creation (use backend `/api/v1/wallets/custodial` or `/api/v1/wallets/connect`)
- Balance fetching (use backend `/api/v1/wallets/balance`)
- Payment processing (use backend `/api/v1/payments` flow)
- Premium activation (use backend `/api/v1/premium/activate`)

**Current Issue**: `solana_wallet_service.dart` generates mock addresses/balances instead of calling backend.

---

## 2. Test Data (test/ and integration_test/)

### Test Files with Mock Data:

**Unit Tests**:
- `test/features/wallet/wallet_test_suite.dart` - Wallet unit tests
- `test/features/recipes/**/*_test.dart` - Recipe module tests (106 files)

**Integration Tests**:
- `integration_test/wallet/wallet_screen_e2e_test.dart` - Wallet E2E tests
- `integration_test/wallet/wallet_test_helpers.dart` - Mock helpers
- `integration_test/test_config.dart` - Test configuration

**Action**: Test data should remain in test files, not be moved to production code.

---

## 3. Backend Mock Data (backend/)

### Files with devnet/testnet references:
```
backend/src/common/services/solana.service.ts - Contains network switching logic
backend/src/common/types/index.ts - Network type definitions
backend/src/health/health.service.ts - Health check endpoints
backend/src/main.ts - Main bootstrap with network logging
```

**Current Configuration**:
- Backend is configured for **mainnet-beta** (production)
- RPC: `https://api.mainnet-beta.solana.com`
- No mock data in backend services (production-ready)

---

## 4. Generated Files (Safe - No Action Needed)

These files contain "TEST" keywords but are auto-generated:
- `lib/l10n/generated/*.dart` - Localization files
- `lib/**/*.g.dart` - JSON serialization (build_runner)
- `lib/gen/assets.gen.dart` - Asset code generation

**Action**: No changes needed, these are code generation artifacts.

---

## 5. Mock Data Summary

### Critical Mobile App Changes Needed:

| Component | Current State | Required Change |
|-----------|---------------|-----------------|
| **Wallet Service** | Generates mock addresses/balances | Call backend API `/api/v1/wallets/*` |
| **Balance Fetching** | Mock random SOL amounts | Backend RPC with real Solana network |
| **Transaction Sending** | Mock signature generation | Backend transaction flow with real signing |
| **Premium Activation** | Placeholder logic | Backend `/api/v1/premium/activate` with real SOL payment |
| **Environment Config** | Placeholder URLs/keys | Real Supabase + backend URLs from .env |

### Safe Mock Data (Keep as-is):
- Test files (test/, integration_test/)
- Generated files (*.g.dart)
- Localization strings
- Asset references

---

## 6. Next Steps (Data Replacement Plan)

1. **Update solana_wallet_service.dart**:
   - Replace `_generateMockAddress()` with backend API call
   - Replace `_generateMockBalance()` with backend balance fetch
   - Replace `_generateMockSignature()` with real transaction signing

2. **Update env.dart**:
   - Remove placeholder defaults
   - Require real values from .env
   - Throw errors on missing required keys

3. **Add Backend Integration**:
   - Create `lib/core/services/backend_api_service.dart`
   - Implement wallet, payment, premium API calls
   - Handle authentication with JWT tokens

4. **Update Wallet Screens**:
   - Settings → My Wallet screen flows
   - Connect external wallet (Phantom, Solflare)
   - Create custodial wallet
   - View balance and transactions

5. **Testing**:
   - E2E test with real backend + Supabase
   - Integration test for wallet flows
   - Premium activation with real SOL payment (devnet test first)

---

**Inventory Complete**: ✅
**Mock Functions Found**: 6 in wallet service
**Placeholder Configs**: 6 in env.dart
**Test Files**: Safely separated
**Backend**: Production-ready (mainnet-beta)

Next: Create data replacement mapping document.