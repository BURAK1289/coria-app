# CORIA Solana Wallet & Premium System - Yürütme Runbook'u

## 📋 Genel Bakış

Bu runbook, CORIA uygulaması için Solana cüzdan entegrasyonu ve premium abonelik sisteminin derinlemesine yürütme planını içermektedir. Her faz detaylı adımlar, bağımlılıklar ve durum takibi ile organize edilmiştir.

**Kaynak Doküman:** `docs/solana-wallet-premium-system.md`
**Toplam Süre:** 16 hafta (4 faz)
**Kritik Bağımlılıklar:** KMS/HSM servisi, Solana RPC erişimi, PostgreSQL veritabanı

---

## 🔍 DIAGNOSIS: Connect Wallet Issue (Root Cause Analysis)

**Status**: ❌ Non-Functional
**Date**: 2025-01-26
**Impact**: High - Users cannot complete wallet connection flow

### Root Cause

**Problem**: "Connect Wallet" UI shows external wallet options (Phantom, Backpack, Solflare) but connection fails because the implementation relies on **deep links** to external wallet apps that:

1. **Mobile Deep Link Dependency**: `solana_wallet_service.dart:_buildConnectDeepLink()` tries to launch external apps via `launchUrl()`, but:
   - External wallets may not be installed on mobile
   - Deep link schemes (`phantom://`, `solflare://`, `backpack://`) are not standard
   - No fallback mechanism when app launch fails

2. **Backend Mismatch**: After deep link, code expects `_backendApi.getMyWallets()` to return connected wallet, but:
   - Backend API expects **custodial wallets** created via `ensureUserWallet()`
   - No endpoint to "connect" external wallets yet implemented
   - Database schema has `is_custodial` field but external wallet flow incomplete

3. **UX Confusion**: Users see "Connect Wallet" UI expecting to link existing wallets, but system architecture is designed for **account-linked custodial wallets** where:
   - User's email/user_id → single custodial wallet address
   - Private keys stored securely in backend KMS/HSM
   - No need for external wallet apps

### Why It Doesn't Work

```
Current Flow (BROKEN):
User clicks "Connect Phantom"
→ Mobile tries deep link: phantom://connect
→ If Phantom not installed: fails silently
→ If Phantom installed: opens app, user approves
→ Returns to CORIA app
→ Backend call: getMyWallets() returns empty
→ Error: "No wallets found after connection"

Expected Flow (CUSTODIAL):
User sees "Create Wallet" button
→ Backend: ensureUserWallet(user_id)
→ Creates custodial keypair in KMS
→ Stores in solana_wallets with is_custodial=true
→ Returns wallet address
→ UI shows wallet address, balance, actions
```

### Solution

**Replace "Connect Wallet" with "Create Wallet"**:
- Remove external wallet deep link flow
- Implement custodial wallet creation via backend
- One wallet per user account (email/user_id)
- Consistent address across all devices
- Secure signing via KMS/HSM

---

## 🎯 Backend API Integration Services

### Backend API Service (NEW - IMPLEMENTED ✅)
**Location**: `lib/core/services/backend_api_service.dart`
**Purpose**: Central HTTP client for all backend communication
**Status**: ✅ Complete and integrated

**Features**:
- ✅ JWT authentication with automatic token injection via interceptors
- ✅ Auth endpoints (login, register, logout) with secure token storage
- ✅ Wallet endpoints (getMyWallets, getWalletBalance, createCustodialWallet, connectExternalWallet, sendTransaction, refreshWalletBalance, setPrimaryWallet)
- ✅ Payment endpoints (getPaymentConfig, convertSolToLamports, convertLamportsToSol)
- ✅ Premium endpoints (generatePremiumNonce, activatePremium, getPremiumSubscription, checkPremiumAccess, trackPremiumUsage, getPremiumPlans, getPremiumFeatures)
- ✅ Health check endpoint for backend status monitoring

**Configuration**:
```dart
BackendApiService({
  Dio? dio,
  FlutterSecureStorage? storage,
})
```

**Base URL**: Configured via `Env.instance.apiBaseUrl` (from `.env`)
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.coria.app/api/v1`

**Usage Example**:
```dart
// Initialize service (automatic in wallet service)
final backendApi = BackendApiService();

// Get user's wallets from backend
final wallets = await backendApi.getMyWallets();

// Get real-time balance from Solana via backend
final balanceData = await backendApi.getWalletBalance(walletId);

// Send SOL transaction via backend (secure, server-side signing)
final txResponse = await backendApi.sendTransaction(
  fromWalletId: walletId,
  toAddress: recipientAddress,
  amountSol: amount,
  memo: 'Payment for premium',
);

// Activate premium subscription
final premiumResult = await backendApi.activatePremium(
  transactionSignature: txSignature,
  nonce: generatedNonce,
);
```

### Wallet Service Integration (UPDATED ✅)
**Location**: `lib/features/wallet/data/services/solana_wallet_service.dart`
**Status**: ✅ Updated to use BackendApiService
**Changes**: Replaced mock data generation with real backend API calls

**Mock Functions Removed**:
- ❌ `_generateMockAddress()` - Now fetches real wallet addresses from backend
- ❌ `_generateMockBalance()` - Now fetches real Solana balances via backend API
- ❌ `_generateMockSignature()` - Now receives real transaction signatures from backend

**Real Implementation**:
```dart
// Connect wallet - now fetches real data from backend
Future<WalletModel?> connectWallet(WalletType walletType) async {
  final wallets = await _backendApi.getMyWallets();
  final walletData = wallets.first;
  return WalletModel(
    address: walletData['public_key'] ?? '',
    balance: (walletData['balance_lamports'] ?? 0) / 1000000000.0,
    // ... real data from Supabase via backend
  );
}

// Get balance - real-time from Solana blockchain
Future<double> getBalance(String address) async {
  final wallets = await _backendApi.getMyWallets();
  final wallet = wallets.firstWhere((w) => w['public_key'] == address);
  final balanceData = await _backendApi.getWalletBalance(wallet['id']);
  return (balanceData['balance_lamports'] ?? 0) / 1000000000.0;
}

// Send transaction - server-side signing for security
Future<TransactionModel> sendTransaction(SendTransactionRequest request) async {
  final wallets = await _backendApi.getMyWallets();
  final wallet = wallets.firstWhere((w) => w['public_key'] == request.fromAddress);
  final txResponse = await _backendApi.sendTransaction(
    fromWalletId: wallet['id'],
    toAddress: request.toAddress,
    amountSol: request.amount,
    // ... real transaction via backend
  );
  return TransactionModel(
    signature: txResponse['signature'] ?? '',
    // ... real transaction data
  );
}
```

### Data Flow Architecture (IMPLEMENTED ✅)
```
Flutter Mobile App
      ↓ (HTTP/HTTPS)
BackendApiService (Dio + JWT)
      ↓ (REST API)
Backend NestJS API (Port 3000)
      ↓ (Supabase Client SDK)
