import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import 'package:coria_app/core/theme/app_colors.dart';
import 'package:coria_app/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:coria_app/features/premium/domain/entities/premium_payment.dart';
import 'package:coria_app/features/premium/domain/entities/premium_plan.dart';
import 'package:coria_app/features/premium/domain/services/premium_manager.dart';
import 'package:coria_app/features/premium/presentation/providers/premium_provider.dart';
import 'package:coria_app/features/premium/presentation/providers/premium_providers.dart';
import 'package:coria_app/features/wallet/presentation/providers/wallet_providers.dart' as wallet;

class PremiumPaymentWidget extends ConsumerStatefulWidget {
  final PremiumPlan plan;

  const PremiumPaymentWidget({
    super.key,
    required this.plan,
  });

  @override
  ConsumerState<PremiumPaymentWidget> createState() => _PremiumPaymentWidgetState();
}

class _PremiumPaymentWidgetState extends ConsumerState<PremiumPaymentWidget> {
  bool _isCardPaymentLoading = false;
  Package? _monthlyPackage;
  Package? _yearlyPackage;
  Package? _lifetimePackage;

  @override
  void initState() {
    super.initState();
    _loadRevenueCatPackages();
  }

  Future<void> _loadRevenueCatPackages() async {
    try {
      final offerings = await Purchases.getOfferings();
      if (offerings.current != null && mounted) {
        setState(() {
          _monthlyPackage = offerings.current!.monthly;
          _yearlyPackage = offerings.current!.annual;
          _lifetimePackage = offerings.current!.lifetime;
        });
      }
    } catch (e) {
      debugPrint('Error loading RevenueCat packages: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentWalletAsync = ref.watch(wallet.currentWalletProvider);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: Colors.grey[300] ?? Colors.grey),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(
                Icons.payment,
                color: Theme.of(context).primaryColor,
                size: 24,
              ),
              const SizedBox(width: 8),
              const Text(
                'Ödeme',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Plan details
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.plan.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.plan.durationText,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Tutar:',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      widget.plan.formattedPrice,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Wallet balance check
          currentWalletAsync.when(
            data: (wallet) {
              if (wallet == null) {
                return _buildWalletRequiredCard();
              }

              final balanceAsync = ref.watch(walletBalanceProvider(wallet.address));
              final canAfford = ref.watch(canAffordPlanProvider((wallet.address, widget.plan)));

              return Column(
                children: [
                  // Balance display
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12.0),
                    decoration: BoxDecoration(
                      color: canAfford ? Colors.green[50] : Colors.red[50],
                      borderRadius: BorderRadius.circular(8.0),
                      border: Border.all(
                        color: canAfford
                            ? (Colors.green[200] ?? Colors.green)
                            : (Colors.red[200] ?? Colors.red),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Cüzdan Bakiyesi:',
                          style: TextStyle(fontSize: 14),
                        ),
                        balanceAsync.when(
                          data: (balance) => Text(
                            '${balance.toStringAsFixed(3)} SOL',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: canAfford ? Colors.green[700] : Colors.red[700],
                            ),
                          ),
                          loading: () => const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          error: (_, __) => Text(
                            'Hata',
                            style: TextStyle(color: Colors.red[700]),
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (!canAfford) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Yetersiz bakiye. Lütfen cüzdanınıza SOL ekleyin.',
                      style: TextStyle(
                        color: Colors.red[600],
                        fontSize: 12,
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Payment flow
                  _buildPaymentFlow(wallet.address, canAfford),
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => _buildWalletRequiredCard(),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletRequiredCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: Colors.orange[200] ?? Colors.orange),
      ),
      child: Column(
        children: [
          Icon(
            Icons.account_balance_wallet,
            color: Colors.orange[600],
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            'Cüzdan Bağlantısı Gerekli',
            style: TextStyle(
              color: Colors.orange[800],
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Premium satın almak için önce bir cüzdan bağlamanız gerekiyor.',
            style: TextStyle(
              color: Colors.orange[700],
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () {
              // Navigate to wallet screen
              Navigator.of(context).pushNamed('/wallet');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[600],
              foregroundColor: Colors.white,
            ),
            child: const Text('Cüzdan Bağla'),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentFlow(String walletAddress, bool canAfford) {
    final paymentAsync = ref.watch(premiumPaymentProvider);
    final buttonText = ref.watch(paymentButtonTextProvider);

    return paymentAsync.when(
      data: (payment) {
        if (payment == null) {
          // Initial state - show all payment options
          return Column(
            children: [
              // Primary: Pay with Card
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isCardPaymentLoading ? null : _payWithCard,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isCardPaymentLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.credit_card, size: 24),
                            SizedBox(width: 12),
                            Text(
                              'Pay with Card',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                ),
              ),

              // OR Divider
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Row(
                  children: [
                    Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
                  ],
                ),
              ),

              // Secondary: Pay with SOL
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: canAfford ? () => _initiatePayment(walletAddress) : null,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Theme.of(context).primaryColor,
                    side: BorderSide(
                      color: canAfford
                          ? Theme.of(context).primaryColor
                          : Colors.grey.shade400,
                      width: 2,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.account_balance_wallet,
                        size: 24,
                        color: canAfford
                            ? Theme.of(context).primaryColor
                            : Colors.grey.shade400,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        buttonText,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: canAfford
                              ? Theme.of(context).primaryColor
                              : Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Restore Purchases
              const SizedBox(height: 16),
              TextButton(
                onPressed: _isCardPaymentLoading ? null : _restorePurchases,
                child: Text(
                  'Restore Purchases',
                  style: TextStyle(
                    color: Theme.of(context).primaryColor,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          );
        }

        // Show payment status based on current state
        switch (payment.status) {
          case PremiumPaymentStatus.pending:
            return _buildPendingPayment(payment);

          case PremiumPaymentStatus.confirming:
            return _buildConfirmingPayment(payment);

          case PremiumPaymentStatus.confirmed:
            return _buildSuccessPayment(payment);

          case PremiumPaymentStatus.failed:
            return _buildFailedPayment(payment);

          case PremiumPaymentStatus.expired:
            return _buildExpiredPayment(payment);
        }
      },
      loading: () => _buildPayButton(
        text: 'İşleniyor...',
        enabled: false,
        loading: true,
      ),
      error: (error, _) => _buildErrorState(error.toString()),
    );
  }

  Widget _buildPayButton({
    required String text,
    required bool enabled,
    bool loading = false,
    VoidCallback? onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: enabled && !loading ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
        ),
        child: loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                text,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
      ),
    );
  }

  Widget _buildPendingPayment(PremiumPayment payment) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.blue[200] ?? Colors.blue),
          ),
          child: Column(
            children: [
              Icon(
                Icons.info,
                color: Colors.blue[600],
                size: 32,
              ),
              const SizedBox(height: 8),
              const Text(
                'Ödeme Adresi',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8.0),
                  border: Border.all(color: Colors.grey[300] ?? Colors.grey),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        payment.destinationAddress,
                        style: const TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 12,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: payment.destinationAddress));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Adres kopyalandı')),
                        );
                      },
                      icon: const Icon(Icons.copy, size: 18),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Lütfen ${payment.formattedAmount} gönderin',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _confirmPayment(payment.id),
            child: const Text('Ödemeyi Gönderim, Onayla'),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmingPayment(PremiumPayment payment) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: Colors.orange[200] ?? Colors.orange),
      ),
      child: Column(
        children: [
          const SizedBox(
            width: 32,
            height: 32,
            child: CircularProgressIndicator(),
          ),
          const SizedBox(height: 12),
          const Text(
            'Teyit Bekleniyor',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Ödemeniz blockchain\'de doğrulanıyor. Bu işlem birkaç dakika sürebilir.',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessPayment(PremiumPayment payment) {
    // Log checkout success for analytics funnel (post-frame to avoid build issues)
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final repository = ref.read(analyticsRepositoryProvider);
      final isPremium = await ref.read(premiumStatusProvider.future);

      await repository.logCheckoutSuccess(
        subscriptionId: payment.id,
        planId: widget.plan.id,
        paymentMethod: 'solana',
        metadata: {
          'transaction_signature': payment.transactionSignature ?? 'pending',
          'amount_sol': widget.plan.priceSOL,
          'premium_status': isPremium,
        },
      );
    });

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: Colors.green[200] ?? Colors.green),
      ),
      child: Column(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green[600],
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            'Premium aktif (${widget.plan.formattedExpirationDate})',
            style: TextStyle(
              color: Colors.green[800],
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Ödemeniz başarıyla tamamlandı! Premium özellikler artık aktif.',
            style: TextStyle(
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          if (payment.transactionSignature != null) ...[
            const SizedBox(height: 12),
            Builder(
              builder: (BuildContext context) {
                final String signature = payment.transactionSignature ?? '';
                final String shortSignature = signature.length > 16
                    ? signature.substring(0, 16)
                    : signature;
                return Text(
                  'İşlem ID: $shortSignature...',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontFamily: 'Courier',
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFailedPayment(PremiumPayment payment) {
    // Log checkout fail for analytics funnel (post-frame to avoid build issues)
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final repository = ref.read(analyticsRepositoryProvider);

      await repository.logCheckoutFail(
        reason: payment.status.toString(),
        errorMessage: payment.errorMessage ?? 'Unknown error',
        metadata: {
          'payment_id': payment.id,
          'plan_id': widget.plan.id,
          'transaction_signature': payment.transactionSignature ?? 'none',
        },
      );
    });

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.red[200] ?? Colors.red),
          ),
          child: Column(
            children: [
              Icon(
                Icons.error,
                color: Colors.red[600],
                size: 32,
              ),
              const SizedBox(height: 8),
              const Text(
                'Ödeme Başarısız',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                payment.errorMessage ?? 'Ödeme işlenirken hata oluştu.',
                style: TextStyle(
                  color: Colors.red[700],
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _resetAndRetry(),
            child: const Text('Tekrar Dene'),
          ),
        ),
      ],
    );
  }

  Widget _buildExpiredPayment(PremiumPayment payment) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.orange[50],
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.orange[200] ?? Colors.orange),
          ),
          child: Column(
            children: [
              Icon(
                Icons.access_time,
                color: Colors.orange[600],
                size: 32,
              ),
              const SizedBox(height: 8),
              const Text(
                'Ödeme Süresi Doldu',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Ödeme zaman aşımına uğradı. Lütfen yeni bir ödeme başlatın.',
                style: TextStyle(fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _resetAndRetry(),
            child: const Text('Yeni Ödeme Başlat'),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState(String error) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: Colors.red[200] ?? Colors.red),
          ),
          child: Column(
            children: [
              Icon(
                Icons.error_outline,
                color: Colors.red[600],
                size: 32,
              ),
              const SizedBox(height: 8),
              const Text(
                'Hata Oluştu',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error,
                style: TextStyle(
                  color: Colors.red[700],
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _resetAndRetry(),
            child: const Text('Tekrar Dene'),
          ),
        ),
      ],
    );
  }

  Future<void> _payWithCard() async {
    // Select package based on plan type
    Package? package;
    if (widget.plan.name.toLowerCase().contains('monthly')) {
      package = _monthlyPackage;
    } else if (widget.plan.name.toLowerCase().contains('year')) {
      package = _yearlyPackage;
    } else if (widget.plan.name.toLowerCase().contains('lifetime')) {
      package = _lifetimePackage;
    }

    if (package == null) {
      _showError('Paket yüklenemedi. Lütfen tekrar deneyin.');
      return;
    }

    setState(() => _isCardPaymentLoading = true);

    try {
      final result = await PremiumManager.instance.purchasePremium(package);
      if (result && mounted) {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isCardPaymentLoading = false);
      }
    }
  }

  Future<void> _restorePurchases() async {
    setState(() => _isCardPaymentLoading = true);
    try {
      await PremiumManager.instance.restorePurchases();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Satın alımlar geri yüklendi'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        _showError('Satın alımlar geri yüklenemedi: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() => _isCardPaymentLoading = false);
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  size: 60,
                  color: Colors.green,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Hoş Geldiniz!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Premium üyeliğiniz aktif edildi!',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  ref.invalidate(currentSubscriptionProvider);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Başlayalım'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _initiatePayment(String walletAddress) {
    // Log checkout start for analytics funnel
    final repository = ref.read(analyticsRepositoryProvider);
    repository.logCheckoutStart(
      planId: widget.plan.id,
      paymentMethod: 'solana',
      metadata: {
        'wallet_address': walletAddress,
        'amount_sol': widget.plan.priceSOL,
        'plan_name': widget.plan.name,
      },
    );

    final request = PremiumPaymentRequest(
      planId: widget.plan.id,
      walletAddress: walletAddress,
      amountSOL: widget.plan.priceSOL,
    );

    ref.read(premiumPaymentProvider.notifier).createPayment(request);
  }

  void _confirmPayment(String paymentId) {
    ref.read(premiumPaymentProvider.notifier).confirmPayment(paymentId);
  }

  void _resetAndRetry() {
    ref.read(premiumPaymentProvider.notifier).resetPayment();
  }
}