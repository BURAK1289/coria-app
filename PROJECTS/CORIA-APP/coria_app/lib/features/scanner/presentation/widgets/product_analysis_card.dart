import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:coria_app/l10n/generated/app_localizations.dart';
import 'package:coria_app/core/theme/app_colors.dart';
import 'package:coria_app/features/analysis/domain/entities/product_analysis.dart';

/// Comprehensive Product Analysis Card Widget
class ProductAnalysisCard extends ConsumerWidget {
  final ProductAnalysis analysis;
  final VoidCallback? onViewAlternatives;
  final VoidCallback? onChatWithAI;

  const ProductAnalysisCard({
    super.key,
    required this.analysis,
    this.onViewAlternatives,
    this.onChatWithAI,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: _getGradientColors(),
          ),
        ),
        child: Column(
          children: [
            // Header with overall score
            _buildHeader(context),
            
            // Vegan Analysis Section
            _buildVeganSection(context),
            
            // Sustainability Score Section
            _buildSustainabilitySection(context),
            
            // Environmental Impact
            _buildEnvironmentalSection(context),
            
            // Nutritional Insights
            _buildNutritionalSection(context),
            
            // Alternative Products
            if (analysis.alternatives.isNotEmpty)
              _buildAlternativesSection(context),
            
            // Action Buttons
            _buildActionButtons(context),
          ],
        ),
      ),
    );
  }

  List<Color> _getGradientColors() {
    if (analysis.veganAnalysis.status == VeganStatus.vegan) {
      return [Colors.green[50]!, Colors.green[100]!];
    } else if (analysis.veganAnalysis.status == VeganStatus.nonVegan) {
      return [Colors.red[50]!, Colors.red[100]!];
    } else {
      return [Colors.orange[50]!, Colors.orange[100]!];
    }
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _getHeaderColor().withValues(alpha: 0.1),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Row(
        children: [
          // Score Circle
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: _getHeaderColor().withValues(alpha: 0.3),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    analysis.sustainabilityScore.totalScore.toStringAsFixed(0),
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: _getHeaderColor(),
                    ),
                  ),
                  Text(
                    analysis.sustainabilityScore.grade,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: _getHeaderColor(),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 20),
          // Product Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  analysis.productName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      _getStatusIcon(),
                      color: _getHeaderColor(),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getStatusText(),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: _getHeaderColor(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Güven: %${analysis.confidenceScore.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVeganSection(BuildContext context) {
    final vegan = analysis.veganAnalysis;
    return ExpansionTile(
      initiallyExpanded: true, // Open by default - critical for CORIA mission
      leading: Icon(
        Icons.eco,
        color: _getVeganColor(),
      ),
      title: Text(
        'Vegan Analizi',
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: _getVeganColor(),
        ),
      ),
      subtitle: Text(
        _getVeganStatusText(),
        style: TextStyle(color: _getVeganColor()),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Non-vegan ingredients
              if (vegan.nonVeganIngredients.isNotEmpty) ...[
                _buildWarningBox(
                  'Hayvansal İçerikler',
                  vegan.nonVeganIngredients.join(', '),
                  Colors.red,
                ),
                const SizedBox(height: 12),
              ],
              
              // Uncertain ingredients
              if (vegan.uncertainIngredients.isNotEmpty) ...[
                _buildWarningBox(
                  'Belirsiz İçerikler',
                  vegan.uncertainIngredients.join(', '),
                  Colors.orange,
                ),
                const SizedBox(height: 12),
              ],
              
              // Explanation
              Text(
                vegan.explanation,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              
              // Recommendation
              if (vegan.recommendation.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.lightbulb, color: Colors.blue[700], size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          vegan.recommendation,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.blue[700],
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
      ],
    );
  }

  Widget _buildSustainabilitySection(BuildContext context) {
    final sustainability = analysis.sustainabilityScore;
    return ExpansionTile(
      initiallyExpanded: true, // Open by default - ethical consumption priority
      leading: Icon(
        Icons.energy_savings_leaf,
        color: Colors.green[700],
      ),
      title: const Text(
        'Sürdürülebilirlik Skoru',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Row(
        children: [
          Text('${sustainability.totalScore.toStringAsFixed(0)}/100'),
          const SizedBox(width: 8),
          Text(
            sustainability.gradeEmoji,
            style: const TextStyle(fontSize: 18),
          ),
        ],
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Carbon Footprint
              _buildMetricRow(
                Icons.co2,
                'Karbon Ayak İzi',
                '${sustainability.carbonFootprint.toStringAsFixed(1)} kg CO₂e',
                _getCarbonColor(sustainability.carbonFootprint),
              ),
              
              // Water Usage
              _buildMetricRow(
                Icons.water_drop,
                'Su Kullanımı',
                '${sustainability.waterUsage.toStringAsFixed(0)} L',
                _getWaterColor(sustainability.waterUsage),
              ),
              
              // Land Usage
              _buildMetricRow(
                Icons.landscape,
                'Arazi Kullanımı',
                '${sustainability.landUsage.toStringAsFixed(1)} m²',
                _getLandColor(sustainability.landUsage),
              ),
              
              // Packaging
              _buildMetricRow(
                Icons.inventory_2,
                'Ambalaj',
                sustainability.packaging.isRecyclable
                    ? 'Geri Dönüştürülebilir'
                    : 'Geri Dönüştürülemez',
                sustainability.packaging.isRecyclable
                    ? Colors.green
                    : Colors.red,
              ),
              
              // Transport
              _buildMetricRow(
                Icons.local_shipping,
                'Taşıma',
                sustainability.transport.isLocal
                    ? 'Yerel Ürün'
                    : '${sustainability.transport.distance.toStringAsFixed(0)} km',
                sustainability.transport.isLocal
                    ? Colors.green
                    : Colors.orange,
              ),
              
              // Production
              if (sustainability.production.isOrganic)
                _buildMetricRow(
                  Icons.agriculture,
                  'Üretim',
                  'Organik',
                  Colors.green,
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEnvironmentalSection(BuildContext context) {
    final environmental = analysis.environmentalImpact;
    return ExpansionTile(
      leading: Icon(
        Icons.nature,
        color: Colors.teal[700],
      ),
      title: const Text(
        'Çevresel Etki',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.pets, size: 14, color: Colors.green[700]),
          const SizedBox(width: 4),
          Text(
            'Hayvan Refahı: ${environmental.animalWelfareScore.toInt()}',
            style: TextStyle(fontSize: 12, color: Colors.grey[700]),
          ),
          const SizedBox(width: 12),
          Icon(Icons.eco, size: 14, color: Colors.teal[700]),
          const SizedBox(width: 4),
          Text(
            'Bio: ${environmental.biodiversityImpact.toInt()}',
            style: TextStyle(fontSize: 12, color: Colors.grey[700]),
          ),
        ],
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Impact Scores
              _buildImpactBar(
                'Biyoçeşitlilik Etkisi',
                environmental.biodiversityImpact,
                true, // Lower is better
              ),
              _buildImpactBar(
                'Ormansızlaşma Riski',
                environmental.deforestationRisk,
                true,
              ),
              _buildImpactBar(
                'Okyanus Etkisi',
                environmental.oceanImpact,
                true,
              ),
              _buildImpactBar(
                'Hayvan Refahı',
                environmental.animalWelfareScore,
                false, // Higher is better
              ),
              
              // Positive Impacts
              if (environmental.positiveImpacts.isNotEmpty) ...[
                const SizedBox(height: 16),
                _buildImpactList(
                  'Olumlu Etkiler',
                  environmental.positiveImpacts,
                  Icons.check_circle,
                  Colors.green,
                ),
              ],
              
              // Concerns
              if (environmental.environmentalConcerns.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildImpactList(
                  'Endişeler',
                  environmental.environmentalConcerns,
                  Icons.warning,
                  Colors.orange,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNutritionalSection(BuildContext context) {
    final nutritional = analysis.nutritionalInsights;
    return ExpansionTile(
      leading: Icon(
        Icons.restaurant_menu,
        color: Colors.purple[700],
      ),
      title: const Text(
        'Besin Değerleri',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.favorite,
            size: 14,
            color: _getHealthScoreColor(nutritional.healthScore),
          ),
          const SizedBox(width: 4),
          Text(
            'Sağlık Skoru: ${nutritional.healthScore.toInt()}/100',
            style: TextStyle(fontSize: 12, color: Colors.grey[700]),
          ),
        ],
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Macronutrients
              if (nutritional.macronutrients.isNotEmpty) ...[
                _buildNutrientGrid(nutritional.macronutrients),
                const SizedBox(height: 16),
              ],
              
              // Benefits
              if (nutritional.benefits.isNotEmpty) ...[
                _buildImpactList(
                  'Faydalar',
                  nutritional.benefits,
                  Icons.thumb_up,
                  Colors.green,
                ),
                const SizedBox(height: 12),
              ],
              
              // Concerns
              if (nutritional.concerns.isNotEmpty)
                _buildImpactList(
                  'Dikkat Edilmesi Gerekenler',
                  nutritional.concerns,
                  Icons.info,
                  Colors.orange,
                ),
              
              // Diet Compatibility
              if (nutritional.dietCompatibility.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: nutritional.dietCompatibility
                      .map((diet) => Chip(
                            label: Text(diet),
                            backgroundColor: Colors.purple[100],
                          ))
                      .toList(),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAlternativesSection(BuildContext context) {
    return ExpansionTile(
      leading: Icon(
        Icons.swap_horiz,
        color: Colors.blue[700],
      ),
      title: const Text(
        'Alternatif Ürünler',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text('${analysis.alternatives.length} ' + AppLocalizations.of(context)!.suggestions),
      children: [
        SizedBox(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: analysis.alternatives.length,
            itemBuilder: (context, index) {
              final alt = analysis.alternatives[index];
              return _buildAlternativeCard(alt);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAlternativeCard(AlternativeProduct alternative) {
    return Card(
      margin: const EdgeInsets.only(right: 12),
      child: Container(
        width: 200,
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              alternative.name,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              alternative.brand,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            const Spacer(),
            Row(
              children: [
                Icon(Icons.eco, size: 16, color: Colors.green[700]),
                const SizedBox(width: 4),
                Text(
                  '%${alternative.veganScore.toStringAsFixed(0)}',
                  style: const TextStyle(fontSize: 12),
                ),
                const Spacer(),
                Text(
                  alternative.priceComparison > 0
                      ? '+%${alternative.priceComparison.toStringAsFixed(0)}'
                      : '%${alternative.priceComparison.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: alternative.priceComparison > 0
                        ? Colors.red
                        : Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              alternative.reason,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey[600],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: onChatWithAI,
              icon: const Icon(Icons.smart_toy),
              label: Text(AppLocalizations.of(context)!.talkWithAI),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          if (analysis.alternatives.isNotEmpty) ...[
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onViewAlternatives,
                icon: const Icon(Icons.swap_horiz),
                label: Text(AppLocalizations.of(context)!.showAlternatives),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // Helper widgets
  Widget _buildWarningBox(String title, String content, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: TextStyle(color: color.withValues(alpha: 0.8)),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow(IconData icon, String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactBar(String label, double value, bool lowerIsBetter) {
    final color = lowerIsBetter
        ? (value < 30 ? Colors.green : value < 60 ? Colors.orange : Colors.red)
        : (value > 70 ? Colors.green : value > 40 ? Colors.orange : Colors.red);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12)),
              Text(
                '${value.toStringAsFixed(0)}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImpactList(String title, List<String> items, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 8),
        ...items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Icon(icon, size: 16, color: color),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item,
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  Widget _buildNutrientGrid(Map<String, double> nutrients) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: nutrients.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _translateNutrient(entry.key),
                  style: const TextStyle(fontSize: 13),
                ),
                Text(
                  '${entry.value.toStringAsFixed(1)}g',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  String _translateNutrient(String nutrient) {
    switch (nutrient) {
      case 'protein':
        return 'Protein';
      case 'carbs':
        return 'Karbonhidrat';
      case 'fat':
        return 'Yağ';
      case 'fiber':
        return 'Lif';
      default:
        return nutrient;
    }
  }

  Color _getHeaderColor() {
    switch (analysis.veganAnalysis.status) {
      case VeganStatus.vegan:
        return Colors.green[700]!;
      case VeganStatus.nonVegan:
        return Colors.red[700]!;
      case VeganStatus.possiblyVegan:
        return Colors.orange[700]!;
      case VeganStatus.unknown:
        return Colors.grey[700]!;
    }
  }

  IconData _getStatusIcon() {
    switch (analysis.veganAnalysis.status) {
      case VeganStatus.vegan:
        return Icons.check_circle;
      case VeganStatus.nonVegan:
        return Icons.cancel;
      case VeganStatus.possiblyVegan:
        return Icons.help;
      case VeganStatus.unknown:
        return Icons.question_mark;
    }
  }

  String _getStatusText() {
    switch (analysis.veganAnalysis.status) {
      case VeganStatus.vegan:
        return 'Vegan Ürün';
      case VeganStatus.nonVegan:
        return 'Vegan Değil';
      case VeganStatus.possiblyVegan:
        return 'Muhtemelen Vegan';
      case VeganStatus.unknown:
        return 'Belirsiz';
    }
  }

  Color _getVeganColor() {
    switch (analysis.veganAnalysis.status) {
      case VeganStatus.vegan:
        return Colors.green[700]!;
      case VeganStatus.nonVegan:
        return Colors.red[700]!;
      case VeganStatus.possiblyVegan:
        return Colors.orange[700]!;
      case VeganStatus.unknown:
        return Colors.grey[700]!;
    }
  }

  String _getVeganStatusText() {
    final confidence = analysis.veganAnalysis.confidenceScore;
    switch (analysis.veganAnalysis.status) {
      case VeganStatus.vegan:
        return '✅ Vegan (%${confidence.toStringAsFixed(0)} güven)';
      case VeganStatus.nonVegan:
        return '❌ Vegan Değil (%${confidence.toStringAsFixed(0)} güven)';
      case VeganStatus.possiblyVegan:
        return '⚠️ Muhtemelen Vegan (%${confidence.toStringAsFixed(0)} güven)';
      case VeganStatus.unknown:
        return '❓ Belirsiz';
    }
  }

  Color _getCarbonColor(double carbon) {
    if (carbon < 1) return Colors.green;
    if (carbon < 5) return Colors.orange;
    return Colors.red;
  }

  Color _getWaterColor(double water) {
    if (water < 100) return Colors.green;
    if (water < 500) return Colors.orange;
    return Colors.red;
  }

  Color _getLandColor(double land) {
    if (land < 5) return Colors.green;
    if (land < 20) return Colors.orange;
    return Colors.red;
  }

  Color _getHealthScoreColor(double score) {
    if (score >= 75) return Colors.green;
    if (score >= 50) return Colors.orange;
    return Colors.red;
  }
}