Supabase PostgreSQL + RLS
      ↓ (JSON RPC)
Solana Mainnet-Beta
```

**Security Rules** (ENFORCED):
- ✅ Mobile app NEVER directly accesses Supabase service role key
- ✅ Mobile app NEVER handles Solana private keys (server-side signing)
- ✅ All sensitive operations go through backend API with JWT authentication
- ✅ Row Level Security (RLS) enforced at database level
- ✅ Automatic JWT token injection via Dio interceptors

---

## 🎯 FAZ 1: FOUNDATION & INFRASTRUCTURE (Hafta 1-4)

### 1.1 Supabase Veritabanı Altyapısı

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Supabase Project Setup** | Supabase projesi oluşturma ve konfigürasyon | ⬜ | ⬜ | 🟡 |
| → Supabase proje oluştur | Development ve production ortamları | ⬜ | ⬜ | 🟢 |
| → CLI kurulumu | `npm install -g supabase` ve auth setup | ⬜ | ⬜ | 🟢 |
| → Local development | `supabase init && supabase start` | ⬜ | ⬜ | 🟢 |
| **Migration Setup** | Supabase CLI migration sistemi | ⬜ | ⬜ | 🟡 |
| → Schema migration | `supabase migration new create_solana_schema` | ⬜ | ⬜ | 🟢 |
| → RLS policies migration | `supabase migration new setup_rls_policies` | ⬜ | ⬜ | 🟡 |
| → Indexes migration | `supabase migration new create_performance_indexes` | ⬜ | ⬜ | 🟢 |
| **DB Schema Kurulumu** | PostgreSQL schema'sının deploy edilmesi | ⬜ | ⬜ | 🟡 |
| → `public.users` table | auth.users ile linked premium status | ⬜ | ⬜ | 🟢 |
| → `public.wallets` table | Custodial/external wallet type support | ⬜ | ⬜ | 🟢 |
| → `public.payments` table | Donation/premium payment tracking | ⬜ | ⬜ | 🟢 |
| → `public.ledger` table | Transaction audit trail için | ⬜ | ⬜ | 🟢 |
| → `public.idempotency_keys` table | Payment güvenliği için | ⬜ | ⬜ | 🟢 |
| **RLS Policies Setup** | Row Level Security politikaları | ⬜ | ⬜ | 🔴 |
| → Users RLS policies | Own data access only | ⬜ | ⬜ | 🟡 |
| → Wallets RLS policies | User wallet ownership control | ⬜ | ⬜ | 🟡 |
| → Payments RLS policies | User payment access + service role | ⬜ | ⬜ | 🔴 |
| → Ledger RLS policies | User ledger view + service role manage | ⬜ | ⬜ | 🟡 |
| **DB Indexes & Constraints** | Performance ve data integrity | ⬜ | ⬜ | 🟡 |
| → User performans indexleri | `idx_wallets_user_id`, `idx_payments_user_id` | ⬜ | ⬜ | 🟢 |
| → Payment signature indexleri | `idx_payments_tx_signature` unique | ⬜ | ⬜ | 🟢 |
| → Foreign key constraints | Referential integrity sağlama | ⬜ | ⬜ | 🟢 |

### 1.2 KMS/HSM Entegrasyonu

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **KMS Service Setup** | Cloud KMS kurulumu ve yapılandırması | ⬜ | ⬜ | 🔴 |
| → Development KMS key | Devnet için test anahtar oluşturma | ⬜ | ⬜ | 🟡 |
| → Production KMS key | Mainnet için production anahtar | ⬜ | ⬜ | 🔴 |
| → Key rotation policy | Quarterly rotation schedule setup | ⬜ | ⬜ | 🟡 |
| **BIP44 Implementation** | HD wallet derivation logic | ⬜ | ⬜ | 🟡 |
| → Email-based key generation | Deterministic key derivation from email | ⬜ | ⬜ | 🟡 |
| → Key path validation | `m/44'/501'/account'/0/0` implementasyonu | ⬜ | ⬜ | 🟢 |
| → Security audit | Key generation security review | ⬜ | ⬜ | 🔴 |

### 1.3 Backend Servis Altyapısı

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **NestJS Project Setup** | Backend framework kurulumu | ⬜ | ⬜ | 🟢 |
| → Project scaffolding | NestJS CLI ile proje oluşturma | ⬜ | ⬜ | 🟢 |
| → Environment config | Dev/prod environment separation | ⬜ | ⬜ | 🟢 |
| → Supabase connection | Supabase client setup ve auth | ⬜ | ⬜ | 🟡 |
| → TypeScript types | `supabase gen types typescript` | ⬜ | ⬜ | 🟢 |
| **Core Services** | Temel servis sınıfları | ⬜ | ⬜ | 🟡 |
| → SupabaseService | Supabase client wrapper service | ⬜ | ⬜ | 🟢 |
| → AuthService | Supabase Auth + JWT logic | ⬜ | ⬜ | 🟢 |
| → WalletService | Cüzdan yönetim + RLS integration | ⬜ | ⬜ | 🟡 |
| → KMSService | KMS entegrasyon servisi | ⬜ | ⬜ | 🔴 |
| → SolanaService | Solana + Supabase integration | ⬜ | ⬜ | 🟡 |
| → RealtimeService | Supabase Realtime notifications | ⬜ | ⬜ | 🟡 |
| **Infrastructure Services** | Operasyonel altyapı servisleri | ✅ | ⬜ | 🟢 |
| → StructuredLoggerService | PII-safe JSON logging with sanitization | ✅ | ⬜ | 🟢 |
| → TokenBucketRateLimiterService | Token bucket rate limiting with persistence | ✅ | ⬜ | 🟢 |
| → CircuitBreakerService | Circuit breaker pattern for external services | ✅ | ⬜ | 🟢 |
| → MonitoringService | System metrics and health monitoring | ✅ | ⬜ | 🟢 |
| → CoriaError & ErrorTaxonomy | Comprehensive error classification system | ✅ | ⬜ | 🟢 |

### 1.4 Solana RPC Konfigürasyonu

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **RPC Provider Setup** | Multi-provider failover sistemi | ⬜ | ⬜ | 🟡 |
| → Primary RPC endpoint | Ana RPC provider konfigürasyonu | ⬜ | ⬜ | 🟡 |
| → Fallback RPC endpoints | Yedek RPC provider'ları | ⬜ | ⬜ | 🟡 |
| → Connection health checks | RPC endpoint monitoring | ⬜ | ⬜ | 🟢 |
| **Environment Configuration** | Devnet/Mainnet ortam ayarları | ⬜ | ⬜ | 🟢 |
| → Devnet RPC URLs | Test ortamı RPC konfigürasyonu | ⬜ | ⬜ | 🟢 |
| → Mainnet RPC URLs | Production RPC konfigürasyonu | ⬜ | ⬜ | 🟡 |
| → Commitment levels | `confirmed` vs `finalized` strategy | ⬜ | ⬜ | 🟢 |

---

