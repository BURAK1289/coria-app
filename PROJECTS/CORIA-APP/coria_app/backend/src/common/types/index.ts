// Common types for the CORIA backend

export enum WalletType {
  CUSTODIAL = 'custodial',
  EXTERNAL = 'external',
}

export enum PaymentKind {
  DONATION = 'donation',
  PREMIUM = 'premium',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PremiumStatus {
  NONE = 'none',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export enum SolanaNetwork {
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  MAINNET_BETA = 'mainnet-beta',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SolanaWallet {
  id: string;
  userId: string;
  publicKey: string;
  type: WalletType;
  provider?: string;
  isPrimary: boolean;
  name?: string;
  balanceLamports: number;
  lastBalanceUpdate: Date;
  kmsKeyId?: string;
  derivationPath?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SolanaPayment {
  id: string;
  userId: string;
  walletId: string;
  kind: PaymentKind;
  amountLamports: number;
  amountSol: number;
  txSignature?: string;
  blockhash?: string;
  slot?: number;
  status: PaymentStatus;
  destinationAddress: string;
  confirmationAttempts: number;
  lastConfirmationCheck?: Date;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  confirmedAt?: Date;
  failedAt?: Date;
}

export interface UserProfile {
  id: string;
  email?: string;
  premiumStatus: PremiumStatus;
  premiumExpiresAt?: Date;
  premiumActivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletActivity {
  id: string;
  userId: string;
  walletId?: string;
  activityType: string;
  description?: string;
  txSignature?: string;
  amountLamports?: number;
  metadata: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

// RPC Function Return Types
export interface IdempotentPaymentResult {
  success: boolean;
  cached: boolean;
  paymentId: string;
  data: any;
  error?: string;
  message?: string;
}

export interface PaymentConfirmationResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  txSignature: string;
  confirmedAt: Date;
  amountLamports: number;
  amountSol: number;
  kind: PaymentKind;
  premiumDurationMonths?: number;
  premiumActivated?: boolean;
  error?: string;
  message?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  paymentId: string;
  userId: string;
  walletId: string;
  walletPublicKey: string;
  walletType: WalletType;
  walletProvider?: string;
  kind: PaymentKind;
  status: PaymentStatus;
  amountLamports: number;
  amountSol: number;
  destinationAddress: string;
  txSignature?: string;
  blockhash?: string;
  slot?: number;
  createdAt: Date;
  confirmedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  confirmationAttempts: number;
  lastConfirmationCheck?: Date;
  metadata: Record<string, any>;
  premiumStatus?: PremiumStatus;
  premiumExpiresAt?: Date;
  error?: string;
  message?: string;
}

export interface UserPaymentStats {
  success: boolean;
  userId: string;
  paymentStats: {
    totalPayments: number;
    confirmedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalAmountSol: number;
    donationAmountSol: number;
    premiumAmountSol: number;
    periodDays: number;
    periodStart: Date;
  };
  premiumInfo: {
    premiumStatus: PremiumStatus;
    premiumExpiresAt?: Date;
    premiumActivatedAt?: Date;
    isPremiumActive: boolean;
  };
}