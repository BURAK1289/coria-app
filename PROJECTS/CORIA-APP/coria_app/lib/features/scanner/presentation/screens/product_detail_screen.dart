import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:coria_app/l10n/generated/app_localizations.dart';
import 'package:coria_app/core/theme/app_colors.dart';
import '../../../../core/services/ai_service.dart' as ai;
import 'package:coria_app/core/services/ai_monitoring_service.dart';
import 'package:coria_app/features/chat/presentation/providers/ai_chat_provider.dart';
import 'package:coria_app/features/profile/presentation/providers/consumed_products_provider.dart';
import 'package:coria_app/features/settings/presentation/providers/language_provider.dart';
import 'package:coria_app/features/scanner/domain/entities/product_info.dart';
import 'package:coria_app/features/scanner/application/providers/scan_history_provider.dart';
import 'package:coria_app/features/analysis/domain/entities/product_analysis.dart';
import 'package:coria_app/features/analysis/data/services/product_analysis_service.dart';
import 'package:coria_app/features/analysis/data/services/user_preference_service.dart';
import 'package:coria_app/features/scanner/presentation/widgets/product_analysis_card.dart';
import 'package:coria_app/features/pantry/presentation/providers/pantry_provider.dart';
import 'package:coria_app/features/preferences/presentation/providers/preferences_provider.dart';
import 'package:coria_app/features/esg/data/services/esg_service.dart';
import 'package:coria_app/features/esg/domain/entities/esg_score.dart';
import 'package:coria_app/features/esg/domain/entities/brand_certification.dart';
import 'package:coria_app/features/esg/presentation/widgets/esg_score_indicator.dart';
import 'package:coria_app/features/esg/presentation/widgets/certification_badges.dart';
import 'package:coria_app/core/utils/logger.dart';

/// Enhanced product detail screen with AI analysis
class ProductDetailScreen extends ConsumerStatefulWidget {
  static final logger = Logger('ProductDetailScreen');
  final String barcode;
  final ProductInfo? initialProduct;

  const ProductDetailScreen({
    super.key,
    required this.barcode,
    this.initialProduct,
  }) : assert(barcode.isNotEmpty, 'Barcode cannot be empty');

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  ai.VeganAnalysis? _aiAnalysis;
  ProductAnalysis? _comprehensiveAnalysis;
  // String? _detailedAIAnalysis; // TODO: Display this in the UI when needed
  bool _isAnalyzing = false;
  Map<String, dynamic>? _boycottStatus;
  
  // ESG verileri
  final _esgService = ESGService();
  ESGScore? _esgScore;
  List<BrandCertification> _certifications = [];
  bool _isLoadingESG = false;