## 🔧 FAZ 2: CORE FEATURES (Hafta 5-8)

### 2.1 Custodial Wallet Yönetimi (Supabase RLS)

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Wallet Creation Logic** | Otomatik cüzdan oluşturma | ⬜ | ⬜ | 🟡 |
| → `ensureUserWallet()` method | User login'de otomatik cüzdan | ⬜ | ⬜ | 🟢 |
| → Supabase Auth trigger | auth.users ile otomatik user sync | ⬜ | ⬜ | 🟡 |
| → Public key generation | KMS ile public key oluşturma | ⬜ | ⬜ | 🟡 |
| → Supabase wallet insert | RLS ile güvenli wallet kaydetme | ⬜ | ⬜ | 🟢 |
| → Balance monitoring setup | Real-time balance tracking | ⬜ | ⬜ | 🟡 |
| **Wallet Balance API** | Bakiye sorgulama endpoint'i | ⬜ | ⬜ | 🟢 |
| → REST endpoint `/wallets/balance` | User bakiye sorgulama (RLS protected) | ⬜ | ⬜ | 🟢 |
| → Supabase Realtime | Real-time balance updates via channels | ⬜ | ⬜ | 🟡 |
| → USD value conversion | SOL/USD rate integration | ⬜ | ⬜ | 🟡 |

### 2.2 Payment Processing Core

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Transaction Creation** | Solana transaction oluşturma | ⬜ | ⬜ | 🟡 |
| → `createTransaction()` method | Transfer instruction oluşturma | ⬜ | ⬜ | 🟢 |
| → Fee calculation | Dynamic fee calculation | ⬜ | ⬜ | 🟡 |
| → Recent blockhash | Blockhash yönetimi | ⬜ | ⬜ | 🟢 |
| **Transaction Signing** | KMS ile transaction imzalama | ⬜ | ⬜ | 🔴 |
| → KMS signing integration | Secure transaction signing | ⬜ | ⬜ | 🔴 |
| → Signature verification | İmza doğrulama | ⬜ | ⬜ | 🟡 |
| → Broadcast to network | Solana network'e gönderme | ⬜ | ⬜ | 🟢 |
| **Confirmation Polling** | Transaction teyit sistemi | ⬜ | ⬜ | 🟡 |
| → Background job scheduler | Async confirmation jobs | ⬜ | ⬜ | 🟡 |
| → Polling mechanism | 30 saniyelik confirmation polling | ⬜ | ⬜ | 🟢 |
| → Status update callbacks | Payment status güncellemeleri | ⬜ | ⬜ | 🟢 |

### 2.3 Donation System

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Donation Pool Setup** | Platform bağış havuzu | ⬜ | ⬜ | 🟡 |
| → Donation pool wallet | Merkezi bağış cüzdanı oluşturma | ⬜ | ⬜ | 🟡 |
| → Environment config | `DONATION_POOL_PUBKEY` setup | ⬜ | ⬜ | 🟢 |
| → Multi-sig consideration | Güvenlik için multi-sig değerlendirmesi | ⬜ | ⬜ | 🟡 |
| **Donation Flow API** | Bağış işlem endpoint'leri | ⬜ | ⬜ | 🟢 |
| → `POST /donations/create` | Bağış başlatma endpoint'i | ⬜ | ⬜ | 🟢 |
| → Balance validation | Insufficient funds kontrolü | ⬜ | ⬜ | 🟢 |
| → Payment record creation | Donation payment record | ⬜ | ⬜ | 🟢 |
| → Transaction processing | Solana transaction işleme | ⬜ | ⬜ | 🟡 |

### 2.4 Premium Payment System

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Premium Pool Setup** | Premium ödeme havuzu | ⬜ | ⬜ | 🟡 |
| → Premium pool wallet | Premium ödemeleri için cüzdan | ⬜ | ⬜ | 🟡 |
| → `PREMIUM_POOL_PUBKEY` config | Environment variable setup | ⬜ | ⬜ | 🟢 |
| → `PREMIUM_PRICE_SOL` setup | Dinamik fiyatlandırma | ⬜ | ⬜ | 🟢 |
| **Premium Purchase Flow** | Premium satın alma işlemi | ⬜ | ⬜ | 🟡 |
| → `POST /premium/purchase` | Premium satın alma endpoint | ⬜ | ⬜ | 🟢 |
| → Active premium check | Mevcut premium durumu kontrolü | ⬜ | ⬜ | 🟢 |
| → Payment processing | Premium payment transaction | ⬜ | ⬜ | 🟡 |
| → Premium activation | 30 günlük premium aktivasyon | ⬜ | ⬜ | 🟢 |

---

## 📱 FAZ 3: FRONTEND IMPLEMENTATION (Hafta 9-12)

### 3.1 Settings Wallet Section

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **WalletCard Widget** | Ana cüzdan display widget'ı | ⬜ | ⬜ | 🟢 |
| → Balance display | SOL/USD bakiye gösterimi | ⬜ | ⬜ | 🟢 |
| → Address display | Wallet adresi ve QR kod | ⬜ | ⬜ | 🟢 |
| → Receive/Send buttons | Alma/gönderme butonları | ⬜ | ⬜ | 🟢 |
| → Wallet type indicator | Custodial/External type chip | ⬜ | ⬜ | 🟢 |
| **Receive Dialog** | SOL alma interface'i | ⬜ | ⬜ | 🟢 |
| → QR code generation | Address QR kod oluşturma | ⬜ | ⬜ | 🟢 |
| → Copy address button | Adres kopyalama fonksiyonu | ⬜ | ⬜ | 🟢 |
| → Share functionality | Address paylaşma özelliği | ⬜ | ⬜ | 🟢 |
| **Send Dialog** | SOL gönderme form'u | ⬜ | ⬜ | 🟡 |
| → Address input validation | Hedef adres doğrulama | ⬜ | ⬜ | 🟢 |
| → Amount input with conversion | SOL/USD converter | ⬜ | ⬜ | 🟡 |
| → Fee estimation | Network fee gösterimi | ⬜ | ⬜ | 🟡 |
| → Confirmation dialog | İşlem onay ekranı | ⬜ | ⬜ | 🟢 |

### 3.2 External Wallet Integration

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Phantom Integration** | Phantom wallet bağlantısı | ⬜ | ⬜ | 🟡 |
| → Deep link setup | Phantom deep link integration | ⬜ | ⬜ | 🟡 |
| → Connection request | Wallet connection flow | ⬜ | ⬜ | 🟡 |
| → Public key retrieval | Connected wallet public key | ⬜ | ⬜ | 🟢 |
| → Signature request | Transaction signing via Phantom | ⬜ | ⬜ | 🟡 |
| **Backpack Integration** | Backpack wallet bağlantısı | ⬜ | ⬜ | 🟡 |
| → Deep link setup | Backpack deep link integration | ⬜ | ⬜ | 🟡 |
| → Connection flow | Wallet connection implementation | ⬜ | ⬜ | 🟡 |
| → Transaction signing | Backpack ile işlem imzalama | ⬜ | ⬜ | 🟡 |
| **Multi-Wallet Management** | Birden fazla cüzdan yönetimi | ⬜ | ⬜ | 🟡 |
| → Primary wallet selection | Ana cüzdan seçimi | ⬜ | ⬜ | 🟢 |
| → Wallet switching UI | Cüzdanlar arası geçiş | ⬜ | ⬜ | 🟢 |
| → Balance aggregation | Toplam bakiye gösterimi | ⬜ | ⬜ | 🟡 |

