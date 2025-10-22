import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:coria_app/features/premium/domain/entities/premium_plan.dart';
import 'package:coria_app/features/premium/domain/entities/premium_payment.dart';
import 'package:coria_app/features/premium/domain/entities/premium_subscription.dart';
import 'package:coria_app/features/premium/domain/use_cases/get_premium_plans_use_case.dart';
import 'package:coria_app/features/premium/domain/use_cases/process_premium_payment_use_case.dart';
import 'package:coria_app/features/premium/domain/use_cases/get_premium_subscription_use_case.dart';
import 'package:coria_app/features/premium/domain/services/premium_subscription_service.dart';
import 'package:coria_app/features/premium/data/services/premium_payment_service.dart';
import 'package:coria_app/features/premium/data/repositories/premium_repository_impl.dart';

// Core dependencies
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();
  final supabase = ref.watch(supabaseClientProvider);

  // Add auth token interceptor for all API requests
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // Get current session token
      final session = supabase.auth.currentSession;
      if (session != null) {
        options.headers['Authorization'] = 'Bearer ${session.accessToken}';
      }

      // Add content type
      options.headers['Content-Type'] = 'application/json';

      return handler.next(options);
    },
    onError: (error, handler) async {
      // Handle 401 unauthorized errors
      if (error.response?.statusCode == 401) {
        // Try to refresh token
        try {
          await supabase.auth.refreshSession();
          final newSession = supabase.auth.currentSession;

          if (newSession != null) {
            // Retry request with new token
            final opts = error.requestOptions;
            opts.headers['Authorization'] = 'Bearer ${newSession.accessToken}';

            final cloneReq = await dio.request(
              opts.path,
              options: Options(
                method: opts.method,
                headers: opts.headers,
              ),
              data: opts.data,
              queryParameters: opts.queryParameters,
            );

            return handler.resolve(cloneReq);
          }
        } catch (e) {
          // Token refresh failed, user needs to re-login
          debugPrint('Token refresh failed: $e');
        }
      }

      return handler.next(error);
    },
  ));

  return dio;
});

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final premiumSubscriptionServiceProvider =
    Provider<PremiumSubscriptionService>((ref) {
  return PremiumSubscriptionService(
      supabase: ref.watch(supabaseClientProvider));
});

final premiumPaymentServiceProvider = Provider<PremiumPaymentService>((ref) {
  return PremiumPaymentService(ref.watch(dioProvider));
});

final premiumRepositoryProvider = Provider<PremiumRepositoryImpl>((ref) {
  return PremiumRepositoryImpl(ref.watch(premiumPaymentServiceProvider));
});

// Use cases
final getPremiumPlansUseCaseProvider = Provider<GetPremiumPlansUseCase>((ref) {
  return GetPremiumPlansUseCase(ref.watch(premiumRepositoryProvider));
});

final processPremiumPaymentUseCaseProvider =
    Provider<ProcessPremiumPaymentUseCase>((ref) {
  return ProcessPremiumPaymentUseCase(ref.watch(premiumRepositoryProvider));
});

final confirmPremiumPaymentUseCaseProvider =
    Provider<ConfirmPremiumPaymentUseCase>((ref) {
  return ConfirmPremiumPaymentUseCase(ref.watch(premiumRepositoryProvider));
});

final checkPaymentStatusUseCaseProvider =
    Provider<CheckPaymentStatusUseCase>((ref) {
  return CheckPaymentStatusUseCase(ref.watch(premiumRepositoryProvider));
});

final getPremiumSubscriptionUseCaseProvider =
    Provider<GetPremiumSubscriptionUseCase>((ref) {
  return GetPremiumSubscriptionUseCase(ref.watch(premiumRepositoryProvider));
});

final checkWalletBalanceUseCaseProvider =
    Provider<CheckWalletBalanceUseCase>((ref) {
  return CheckWalletBalanceUseCase(ref.watch(premiumRepositoryProvider));
});

// State providers
final premiumPlansProvider = FutureProvider<List<PremiumPlan>>((ref) async {
  final useCase = ref.watch(getPremiumPlansUseCaseProvider);
  final result = await useCase();

  return result.fold(
    (failure) => throw Exception(failure.message),
    (plans) => plans,
  );
});

final selectedPlanProvider = StateProvider<PremiumPlan?>((ref) => null);

final walletBalanceProvider =
    FutureProvider.family<double, String>((ref, walletAddress) async {
  if (walletAddress.isEmpty) return 0.0;

  final useCase = ref.watch(checkWalletBalanceUseCaseProvider);
  final result = await useCase(walletAddress);

  return result.fold(
    (failure) => throw Exception(failure.message),
    (balance) => balance,
  );
});

final currentSubscriptionProvider =
    FutureProvider.family<PremiumSubscription?, String>((ref, userId) async {
  if (userId.isEmpty) return null;

  final useCase = ref.watch(getPremiumSubscriptionUseCaseProvider);
  final result = await useCase(userId);

  return result.fold(
    (failure) => throw Exception(failure.message),
    (subscription) => subscription,
  );
});