  @override
  void initState() {
    super.initState();
    final ProductInfo? initialProduct = widget.initialProduct;
    if (initialProduct != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _performComprehensiveAnalysis(initialProduct);
        _loadESGData(initialProduct);
      });
    }
  }
  
  /// ESG verilerini yükle
  Future<void> _loadESGData(ProductInfo product) async {
    if (product.brand.isEmpty) return;
    
    setState(() {
      _isLoadingESG = true;
    });
    
    try {
      // ESG skorunu getir
      final esgScore = await _esgService.getESGScore(product.brand);
      if (esgScore != null) {
        setState(() {
          _esgScore = esgScore;
        });
        
        // Sertifikaları getir
        final certs = await _esgService.getBrandCertifications(esgScore.brandId);
        setState(() {
          _certifications = certs;
        });
      }
    } catch (e) {
      ProductDetailScreen.logger.debug('Error loading ESG data: $e');
    } finally {
      setState(() {
        _isLoadingESG = false;
      });
    }
  }

  Future<void> _performComprehensiveAnalysis(ProductInfo product) async {
    if (_isAnalyzing) return;
    
    setState(() {
      _isAnalyzing = true;
    });

    try {
      // Check boycott status if enabled
      final preferences = ref.read(userPreferencesProvider).preferences;
      if (preferences?.boycottEnabled == true) {
        final notifier = ref.read(userPreferencesProvider.notifier);
        
        // Check product boycott by barcode
        final boycottResult = await notifier.checkProductBoycott(product.barcode);
        
        // If no barcode match, check brand
        final String? brandName = product.brand;
        if (boycottResult == null && brandName != null && brandName.isNotEmpty) {
          final Map<String, dynamic>? brandResult = await notifier.checkBrandBoycott(brandName);
          if (brandResult != null) {
            setState(() {
              _boycottStatus = brandResult;
            });
          }
        } else if (boycottResult != null) {
          setState(() {
            _boycottStatus = boycottResult;
          });
        }
        
        // Show alert if product is boycotted and alert on scan is enabled
        if (_boycottStatus != null && preferences?.alertOnScan == true && mounted) {
          _showBoycottAlert();
        }
      }
      
      // Perform comprehensive analysis
      final analysisService = ref.read(productAnalysisServiceProvider);
      final comprehensiveAnalysis = await analysisService.analyzeProduct(
        barcode: product.barcode,
        productName: product.name,
        ingredients: product.ingredients.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
        brand: product.brand,
        categories: product.categories.join(', '),
      );
      
      // Get AI service, monitoring and language
      final aiService = ref.read(ai.aiServiceProvider);
      final monitoring = ref.read(aiMonitoringProvider);
      final languageNotifier = ref.read(languageProvider.notifier);
      final locale = languageNotifier.getLocaleCode();
      
      // Get detailed product analysis with smart fallback (includes vegan analysis)
      // TODO: Use AI response for detailed analysis display when needed
      await aiService.analyzeProductWithFallback(
        productName: product.name,
        brand: product.brand,
        categories: product.categories.join(', '),
        ingredients: product.ingredients.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
        nutritionalInfo: product.nutritionalInfo,
        allergens: product.allergens,
        additives: product.additives,
        isVegan: product.isVegan,
        locale: locale, // Pass current locale
        monitoring: monitoring, // Pass monitoring service for tracking
      );
      
      // final detailedAnalysis = aiResponse.content; // TODO: Use this for detailed display
      
      // Parse vegan analysis from detailed response (no separate call needed)
      ai.VeganAnalysis? aiAnalysis;
      try {
        // Extract vegan info from comprehensive analysis
        final veganStatus = comprehensiveAnalysis.veganAnalysis.status;
        aiAnalysis = ai.VeganAnalysis(
          isVegan: veganStatus == VeganStatus.vegan,
          confidence: (comprehensiveAnalysis.veganAnalysis.confidenceScore * 100).toInt(),
          nonVeganIngredients: comprehensiveAnalysis.veganAnalysis.nonVeganIngredients,
          explanation: comprehensiveAnalysis.veganAnalysis.explanation,
          alternatives: [], // Will be populated from alternatives list
        );
      } catch (e) {
        // Fallback to null if parsing fails
        aiAnalysis = null;
      }
      
      if (mounted) {
        setState(() {
          _comprehensiveAnalysis = comprehensiveAnalysis;
          _aiAnalysis = aiAnalysis;
          // _detailedAIAnalysis = detailedAnalysis; // TODO: Display this in the UI when needed
        });

        // Save to scan history with AI analysis
        final scanHistoryService = ref.read(scanHistoryServiceProvider);
        await scanHistoryService.saveScanToHistory(
          product: product,
          aiAnalysis: comprehensiveAnalysis.veganAnalysis.explanation,
        );
        
        // Track user interaction
        final prefService = ref.read(userPreferenceServiceProvider);
        await prefService.trackIngredientPreference(
          ingredient: product.ingredients.split(',').first.trim(),
          preferenceType: comprehensiveAnalysis.veganAnalysis.status == VeganStatus.vegan ? 'liked' : 'disliked',
        );

        // Auto-send analysis to AI Chat
        final chatNotifier = ref.read(aiChatProvider.notifier);
        final l10n = AppLocalizations.of(context)!;

        chatNotifier.addMessage(
          AIChatMessage(
            content: "${AppLocalizations.of(context)!.productScannedMessage(product.name)}\n\n"
                    "${AppLocalizations.of(context)!.veganStatus} ${comprehensiveAnalysis.veganAnalysis.status == VeganStatus.vegan ? AppLocalizations.of(context)!.vegan : AppLocalizations.of(context)!.notVegan}\n"
                    "${AppLocalizations.of(context)!.sustainability} ${comprehensiveAnalysis.sustainabilityScore.grade} (${comprehensiveAnalysis.sustainabilityScore.totalScore.toStringAsFixed(0)}/100)\n"
                    "${AppLocalizations.of(context)!.carbonFootprint} ${comprehensiveAnalysis.sustainabilityScore.carbonFootprint.toStringAsFixed(1)} kg CO₂e\n\n"
                    "${comprehensiveAnalysis.veganAnalysis.explanation}\n\n"
                    "${comprehensiveAnalysis.alternatives.isNotEmpty ? '${AppLocalizations.of(context)!.alternatives} ${comprehensiveAnalysis.alternatives.map((a) => a.name).join(', ')}' : ''}\n\n"
                    "${AppLocalizations.of(context)!.howCanIHelpYou}",
            isUser: false,
            timestamp: DateTime.now(),
          ),
        );
      }
    } catch (e) {
      // Silent error - optional AI analysis
      if (mounted) {
        setState(() {
          _aiAnalysis = null;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
        });
      }
    }
  }

  void _showBoycottAlert() {
    if (!mounted) return;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
              const SizedBox(width: 8),
              Text(AppLocalizations.of(context)!.boycottWarning),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _boycottStatus?['brand_name'] ?? AppLocalizations.of(context)!.boycottProduct,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                _boycottStatus?['reason'] ?? AppLocalizations.of(context)!.bdsMovementListed,
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.orange[700], size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context)!.severityLevel(_boycottStatus?['severity_level'] ?? 5),
                        style: TextStyle(fontSize: 13, color: Colors.orange[700]),
                      ),
                    ),
                  ],
                ),
              ),
              if (_boycottStatus?['alternatives'] != null && 
                  (_boycottStatus!['alternatives'] as List).isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  AppLocalizations.of(context)!.alternativeRecommendations,
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 4),
                ...(_boycottStatus!['alternatives'] as List).take(3).map((alt) => 
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 16),
                        const SizedBox(width: 4),
                        Expanded(child: Text(alt.toString(), style: TextStyle(fontSize: 13))),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(AppLocalizations.of(context)!.understood),
            ),
            if (_boycottStatus?['alternatives'] != null)
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  // Navigate to alternatives screen or search
                  context.push('/search?alternatives=true');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                ),
                child: Text(AppLocalizations.of(context)!.showAlternatives),
              ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.initialProduct;

    if (product == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.productDetail),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.productInfoNotFound,
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: Text(AppLocalizations.of(context)!.goBack),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(product.name),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(AppLocalizations.of(context)!.shareFeatureComingSoon),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.kitchen_outlined),
            tooltip: AppLocalizations.of(context)!.addToPantryTooltip,
            onPressed: () {
              _showAddToPantryDialog(context, product);
            },
          ),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(AppLocalizations.of(context)!.favoritesFeatureComingSoon),
                ),
              );
            },
            icon: const Icon(Icons.favorite_border),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Product image placeholder
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.shopping_basket,
                        size: 64,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      product.name,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (product.brand.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        product.brand,
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      AppLocalizations.of(context)!.barcodeLabel(product.barcode),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // ESG Skoru - Marka sürdürülebilirlik bilgisi
            if (_esgScore != null && !_isLoadingESG) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ESGScoreIndicator(
                  esgScore: _esgScore,
                  size: ScoreSize.detailed,
                  onTap: () {
                    // TODO: Marka ESG profil sayfasına git
                  },
                ),
              ),
            ],
            
            // Sertifikalar
            if (_certifications.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.certifications,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    CertificationBadges(
                      certifications: _certifications,
                      showAll: false,
                      maxDisplay: 4,
                      onTap: () {
                        // Tüm sertifikaları göster
                      },
                    ),
                  ],
                ),
              ),
            ],
            
            // Comprehensive Analysis Card (Top Priority)
            if (_comprehensiveAnalysis != null && !_isAnalyzing) ...[
              ProductAnalysisCard(
                analysis: _comprehensiveAnalysis!,
                onViewAlternatives: () {
                  // Navigate to alternatives screen or show bottom sheet
                  _showAlternativesBottomSheet(context);
                },
                onChatWithAI: () => context.push('/ai-chat'),
              ),
              const SizedBox(height: 16),
            ] else if (_aiAnalysis != null || _isAnalyzing) ...[
              Card(
                elevation: 8,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: _aiAnalysis?.isVegan == true 
                          ? [Colors.green[50]!, Colors.green[100]!]
                          : _aiAnalysis?.isVegan == false
                              ? [Colors.red[50]!, Colors.red[100]!]
                              : [Colors.blue[50]!, Colors.blue[100]!],
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: _isAnalyzing
                        ? Column(
                            children: [
                              CircularProgressIndicator(color: AppColors.primaryGreen),
                              const SizedBox(height: 12),
                              Text(
                                AppLocalizations.of(context)!.coriaAIAnalyzing,
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header
                              Row(
                                children: [
                                  Icon(
                                    _aiAnalysis!.isVegan ? Icons.eco : Icons.warning,
                                    color: _aiAnalysis!.isVegan ? Colors.green[700] : Colors.red[700],
                                    size: 32,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          AppLocalizations.of(context)!.coriaAIAnalysis,
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.grey[800],
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            Text(
                                              _aiAnalysis!.isVegan ? AppLocalizations.of(context)!.veganLabel : AppLocalizations.of(context)!.notVeganLabel,
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w900,
                                                color: _aiAnalysis!.isVegan ? Colors.green[700] : Colors.red[700],
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: _aiAnalysis!.isVegan ? Colors.green[200] : Colors.red[200],
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Text(
                                                AppLocalizations.of(context)!.confidenceLabel(_aiAnalysis!.confidence),
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: _aiAnalysis!.isVegan ? Colors.green[800] : Colors.red[800],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              
                              const SizedBox(height: 16),
                              
                              // Non-vegan ingredients warning
                              if (_aiAnalysis!.nonVeganIngredients.isNotEmpty) ...[
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.red[100],
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.red[300]!),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(Icons.error, color: Colors.red[700], size: 20),
                                          const SizedBox(width: 8),
                                          Text(
                                            AppLocalizations.of(context)!.animalIngredientsHeader,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.red[800],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        _aiAnalysis!.nonVeganIngredients.join(', '),
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.red[700],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                              ],

                              // Short explanation
                              Text(
                                AppLocalizations.of(context)!.whyExplanationHeader,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[800],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _aiAnalysis!.explanation.length > 200
                                    ? '${_aiAnalysis!.explanation.substring(0, 200)}...'
                                    : _aiAnalysis!.explanation,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey[700],
                                  height: 1.3,
                                ),
                              ),
                              
                              // Chat button
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () => context.push('/ai-chat'),
                                  icon: const Icon(Icons.smart_toy, size: 20),
                              label: Text(AppLocalizations.of(context)!.chatWithAI),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryGreen,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Basic Vegan status (fallback)
            if (_aiAnalysis == null && !_isAnalyzing) ...[
              Card(
                child: ListTile(
                  leading: Icon(
                    product.isVegan == true ? Icons.check_circle : Icons.cancel,
                    color: product.isVegan == true ? AppColors.vegan : AppColors.error,
                    size: 40,
                  ),
                  title: Text(
                    product.isVegan == true ? AppLocalizations.of(context)!.veganBasic : AppLocalizations.of(context)!.notVeganBasic,
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    AppLocalizations.of(context)!.veganScoreDetailed(product.veganScore.toStringAsFixed(0)),
                  ),
                ),
              ),
            ],

            // Nutritional Information Card - Only show if no comprehensive analysis
            if (product.nutritionalInfo.isNotEmpty && _comprehensiveAnalysis == null) ...[
              const SizedBox(height: 16),
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.restaurant_menu, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(
                            AppLocalizations.of(context)!.nutritionalValues100g,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // NutriScore Badge
                      if (product.nutriScore != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getNutriScoreColor(product.nutriScore!),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                AppLocalizations.of(context)!.nutriScoreLabel,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                product.nutriScore!,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      // Nutritional values
                      _buildNutritionRow(AppLocalizations.of(context)!.energy, 
                        '${product.nutritionalInfo['energy_kcal']?.toStringAsFixed(0) ?? '-'} kcal',
                        Icons.local_fire_department, Colors.orange),
                      _buildNutritionRow(AppLocalizations.of(context)!.protein,
                        '${product.nutritionalInfo['proteins']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.fitness_center, Colors.blue),
                      _buildNutritionRow(AppLocalizations.of(context)!.carbohydrates,
                        '${product.nutritionalInfo['carbohydrates']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.grain, Colors.brown),
                      _buildNutritionRow(AppLocalizations.of(context)!.sugar,
                        '${product.nutritionalInfo['sugars']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.cake, Colors.pink),
                      _buildNutritionRow(AppLocalizations.of(context)!.fat,
                        '${product.nutritionalInfo['fat']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.opacity, Colors.amber),
                      _buildNutritionRow(AppLocalizations.of(context)!.saturatedFat,
                        '${product.nutritionalInfo['saturated_fat']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.warning_amber, Colors.orange),
                      _buildNutritionRow(AppLocalizations.of(context)!.fiber,
                        '${product.nutritionalInfo['fiber']?.toStringAsFixed(1) ?? '-'} g',
                        Icons.eco, Colors.green),
                      _buildNutritionRow(AppLocalizations.of(context)!.salt,
                        '${product.nutritionalInfo['salt']?.toStringAsFixed(2) ?? '-'} g',
                        Icons.grain_outlined, Colors.grey),
                    ],
                  ),
                ),
              ),
            ],

            // Categories with better UI
            if (product.categories.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.category, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(
                            AppLocalizations.of(context)!.categories,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: product.categories
                            .map((category) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                category,
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ))
                            .toList(),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            // Ingredients with better formatting
            if (product.ingredients.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.list_alt, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(
                            AppLocalizations.of(context)!.ingredients,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Text(
                          product.ingredients,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.5,
                          ),
                        ),
                      ),
                      // Additives if present
                      if (product.additives != null && product.additives!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          AppLocalizations.of(context)!.additives(product.additives!.length),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: product.additives!
                              .map((additive) => Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.blue[50],
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.blue[200]!),
                                ),
                                child: Text(
                                  additive.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.blue[800],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ))
                              .toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Allergens with better visibility
            if (product.allergens.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                elevation: 3,
                color: Colors.orange[50],
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange[300]!, width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.warning_rounded, color: Colors.orange[700], size: 28),
                            const SizedBox(width: 8),
                            Text(
                              AppLocalizations.of(context)!.allergenWarning,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.orange,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: product.allergens
                              .map((allergen) => Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.orange[100],
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.orange[400]!),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.error_outline, size: 16, color: Colors.orange[800]),
                                    const SizedBox(width: 4),
                                    Text(
                                      allergen.toUpperCase(),
                                      style: TextStyle(
                                        color: Colors.orange[900],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ))
                              .toList(),
                        ),
                        if (product.traces != null && product.traces!.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.yellow[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.yellow[700]!),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.info_outline, size: 20, color: Colors.yellow[800]),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    AppLocalizations.of(context)!.mayContainTraces(product.traces!),
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.yellow[900],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],

            // Additional Product Information
            const SizedBox(height: 16),
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text(
                          AppLocalizations.of(context)!.additionalInformation,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // EcoScore
                    if (product.ecoScore != null) ...[
                      _buildInfoRow(
                        AppLocalizations.of(context)!.ecoScore,
                        product.ecoScore!,
                        Icons.eco,
                        _getEcoScoreColor(product.ecoScore!),
                      ),
                    ],
                    // Nova Group
                    if (product.novaGroup != null) ...[
                      _buildInfoRow(
                        AppLocalizations.of(context)!.novaGroup,
                        AppLocalizations.of(context)!.groupNumber(product.novaGroup!),
                        Icons.science,
                        _getNovaGroupColor(product.novaGroup!),
                      ),
                    ],
                    // Packaging
                    if (product.packagingInfo.isNotEmpty) ...[
                      _buildInfoRow(
                        AppLocalizations.of(context)!.packaging,
                        product.packagingInfo,
                        Icons.inventory_2,
                        Colors.brown,
                      ),
                    ],
                    // Country of Origin
                    if (product.countryOfOrigin.isNotEmpty) ...[
                      _buildInfoRow(
                        AppLocalizations.of(context)!.countryOfOrigin,
                        product.countryOfOrigin,
                        Icons.public,
                        Colors.blue,
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Consume/Won't Consume Buttons
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppLocalizations.of(context)!.willYouConsumeQuestion,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                ref.read(consumedProductsProvider.notifier)
                                    .addConsumedProduct(product);
                                
                                // Track user preference
                                final prefService = ref.read(userPreferenceServiceProvider);
                                await prefService.trackProductConsumption(
                                  barcode: product.barcode,
                                  productName: product.name,
                                  wouldBuyAgain: true,
                                );
                                
                                if (!context.mounted) return;
                                
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(AppLocalizations.of(context)!.addedToConsumed),
                                    backgroundColor: Colors.green,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                                
                                // Go back after adding
                                await Future.delayed(const Duration(seconds: 1));
                                if (context.mounted) {
                                  if (!mounted) return;

                                  Navigator.of(context).pop();
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 12,
                                ),
                              ),
                              icon: Icon(Icons.check_circle),
                              label: Text(
                                AppLocalizations.of(context)!.willConsume,
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                // Track rejection
                                final prefService = ref.read(userPreferenceServiceProvider);
                                await prefService.trackProductRejection(
                                  barcode: product.barcode,
                                  productName: product.name,
                                  reason: 'User chose not to consume',
                                );
                                
                                if (!context.mounted) return;
                                
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(AppLocalizations.of(context)!.remainInRecentScans),
                                    backgroundColor: Colors.orange,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                                
                                await Future.delayed(const Duration(seconds: 1));
                                if (context.mounted) {
                                  if (!mounted) return;

                                  Navigator.of(context).pop();
                                }
                              },
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: BorderSide(color: Colors.red, width: 2),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 12,
                                ),
                              ),
                              icon: Icon(Icons.cancel),
                              label: Text(
                                AppLocalizations.of(context)!.wontConsume,
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Show if already consumed
                      Consumer(
                        builder: (context, ref, child) {
                          final isConsumed = ref.read(consumedProductsProvider.notifier)
                              .isConsumed(product.barcode);
                          
                          if (isConsumed) {
                            return Container(
                              padding: EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.green[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.green),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.info_outline, color: Colors.green[700], size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    AppLocalizations.of(context)!.alreadyInConsumedProducts,
                                    style: TextStyle(color: Colors.green[700]),
                                  ),
                                ],
                              ),
                            );
                          }
                          return SizedBox.shrink();
                        },
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildNutritionRow(String label, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getNutriScoreColor(String score) {
    switch (score.toUpperCase()) {
      case 'A': return Colors.green[700]!;
      case 'B': return Colors.lightGreen[600]!;
      case 'C': return Colors.yellow[700]!;
      case 'D': return Colors.orange[700]!;
      case 'E': return Colors.red[700]!;
      default: return Colors.grey[600]!;
    }
  }

  Color _getEcoScoreColor(String score) {
    switch (score.toUpperCase()) {
      case 'A': return Colors.green[700]!;
      case 'B': return Colors.lightGreen[600]!;
      case 'C': return Colors.yellow[700]!;
      case 'D': return Colors.orange[700]!;
      case 'E': return Colors.red[700]!;
      default: return Colors.grey[600]!;
    }
  }

  Color _getNovaGroupColor(String group) {
    switch (group) {
      case '1': return Colors.green[700]!;
      case '2': return Colors.lightGreen[600]!;
      case '3': return Colors.orange[700]!;
      case '4': return Colors.red[700]!;
      default: return Colors.grey[600]!;
    }
  }

  void _showAlternativesBottomSheet(BuildContext context) {
    if (_comprehensiveAnalysis == null || _comprehensiveAnalysis!.alternatives.isEmpty) return;
    
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppLocalizations.of(context)!.alternativeProducts,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: _comprehensiveAnalysis!.alternatives.length,
                itemBuilder: (context, index) {
                  final alternative = _comprehensiveAnalysis!.alternatives[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.eco,
                          color: Colors.green[700],
                        ),
                      ),
                      title: Text(
                        alternative.name,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(alternative.brand),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.eco, size: 16, color: Colors.green[700]),
                              const SizedBox(width: 4),
                              Text(AppLocalizations.of(context)!.veganScoreLabel(alternative.veganScore.toStringAsFixed(0))),
                              const SizedBox(width: 12),
                              Icon(Icons.energy_savings_leaf, size: 16, color: Colors.blue[700]),
                              const SizedBox(width: 4),
                                  Text(AppLocalizations.of(context)!.sustainabilityScoreLabel(alternative.sustainabilityScore.round())),
                            ],
                          ),
                          if (alternative.reason.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              alternative.reason,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ],
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            alternative.priceComparison > 0
                                ? '+%${alternative.priceComparison.toStringAsFixed(0)}'
                                : '%${alternative.priceComparison.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: alternative.priceComparison > 0
                                  ? Colors.red
                                  : Colors.green,
                            ),
                          ),
                          Text(
                            AppLocalizations.of(context)!.price,
                            style: TextStyle(fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddToPantryDialog(BuildContext context, ProductInfo product) {
    final TextEditingController quantityController = TextEditingController(text: '1');
    String selectedUnit = 'piece';
    
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(AppLocalizations.of(context)!.addToPantry),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                product.name,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: quantityController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.quantityLabel,
                  border: const OutlineInputBorder(),
                  suffixText: AppLocalizations.of(context)!.pieceUnit,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.pantryAdditionMessage,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(AppLocalizations.of(context)!.cancel),
            ),
            ElevatedButton(
              onPressed: () async {
                final quantity = double.tryParse(quantityController.text) ?? 1;
                
                try {
                  // Add to pantry using PantryService
                  final pantryService = ref.read(pantryServiceProvider);
                  await pantryService.addToPurchaseHistory(
                    productName: product.name,
                    barcode: product.barcode,
                    quantity: quantity,
                    unitType: selectedUnit,
                    price: 0, // Price can be added later
                    currency: AppLocalizations.of(context)!.turkishLira,
                    store: AppLocalizations.of(context)!.manualAddition,
                  );
                  
                  if (dialogContext.mounted) {
                    Navigator.pop(dialogContext);
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(AppLocalizations.of(context)!.addedToPantrySuccess(product.name)),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } catch (e) {
                  if (dialogContext.mounted) {
                    Navigator.pop(dialogContext);
                  }
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(AppLocalizations.of(context)!.errorMessage(e.toString())),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
              ),
              child: Text(AppLocalizations.of(context)!.add),
            ),
          ],
        );
      },
    );
  }
}