### 3.3 Premium Purchase UI

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Premium Features List** | Premium özellik listeleme | ⬜ | ⬜ | 🟢 |
| → Feature comparison table | Free vs Premium karşılaştırma | ⬜ | ⬜ | 🟢 |
| → Pricing display | SOL/USD fiyat gösterimi | ⬜ | ⬜ | 🟢 |
| → Duration information | 30 günlük süre bilgisi | ⬜ | ⬜ | 🟢 |
| **Payment Method Selector** | Ödeme yöntemi seçimi | ⬜ | ⬜ | 🟢 |
| → Credit card option | Kredi kartı seçeneği | ⬜ | ⬜ | 🟢 |
| → SOL payment option | SOL ile ödeme seçeneği | ⬜ | ⬜ | 🟢 |
| → Insufficient funds warning | Yetersiz bakiye uyarısı | ⬜ | ⬜ | 🟢 |
| → Price comparison | SOL vs fiat price comparison | ⬜ | ⬜ | 🟡 |
| **Purchase Flow** | Satın alma süreci | ⬜ | ⬜ | 🟡 |
| → Confirmation screen | İşlem onay ekranı | ⬜ | ⬜ | 🟢 |
| → Processing indicator | İşlem durumu göstergesi | ⬜ | ⬜ | 🟢 |
| → Success/Error feedback | Başarı/hata geri bildirimi | ⬜ | ⬜ | 🟢 |
| → Premium activation notification | Premium aktif bildirim | ⬜ | ⬜ | 🟢 |

### 3.4 State Management & Providers (Supabase Integration)

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Supabase Auth Provider** | Authentication state yönetimi | ⬜ | ⬜ | 🟡 |
| → `supabaseAuthProvider` | Supabase Auth state management | ⬜ | ⬜ | 🟢 |
| → RLS context provider | User context for RLS queries | ⬜ | ⬜ | 🟡 |
| → Session management | Auto-refresh token handling | ⬜ | ⬜ | 🟡 |
| **Wallet State Provider** | Cüzdan durumu yönetimi | ⬜ | ⬜ | 🟡 |
| → `walletStateProvider` | Supabase query ile wallet state | ⬜ | ⬜ | 🟢 |
| → Realtime balance updates | Supabase Realtime subscription | ⬜ | ⬜ | 🟡 |
| → Multi-wallet state | Birden fazla cüzdan state | ⬜ | ⬜ | 🟡 |
| **Payment State Providers** | Ödeme durumu yönetimi | ⬜ | ⬜ | 🟡 |
| → `paymentStateProvider` | Supabase ile payment state | ⬜ | ⬜ | 🟢 |
| → `premiumStateProvider` | RLS ile premium status | ⬜ | ⬜ | 🟢 |
| → Realtime payment updates | Payment confirmation notifications | ⬜ | ⬜ | 🟡 |

---

## 🔒 FAZ 4: SECURITY & PRODUCTION (Hafta 13-16)

### 4.1 Supabase Security Implementation

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Supabase RLS Security** | Row Level Security politikaları | ⬜ | ⬜ | 🔴 |
| → User isolation policies | Kullanıcılar sadece kendi verilerine erişim | ⬜ | ⬜ | 🔴 |
| → Service role policies | Backend için admin access | ⬜ | ⬜ | 🔴 |
| → Policy testing | RLS policy güvenlik testleri | ⬜ | ⬜ | 🔴 |
| **Key Management** | Supabase key güvenliği | ⬜ | ⬜ | 🔴 |
| → Anon key rotation | Public key rotation strategy | ⬜ | ⬜ | 🟡 |
| → Service role protection | Private key environment security | ⬜ | ⬜ | 🔴 |
| → JWT secret management | JWT signing key protection | ⬜ | ⬜ | 🔴 |
| **Anti-Replay Protection** | Replay attack önleme | ⬜ | ⬜ | 🔴 |
| → Nonce validation | Cryptographic nonce sistemi | ⬜ | ⬜ | 🔴 |
| → Timestamp verification | ±5 minute timestamp window | ⬜ | ⬜ | 🟡 |
| → Request signature | Request signing mechanism | ⬜ | ⬜ | 🔴 |
| **Multi-Factor Authentication** | MFA yüksek değerli işlemler | ⬜ | ⬜ | 🔴 |
| → Biometric authentication | Mobile biometric integration | ⬜ | ⬜ | 🟡 |
| → Step-up authentication | High-value operation MFA | ⬜ | ⬜ | 🔴 |
| → Session management | Token rotation policy | ⬜ | ⬜ | 🟡 |
| **Rate Limiting & Security Infrastructure** | Gelişmiş güvenlik altyapısı | ✅ | ⬜ | 🟢 |
| → Token bucket rate limiting | Tier-based rate limiting with persistence | ✅ | ⬜ | 🟢 |
| → Circuit breaker protection | External service failure protection | ✅ | ⬜ | 🟢 |
| → Security audit logging | Comprehensive security event logging | ✅ | ⬜ | 🟢 |
| → Error taxonomy classification | Structured error handling and classification | ✅ | ⬜ | 🟢 |
| → PII sanitization | Automatic sensitive data masking in logs | ✅ | ⬜ | 🟢 |

### 4.2 Idempotency & Data Integrity

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Idempotency Keys** | Payment güvenliği | ⬜ | ⬜ | 🟡 |
| → Key generation strategy | Unique idempotency key oluşturma | ⬜ | ⬜ | 🟢 |
| → Duplicate payment prevention | Çift ödeme önleme | ⬜ | ⬜ | 🟡 |
| → Response caching | İdempotent response cache | ⬜ | ⬜ | 🟡 |
| **Data Consistency** | Veritabanı tutarlılığı | ⬜ | ⬜ | 🟡 |
| → Transaction isolation | DB transaction isolation | ⬜ | ⬜ | 🟡 |
| → Atomic operations | Payment atomicity | ⬜ | ⬜ | 🟡 |
| → Rollback procedures | Hata durumu rollback | ⬜ | ⬜ | 🟡 |