// Payment flow state management
class PremiumPaymentNotifier
    extends StateNotifier<AsyncValue<PremiumPayment?>> {
  final ProcessPremiumPaymentUseCase _processPaymentUseCase;
  final ConfirmPremiumPaymentUseCase _confirmPaymentUseCase;
  final CheckPaymentStatusUseCase _checkPaymentStatusUseCase;

  PremiumPaymentNotifier(
    this._processPaymentUseCase,
    this._confirmPaymentUseCase,
    this._checkPaymentStatusUseCase,
  ) : super(const AsyncValue.data(null));

  Future<void> createPayment(PremiumPaymentRequest request) async {
    state = const AsyncValue.loading();

    final result = await _processPaymentUseCase(request);

    state = result.fold(
      (failure) => AsyncValue.error(failure, StackTrace.current),
      (payment) => AsyncValue.data(payment),
    );
  }

  Future<void> confirmPayment(String paymentId) async {
    final currentPayment = state.valueOrNull;
    if (currentPayment == null) return;

    state = AsyncValue.data(currentPayment.copyWith(
      status: PremiumPaymentStatus.confirming,
    ));

    final result = await _confirmPaymentUseCase(paymentId);

    state = result.fold(
      (failure) => AsyncValue.error(failure, StackTrace.current),
      (payment) => AsyncValue.data(payment),
    );

    // Start monitoring payment status
    if (state.hasValue && state.value!.isConfirming) {
      _startPaymentMonitoring(paymentId);
    }
  }

  Future<void> checkPaymentStatus(String paymentId) async {
    final result = await _checkPaymentStatusUseCase(paymentId);

    state = result.fold(
      (failure) => AsyncValue.error(failure, StackTrace.current),
      (payment) => AsyncValue.data(payment),
    );
  }

  void _startPaymentMonitoring(String paymentId) {
    // Monitor payment every 3 seconds for up to 5 minutes
    const monitoringDuration = Duration(minutes: 5);
    const checkInterval = Duration(seconds: 3);

    final startTime = DateTime.now();

    void checkStatus() async {
      if (DateTime.now().difference(startTime) > monitoringDuration) {
        // Timeout - mark payment as expired
        final currentPayment = state.valueOrNull;
        if (currentPayment != null && currentPayment.isConfirming) {
          state = AsyncValue.data(currentPayment.copyWith(
            status: PremiumPaymentStatus.expired,
            errorMessage: 'Ödeme zaman aşımına uğradı',
          ));
        }
        return;
      }

      await checkPaymentStatus(paymentId);

      final payment = state.valueOrNull;
      if (payment != null && (payment.isConfirmed || payment.isFailed)) {
        // Payment completed, stop monitoring
        return;
      }

      // Continue monitoring
      Future.delayed(checkInterval, checkStatus);
    }

    checkStatus();
  }

  void resetPayment() {
    state = const AsyncValue.data(null);
  }
}

final premiumPaymentProvider =
    StateNotifierProvider<PremiumPaymentNotifier, AsyncValue<PremiumPayment?>>(
        (ref) {
  return PremiumPaymentNotifier(
    ref.watch(processPremiumPaymentUseCaseProvider),
    ref.watch(confirmPremiumPaymentUseCaseProvider),
    ref.watch(checkPaymentStatusUseCaseProvider),
  );
});

// Helper providers for UI state
final canAffordPlanProvider =
    Provider.family<bool, (String walletAddress, PremiumPlan plan)>(
        (ref, params) {
  final (walletAddress, plan) = params;
  final balanceAsync = ref.watch(walletBalanceProvider(walletAddress));

  return balanceAsync.when(
    data: (balance) => balance >= plan.priceSOL,
    loading: () => false,
    error: (_, __) => false,
  );
});

final paymentButtonTextProvider = Provider<String>((ref) {
  final paymentAsync = ref.watch(premiumPaymentProvider);

  return paymentAsync.when(
    data: (payment) {
      if (payment == null) return 'Pay with SOL';

      switch (payment.status) {
        case PremiumPaymentStatus.pending:
          return 'Ödeme Onayı Bekliyor';
        case PremiumPaymentStatus.confirming:
          return 'Teyit Bekleniyor';
        case PremiumPaymentStatus.confirmed:
          return 'Ödeme Tamamlandı';
        case PremiumPaymentStatus.failed:
          return 'Tekrar Dene';
        case PremiumPaymentStatus.expired:
          return 'Tekrar Dene';
      }
    },
    loading: () => 'İşleniyor...',
    error: (_, __) => 'Hata - Tekrar Dene',
  );
});

// Grace period providers
final currentUserIdProvider = Provider<String>((ref) {
  return Supabase.instance.client.auth.currentUser?.id ?? '';
});

final gracePeriodInfoProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, userId) async {
  if (userId.isEmpty) {
    return {
      'is_in_grace': false,
      'grace_period_end': null,
      'days_remaining': 0,
      'retry_count': 0,
      'has_access': false,
    };
  }

  final service = ref.watch(premiumSubscriptionServiceProvider);
  return await service.getGracePeriodInfo(userId: userId);
});

// Trial period providers
final trialInfoProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, userId) async {
  if (userId.isEmpty) {
    return {
      'is_in_trial': false,
      'trial_start': null,
      'trial_end': null,
      'days_remaining': 0,
      'trial_used': false,
      'has_access': false,
    };
  }

  final service = ref.watch(premiumSubscriptionServiceProvider);
  return await service.getTrialInfo(userId: userId);
});