### 4.3 Monitoring & Alerting

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Business Metrics Dashboard** | İş metrik izleme | ⬜ | ⬜ | 🟡 |
| → Premium conversion rate | SOL ile premium dönüşüm | ⬜ | ⬜ | 🟢 |
| → Daily donation volume | Günlük bağış hacmi | ⬜ | ⬜ | 🟢 |
| → Wallet adoption rate | Cüzdan kullanım oranı | ⬜ | ⬜ | 🟢 |
| → External wallet usage | Harici cüzdan kullanımı | ⬜ | ⬜ | 🟢 |
| **Technical Metrics** | Teknik performans metrikleri | ⬜ | ⬜ | 🟡 |
| → Transaction confirmation time | p95 < 30 saniye hedefi | ⬜ | ⬜ | 🟡 |
| → API response time | p95 < 500ms hedefi | ⬜ | ⬜ | 🟡 |
| → System uptime | >99.9% uptime hedefi | ⬜ | ⬜ | 🟡 |
| → Payment success rate | >99% başarı oranı | ⬜ | ⬜ | 🟡 |
| **Critical Alerts** | Kritik durum uyarıları | ⬜ | ⬜ | 🟡 |
| → HSM service down alert | KMS/HSM servis uyarısı | ⬜ | ⬜ | 🔴 |
| → Payment failure rate >5% | Ödeme hata oranı uyarısı | ⬜ | ⬜ | 🟡 |
| → Database connection failure | DB bağlantı uyarısı | ⬜ | ⬜ | 🟡 |
| → Security breach indicators | Güvenlik ihlali uyarısı | ⬜ | ⬜ | 🔴 |

### 4.4 Testing & Quality Assurance

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Unit Tests** | Birim test kapsamı | ⬜ | ⬜ | 🟡 |
| → Wallet service tests | 95% coverage hedefi | ⬜ | ⬜ | 🟡 |
| → Payment service tests | 90% coverage hedefi | ⬜ | ⬜ | 🟡 |
| → Premium service tests | 85% coverage hedefi | ⬜ | ⬜ | 🟡 |
| **Integration Tests** | Entegrasyon testleri | ⬜ | ⬜ | 🟡 |
| → Solana RPC tests | Blockchain entegrasyon testleri | ⬜ | ⬜ | 🟡 |
| → KMS integration tests | KMS servis entegrasyon | ⬜ | ⬜ | 🔴 |
| → Database integration | DB entegrasyon testleri | ⬜ | ⬜ | 🟢 |
| **E2E Tests** | Uçtan uca testler | ⬜ | ⬜ | 🟡 |
| → Donation flow E2E | Tam bağış akışı testi | ⬜ | ⬜ | 🟡 |
| → Premium purchase E2E | Premium satın alma testi | ⬜ | ⬜ | 🟡 |
| → External wallet E2E | Harici cüzdan entegrasyon | ⬜ | ⬜ | 🟡 |
| **Security Tests** | Güvenlik testleri | ⬜ | ⬜ | 🔴 |
| → Penetration testing | Sistem güvenlik testi | ⬜ | ⬜ | 🔴 |
| → Vulnerability assessment | Güvenlik açığı değerlendirmesi | ⬜ | ⬜ | 🔴 |
| → Code security audit | Kod güvenlik incelemesi | ⬜ | ⬜ | 🔴 |

---

## 🛠️ Infrastructure Services Operational Guide

### Structured Logging Service (StructuredLoggerService)

| Component | Details | Configuration |
|-----------|---------|---------------|
| **PII Sanitization** | Automatic masking of sensitive data | Email: `em***@domain.com`, Wallet: `abcd...wxyz` |
| **Log Levels** | ERROR, WARN, INFO, DEBUG | Environment: `LOG_LEVEL=info` |
| **Output Format** | Structured JSON for production | Pretty-print for development |
| **Security Events** | Specialized logging for auth/payment | Severity classification: low/medium/high/critical |

**Monitoring Commands:**
```bash
# Check logs for payment issues
grep "paymentId" logs/app.log | jq '.level, .message, .paymentId'

# Monitor security events
grep "🚨 Security Event" logs/app.log | jq '.severity, .category, .userId'

# Track performance issues
grep "criticalPerformance.*true" logs/app.log | jq '.operation, .duration'
```

### Token Bucket Rate Limiter (TokenBucketRateLimiterService)

| Operation Type | Free Tier | Premium Tier | Monitoring |
|----------------|-----------|--------------|------------|
| **Scan Operations** | 10/hour (0.1/sec refill) | 100/hour (1/sec refill) | Monitor utilization >80% |
| **Payment Operations** | 5/hour (0.05/sec refill) | 50/hour (0.5/sec refill) | Alert on violations |
| **API Calls** | 100/hour (1/sec refill) | 1000/hour (10/sec refill) | Track by user/IP |
| **Auth Operations** | 5/hour (0.1/sec refill) | Same | Critical security monitoring |

**Management Commands:**
```bash
# Check rate limit stats for user
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.coria.app/admin/rate-limits/stats?identifier=user-123"

# Reset rate limit for user (admin only)
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.coria.app/admin/rate-limits/reset" \
  -d '{"identifier":"user-123","operation":"payment","tier":"free"}'

# Monitor blocked users
grep "limit_exceeded" logs/app.log | jq '.userId, .operation, .retryAfter'
```

### Circuit Breaker Service (CircuitBreakerService)

| State | Behavior | Thresholds | Recovery |
|-------|----------|------------|----------|
| **CLOSED** | Normal operation | Failure rate < 20% | - |
| **OPEN** | Fail fast | Failure rate ≥ 20% | Wait period: 60s |
| **HALF_OPEN** | Limited testing | 5 test requests | Success → CLOSED, Fail → OPEN |

**Protected Services:**
- Solana RPC calls
- KMS operations
- External API integrations
- Database connections

**Monitoring:**
```bash
# Check circuit breaker states
grep "circuit.*state" logs/app.log | jq '.circuitKey, .state, .failureRate'

# Monitor service health
curl "https://api.coria.app/health/circuit-breakers"
```

### Error Taxonomy & Classification

| Error Category | Retry Strategy | User Message | Monitoring |
|----------------|----------------|--------------|------------|
| **NETWORK_ERROR** | Exponential backoff | "Connection issue, retrying..." | Track retry success rate |
| **INSUFFICIENT_FUNDS** | No retry | "Insufficient balance" | Business metric |
| **SOLANA_RPC_ERROR** | Circuit breaker + retry | "Network busy, please wait" | Alert if >5% failure |
| **KMS_ERROR** | Immediate escalation | "Service temporarily unavailable" | Page-worthy incident |

**Error Response Format:**
```json
{
  "error": {
    "code": "CORIA_INSUFFICIENT_FUNDS",
    "message": "Insufficient balance for transaction",
    "userMessage": "Your wallet balance is too low for this transaction",
    "category": "PAYMENT_ERROR",
    "severity": "medium",
    "retryable": false,
    "errorId": "ERR_20250126_abc123",
    "context": {
      "required": 1000000,
      "available": 500000,
      "currency": "lamports"
    }
  }
}
```

### Monitoring Service Metrics

| Metric Category | Key Indicators | Alerting Thresholds |
|-----------------|----------------|-------------------|
| **System Health** | CPU, Memory, Disk | CPU >80%, Memory >90% |
| **API Performance** | Response time, Error rate | P95 >500ms, Error >5% |
| **Business Metrics** | Payment success, User activity | Success <95%, Activity drops >20% |
| **Security Events** | Failed auth, Rate limits | Failed auth >10/min, Rate limits >50/hour |

**Dashboard URLs:**
```bash
# System metrics
https://monitoring.coria.app/system-health

# Business metrics
https://monitoring.coria.app/business-dashboard

# Security events
https://monitoring.coria.app/security-events
```

### Database Schema Additions

The infrastructure services require additional database tables:

```sql
-- Rate limiting violations tracking
CREATE TABLE public.rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    refill_rate NUMERIC(10,4) NOT NULL,
    block_duration INTEGER,
    violated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX idx_rate_violations_identifier (identifier),
    INDEX idx_rate_violations_operation (operation),
    INDEX idx_rate_violations_violated_at (violated_at)
);

-- Circuit breaker state tracking
CREATE TABLE public.circuit_breaker_states (
    circuit_key VARCHAR(100) PRIMARY KEY,
    state VARCHAR(20) NOT NULL DEFAULT 'CLOSED',
    failure_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP WITH TIME ZONE,
    next_attempt TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System metrics storage
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX idx_metrics_name_time (metric_name, recorded_at),
    INDEX idx_metrics_tags (tags)
);
```

---

## 🚀 DEPLOYMENT & GO-LIVE

### Environment Rollout

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Supabase Development Environment** | Devnet + Local Supabase | ⬜ | ⬜ | 🟡 |
| → Local Supabase setup | `supabase start` local development | ⬜ | ⬜ | 🟢 |
| → Development migrations | Schema + RLS deployment | ⬜ | ⬜ | 🟡 |
| → Devnet RPC configuration | Test ortamı RPC setup | ⬜ | ⬜ | 🟢 |
| → Test KMS keys | Development KMS setup | ⬜ | ⬜ | 🟡 |
| → Test pool wallets | Devnet donation/premium pools | ⬜ | ⬜ | 🟢 |
| → End-to-end testing | Tam sistem testi devnet'te | ⬜ | ⬜ | 🟡 |
| **Supabase Staging Environment** | Production benzeri test | ⬜ | ⬜ | 🟡 |
| → Staging Supabase project | Ayrı staging project setup | ⬜ | ⬜ | 🟡 |
| → Production-like RLS policies | Gerçek RLS policy testleri | ⬜ | ⬜ | 🔴 |
| → Production data simulation | Gerçekçi test verileri | ⬜ | ⬜ | 🟢 |
| → Load testing | Performance yük testleri | ⬜ | ⬜ | 🟡 |
| → Security testing | RLS + güvenlik penetrasyon testleri | ⬜ | ⬜ | 🔴 |
| **Supabase Production Environment** | Mainnet-beta canlı ortam | ⬜ | ⬜ | 🔴 |
| → Production Supabase project | Dedicated production instance | ⬜ | ⬜ | 🔴 |
| → Production migrations | Schema + RLS production deploy | ⬜ | ⬜ | 🔴 |
| → Database connection pooling | Production DB performance setup | ⬜ | ⬜ | 🟡 |
| → Mainnet RPC setup | Production RPC configuration | ⬜ | ⬜ | 🟡 |
| → Production KMS | Canlı KMS key management | ⬜ | ⬜ | 🔴 |
| → Production pool wallets | Gerçek donation/premium pools | ⬜ | ⬜ | 🔴 |
| → Supabase monitoring | Database + Auth monitoring | ⬜ | ⬜ | 🟡 |

### Go-Live Checklist

| Görev | Açıklama | Done | Blocked | Risk |
|-------|----------|------|---------|------|
| **Pre-Launch Validation** | Canlıya alma öncesi kontrol | ⬜ | ⬜ | 🔴 |
| → All acceptance criteria met | Tüm kabul kriterleri tamam | ⬜ | ⬜ | 🔴 |
| → Security audit completed | Güvenlik denetimi tamamlandı | ⬜ | ⬜ | 🔴 |
| → Performance benchmarks | Performans hedefleri karşılandı | ⬜ | ⬜ | 🟡 |
| → Rollback plan tested | Geri alma planı test edildi | ⬜ | ⬜ | 🟡 |
| **Launch Day Operations** | Canlıya alma günü operasyonları | ⬜ | ⬜ | 🔴 |
| → Database migration | Production DB migration | ⬜ | ⬜ | 🔴 |
| → Application deployment | App deployment mainnet'e | ⬜ | ⬜ | 🔴 |
| → Real-time monitoring | Canlı sistem izleme | ⬜ | ⬜ | 🟡 |
| → User communication | Kullanıcı bilgilendirme | ⬜ | ⬜ | 🟢 |

---

## 📊 KPİ Takip & Başarı Metrikleri

### İş Metrikleri

| Metrik | Hedef | Current | Risk Level |
|--------|-------|---------|------------|
| **Premium Conversion Rate** | >5% SOL ile dönüşüm | - | 🟡 |
| **Daily Donation Volume** | >10 SOL/gün | - | 🟢 |
| **Wallet Adoption Rate** | >80% kullanıcı cüzdan kullanımı | - | 🟡 |
| **External Wallet Usage** | >30% harici cüzdan bağlantısı | - | 🟡 |

### Teknik Metrikleri

| Metrik | Hedef | Current | Risk Level |
|--------|-------|---------|------------|
| **Transaction Confirmation** | p95 < 30 saniye | - | 🟡 |
| **API Response Time** | p95 < 500ms | - | 🟡 |
| **System Uptime** | >99.9% | - | 🟡 |
| **Payment Success Rate** | >99% | - | 🟡 |

---

## 🚨 Risk Yönetimi & Contingency Plans

### Kritik Riskler

| Risk | Olasılık | Etki | Mitigation Plan |
|------|----------|------|------------------|
| **KMS/HSM Service Downtime** | Düşük | Yüksek | Multi-region KMS setup + manual backup procedures |
| **Solana Network Congestion** | Orta | Orta | Multi-RPC failover + dynamic fee adjustment |
| **Smart Contract Exploit** | Düşük | Yüksek | Security audit + bug bounty program |
| **Regulatory Changes** | Orta | Yüksek | Legal monitoring + compliance framework |

### Acil Durum Prosedürleri

| Senaryo | Immediate Action | Recovery Plan |
|---------|------------------|---------------|
| **Payment System Down** | 1. User notification<br>2. Disable payment UI<br>3. Investigate root cause | 1. Fix underlying issue<br>2. Validate with test transactions<br>3. Gradual re-enable |
| **Database Corruption** | 1. Switch to read replica<br>2. Stop write operations<br>3. Begin backup restoration | 1. Restore from backup<br>2. Validate data integrity<br>3. Resume operations |
| **Security Breach** | 1. Immediate system lockdown<br>2. User notification<br>3. Incident response team | 1. Vulnerability patching<br>2. Security audit<br>3. Gradual service restoration |

---

## 📋 Final Checklist - Production Readiness

### Fonksiyonel Gereksinimler ✅

**Wallet Management:**
- [ ] Kullanıcı ayarlarda cüzdan adresini görür
- [ ] QR kod ile SOL alma özelliği çalışır
- [ ] SOL gönderme formu aktif ve çalışır
- [ ] External wallet bağlama (Phantom/Backpack)

**Payment Processing:**
- [ ] Bağış sistemi donation_pool'a başarıyla gönderir
- [ ] Premium ödeme premium_pool'a doğru tutarla gönderir
- [ ] On-chain teyit sonrası veritabanı güncellenir
- [ ] Premium durumu doğru şekilde atanır (active/expired)

**Business Logic:**
- [ ] PREMIUM_PRICE_SOL env kontrolü çalışır
- [ ] İdempotent ödeme işleme implementi
- [ ] Premium süresi bitişinde otomatik expired durumu
- [ ] Bağış kullanıcı eşlemesi payments.user_id ile yapılır

### Teknik Gereksinimler ✅

**Security:**
- [ ] KMS/HSM ile güvenli custodial anahtar yönetimi
- [ ] Anti-replay protection (nonce + timestamp)
- [ ] Rate limiting ve comprehensive audit logging
- [ ] Multi-factor authentication high-value operations

**Performance:**
- [ ] Transaction confirmation süresi < 30 saniye
- [ ] API response time < 500ms (p95)
- [ ] Wallet creation süresi < 2 saniye
- [ ] System uptime > %99.9

**Integration:**
- [ ] Devnet test ortamı tam çalışır
- [ ] Mainnet-beta production hazır
- [ ] Multi-RPC failover sistemi
- [ ] External wallet deep link entegrasyonu

### Kullanıcı Deneyimi ✅

**UI/UX:**
- [ ] Settings → Cüzdanım bölümü tam implement
- [ ] Premium satın alma SOL ile payment option
- [ ] External wallet connection interface
- [ ] Transaction status real-time monitoring

**Accessibility:**
- [ ] Screen reader compatibility (WCAG 2.1 AA)
- [ ] Clear error messages ve user guidance
- [ ] Loading states ve progress indicators
- [ ] Mobile-optimized responsive design

---

## 📞 İletişim & Escalation

### Takım Rolleri

| Rol | Sorumlu | İletişim |
|-----|---------|----------|
| **Technical Lead** | Backend & Solana integration | primary-tech-lead@coria.app |
| **Frontend Lead** | Flutter UI implementation | frontend-lead@coria.app |
| **Security Lead** | KMS/HSM & security audit | security-lead@coria.app |
| **DevOps Lead** | Infrastructure & monitoring | devops-lead@coria.app |
| **Product Owner** | Business requirements & acceptance | product-owner@coria.app |

### Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|---------------|-----------------|
| **P1 - Critical** | 15 minutes | Technical Lead → CTO → CEO |
| **P2 - High** | 1 hour | Technical Lead → Engineering Manager |
| **P3 - Medium** | 4 hours | Assigned Developer → Technical Lead |
| **P4 - Low** | 24 hours | Assigned Developer |

---

## 🔧 Supabase CLI Commands & Migration Workflow

### Development Setup Commands
```bash
# Global Supabase CLI kurulumu
npm install -g supabase

# Project initialization
supabase init
supabase start  # Local Supabase stack başlatır

# Database bağlantısı test et
supabase db ping

# Local dashboard erişimi
echo "Local Supabase Dashboard: http://localhost:54323"
echo "Local Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
```

### Migration Management
```bash
# Yeni migration oluştur
supabase migration new create_solana_wallet_schema
supabase migration new setup_rls_policies
supabase migration new create_performance_indexes

# Migration dosyalarını düzenle
# supabase/migrations/20250126000001_create_solana_wallet_schema.sql
# supabase/migrations/20250126000002_setup_rls_policies.sql
# supabase/migrations/20250126000003_create_performance_indexes.sql

# Local'de migration apply et
supabase db push

# Migration durumunu kontrol et
supabase migration list

# Reset local database (development only)
supabase db reset
```

### Type Generation
```bash
# TypeScript types generate et
supabase gen types typescript --local > lib/types/supabase.ts

# Production'dan types generate et (production deploy sonrası)
supabase gen types typescript --project-id your-project-id > lib/types/supabase.ts
```

### Environment Deployment
```bash
# Staging environment'a deploy
supabase link --project-ref your-staging-project
supabase db push --linked

# Production environment'a deploy
supabase link --project-ref your-production-project
supabase db push --linked

# Backup oluştur (production öncesi)
supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql
```

### RLS Policy Testing
```bash
# RLS policy test komutları
psql "postgresql://postgres:postgres@localhost:54322/postgres" << EOF
SET ROLE anon;
SELECT * FROM public.wallets; -- Bu boş dönmeli (RLS active)

SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM public.wallets; -- Sadece user'ın walletları dönmeli

SET ROLE service_role;
SELECT * FROM public.wallets; -- Tüm walletlar dönmeli
EOF
```

### Monitoring & Debugging
```bash
# Real-time logs izle
supabase logs --follow

# Database logs
supabase logs db --follow

# Auth logs
supabase logs auth --follow

# Specific function logs
supabase logs functions your-function-name --follow
```

## 🔐 Supabase Key Management Patterns

### Frontend (Flutter) - Anon Key Usage
```dart
// lib/core/services/supabase_service.dart
class SupabaseService {
  static final _client = SupabaseClient(
    EnvConfig.supabaseUrl,
    EnvConfig.supabaseAnonKey, // Public key - RLS protected
  );

  // User kendi verilerine erişim (RLS otomatik filter)
  static Future<List<Wallet>> getUserWallets() async {
    final response = await _client
        .from('wallets')
        .select()
        .eq('user_id', _client.auth.currentUser!.id); // RLS zaten filter eder

    return response.map((json) => Wallet.fromJson(json)).toList();
  }
}
```

### Backend (NestJS) - Service Role Usage
```typescript
// src/services/supabase-admin.service.ts
@Injectable()
export class SupabaseAdminService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Private key - RLS bypass
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  // Admin operations - tüm verilere erişim
  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const { data, error } = await this.supabase
      .from('payments')
      .update({ status, confirmed_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select();

    if (error) throw new Error(`Payment update failed: ${error.message}`);
    return data[0];
  }

  // Broadcast real-time notifications
  async notifyPaymentConfirmed(userId: string, paymentId: string) {
    await this.supabase
      .channel('payment-updates')
      .send({
        type: 'broadcast',
        event: 'payment-confirmed',
        payload: { userId, paymentId },
      });
  }
}
```

### Environment Variables Template
```bash
# .env.development
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# .env.staging
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# .env.production
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

---

---

## 🔧 Infrastructure Services Integration Guide

### Service Dependencies & Initialization Order

```typescript
// app.module.ts - Service loading sequence
@Module({
  imports: [
    // 1. Foundation services
    ConfigModule.forRoot(),

    // 2. Infrastructure services
    StructuredLoggerModule,      // Logging first
    MonitoringModule,             // Then monitoring

    // 3. Security services
    TokenBucketRateLimiterModule, // Rate limiting
    CircuitBreakerModule,         // Circuit breaker

    // 4. Business services
    SupabaseModule,
    SolanaModule,
    WalletModule,
    PaymentModule,
  ],
})
export class AppModule {}
```

### Environment Variables for Infrastructure

```bash
# Structured Logging
LOG_LEVEL=info                    # error|warn|info|debug
LOG_FORMAT=json                   # json|pretty
LOG_PII_SANITIZATION=true         # Enable PII masking

# Rate Limiting
RATE_LIMIT_ENABLED=true           # Enable/disable rate limiting
RATE_LIMIT_STORAGE=memory         # memory|redis
RATE_LIMIT_CLEANUP_INTERVAL=3600  # Cleanup interval in seconds

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true      # Enable/disable circuit breaker
CIRCUIT_BREAKER_THRESHOLD=0.2     # 20% failure rate threshold
CIRCUIT_BREAKER_TIMEOUT=60000     # 60 seconds timeout
CIRCUIT_BREAKER_HALF_OPEN_MAX=5   # Max requests in half-open state

# Monitoring
MONITORING_ENABLED=true           # Enable/disable monitoring
MONITORING_INTERVAL=60000         # 60 seconds metrics collection
HEALTH_CHECK_TIMEOUT=5000         # 5 seconds health check timeout

# Alert Thresholds
ALERT_CPU_THRESHOLD=80            # 80% CPU usage
ALERT_MEMORY_THRESHOLD=90         # 90% memory usage
ALERT_ERROR_RATE_THRESHOLD=5      # 5% error rate
ALERT_RESPONSE_TIME_P95=500       # 500ms P95 response time
```

### Usage Examples in Services

#### Using Structured Logger

```typescript
import { StructuredLoggerService } from '@/common/services/structured-logger.service';

@Injectable()
export class PaymentService {
  constructor(private readonly logger: StructuredLoggerService) {}

  async processPayment(payment: PaymentRequest) {
    this.logger.info('Processing payment', {
      paymentId: payment.id,
      userId: payment.userId,
      amount: payment.amount,
    });

    try {
      const result = await this.executePayment(payment);

      this.logger.info('Payment successful', {
        paymentId: payment.id,
        txSignature: result.signature,
      });

      return result;
    } catch (error) {
      this.logger.error('Payment failed', error, {
        paymentId: payment.id,
        userId: payment.userId,
      });
      throw error;
    }
  }
}
```

#### Using Rate Limiter

```typescript
import { TokenBucketRateLimiterService } from '@/common/services/token-bucket-rate-limiter.service';

@Injectable()
export class PaymentController {
  constructor(private readonly rateLimiter: TokenBucketRateLimiterService) {}

  @Post('/payment/create')
  async createPayment(@Request() req, @Body() dto: CreatePaymentDto) {
    // Check rate limit
    const result = await this.rateLimiter.checkRateLimit({
      identifier: req.user.id,
      operation: 'payment',
      tier: req.user.isPremium ? 'premium' : 'free',
      cost: 1,
    });

    if (!result.allowed) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
          resetTime: result.resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.paymentService.create(dto);
  }
}
```

#### Using Circuit Breaker

```typescript
import { CircuitBreakerService } from '@/common/services/circuit-breaker.service';

@Injectable()
export class SolanaService {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly logger: StructuredLoggerService,
  ) {}

  async sendTransaction(transaction: Transaction) {
    return this.circuitBreaker.executeWithProtection(
      'solana:sendTransaction',
      async () => {
        return await this.connection.sendTransaction(transaction);
      },
      {
        circuitKey: 'solana:rpc',
        retryKey: 'solana:transaction',
        context: {
          operation: 'sendTransaction',
          timestamp: Date.now(),
        },
      },
    );
  }
}
```

#### Using Error Taxonomy

```typescript
import { CoriaError, ErrorClassifications } from '@/common/errors/error-taxonomy';

@Injectable()
export class WalletService {
  async getBalance(walletAddress: string) {
    try {
      const balance = await this.solanaService.getBalance(walletAddress);
      return balance;
    } catch (error) {
      // Classify and throw structured error
      if (error.message.includes('network')) {
        throw new CoriaError(
          ErrorClassifications.NETWORK_ERROR,
          { walletAddress, originalError: error.message },
          error,
        );
      }

      if (error.message.includes('not found')) {
        throw new CoriaError(
          ErrorClassifications.WALLET_NOT_FOUND,
          { walletAddress },
          error,
        );
      }

      // Unknown error
      throw new CoriaError(
        ErrorClassifications.UNKNOWN_ERROR,
        { walletAddress, originalError: error.message },
        error,
      );
    }
  }
}
```

### Monitoring Dashboard Integration

```typescript
// monitoring.controller.ts
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get('/health')
  async getHealth() {
    return this.monitoring.getHealthStatus();
  }

  @Get('/metrics')
  async getMetrics() {
    return this.monitoring.getSystemMetrics();
  }

  @Get('/circuit-breakers')
  async getCircuitBreakers() {
    return this.monitoring.getCircuitBreakerStates();
  }

  @Get('/rate-limits/stats')
  async getRateLimitStats(@Query('identifier') identifier: string) {
    return this.monitoring.getRateLimitStats(identifier);
  }
}
```

### Alert Configuration

```typescript
// monitoring.service.ts - Alert configuration
const ALERT_CONFIGS = {
  HIGH_ERROR_RATE: {
    threshold: 0.05,        // 5% error rate
    window: 300,            // 5 minutes
    cooldown: 600,          // 10 minutes
    severity: 'high',
    channels: ['email', 'slack'],
  },
  HIGH_CPU_USAGE: {
    threshold: 0.8,         // 80% CPU
    window: 180,            // 3 minutes
    cooldown: 300,          // 5 minutes
    severity: 'medium',
    channels: ['slack'],
  },
  CIRCUIT_BREAKER_OPEN: {
    threshold: 1,           // Any circuit breaker opening
    window: 0,              // Immediate
    cooldown: 1800,         // 30 minutes
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
  },
  PAYMENT_FAILURE_SPIKE: {
    threshold: 0.1,         // 10% payment failures
    window: 600,            // 10 minutes
    cooldown: 1800,         // 30 minutes
    severity: 'high',
    channels: ['email', 'slack'],
  },
};
```

---

**📅 Son Güncelleme:** 2025-01-26
**📊 Durum:** Infrastructure Services Implemented ✅
**⚡ Öncelik:** High
**🎯 Go-Live Hedefi:** 16 hafta içinde production ready
**🔧 Database:** Supabase PostgreSQL + RLS
**🔐 Security:** Row Level Security + Service Role Pattern + Infrastructure Services
**🛠️ Infrastructure:** Structured Logging, Rate Limiting, Circuit Breaker, Monitoring ✅