'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { REGIONAL_PRICING, type Region, type BillingPeriod } from '@/data/pricing';
import { detectRegion, changeRegion, formatPrice, calculateYearlyDiscount } from '@/lib/region';
import { type Locale } from '@/types/localization';

export function RegionalPricing() {
  const t = useTranslations('pricing');
  const locale = useLocale() as Locale;

  // Detect initial region based on priority: query > cookie > locale > default
  const [selectedRegion, setSelectedRegion] = useState<Region>(() => {
    if (typeof window === 'undefined') return 'US'; // SSR fallback
    return detectRegion(locale);
  });

  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('yearly'); // Default to yearly (best value)

  // Update region on client-side mount to handle cookie/query detection
  useEffect(() => {
    const detectedRegion = detectRegion(locale);
    if (detectedRegion !== selectedRegion) {
      setSelectedRegion(detectedRegion);
    }
  }, [locale]);

  // Handle region change with cookie persistence
  const handleRegionChange = (newRegion: Region) => {
    setSelectedRegion(newRegion);
    changeRegion(newRegion); // Persists to cookie and updates URL
  };

  const currentRegion = REGIONAL_PRICING.find((r) => r.region === selectedRegion);
  if (!currentRegion) return null;

  const periods: { key: BillingPeriod; label: string }[] = [
    { key: 'monthly', label: t('regional.perMonth') },
    { key: 'yearly', label: t('regional.perYear') },
    { key: 'family', label: 'Family' },
    { key: 'lifetime', label: 'Lifetime' },
  ];

  // Calculate actual yearly discount percentage
  const actualYearlyDiscount = calculateYearlyDiscount(
    currentRegion.pricing.monthly,
    currentRegion.pricing.yearly
  );

  const showTrialBadge = selectedPeriod === 'monthly' || selectedPeriod === 'yearly';

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('regional.title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            {t('regional.subtitle')}
          </Typography>
        </div>

        {/* Region Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {REGIONAL_PRICING.map((region) => (
            <Button
              key={region.region}
              variant={selectedRegion === region.region ? 'primary' : 'secondary'}
              size="md"
              onClick={() => handleRegionChange(region.region)}
              className="min-w-[120px]"
            >
              {t(`regional.regions.${region.region}.name`)}
            </Button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {periods.map((period) => {
            const isYearly = period.key === 'yearly';
            const isLifetime = period.key === 'lifetime';

            // Format price using Intl.NumberFormat
            const price = formatPrice(currentRegion.pricing[period.key], selectedRegion);

            return (
              <Card
                key={period.key}
                className={`relative p-6 bg-[var(--foam)]/85 backdrop-blur-sm ${
                  isYearly
                    ? 'border-coria-green shadow-lg ring-2 ring-coria-green ring-offset-2'
                    : isLifetime
                    ? 'border-yellow-500 shadow-md'
                    : 'border-[var(--foam)]'
                }`}
              >
                {/* Yearly Discount Badge */}
                {isYearly && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-coria-green text-white px-3 py-1 rounded-full text-sm font-medium">
                      {t('regional.discount', { percent: actualYearlyDiscount })}
                    </span>
                  </div>
                )}

                {/* Family Badge */}
                {period.key === 'family' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Family
                    </span>
                  </div>
                )}

                {/* Lifetime "Best Value" Badge */}
                {isLifetime && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <Typography variant="h4" className="mb-4 capitalize">
                    {period.label}
                  </Typography>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-coria-green mb-1">
                      {price}
                    </div>
                    {!isLifetime && (
                      <Typography variant="small" className="text-text-secondary">
                        {period.key === 'monthly' && t('regional.perMonth')}
                        {period.key === 'yearly' && t('regional.perYear')}
                        {period.key === 'family' && `${t('regional.perMonth')} (5 users)`}
                      </Typography>
                    )}
                    {isLifetime && (
                      <Typography variant="small" className="text-text-secondary">
                        {t('regional.oneTime')}
                      </Typography>
                    )}
                  </div>

                  {/* 14-Day Trial Badge */}
                  {showTrialBadge && period.key === selectedPeriod && (
                    <div className="mb-4 p-3 bg-[var(--foam)]/90 backdrop-blur-sm rounded-lg border border-blue-200/50 shadow-sm">
                      <Typography variant="small" className="text-blue-700 font-medium">
                        ✨ {t('trial.duration')} {t('trial.noCard')}
                      </Typography>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="space-y-2 mb-6 text-left">
                    {period.key === 'family' && (
                      <>
                        <Typography variant="small" className="text-text-secondary">
                          • 5 {locale === 'tr' ? 'aile üyesi' : locale === 'de' ? 'Familienmitglieder' : locale === 'fr' ? 'membres de la famille' : 'family members'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Paylaşılan kiler' : locale === 'de' ? 'Gemeinsamer Vorrat' : locale === 'fr' ? 'Garde-manger partagé' : 'Shared pantry'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Aile planı özel' : locale === 'de' ? 'Familien-Extras' : locale === 'fr' ? 'Extras famille' : 'Family plan extras'}
                        </Typography>
                      </>
                    )}
                    {isLifetime && (
                      <>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Ömür boyu erişim' : locale === 'de' ? 'Lebenslanger Zugriff' : locale === 'fr' ? 'Accès à vie' : 'Lifetime access'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Tüm gelecek özellikler' : locale === 'de' ? 'Alle zukünftigen Funktionen' : locale === 'fr' ? 'Toutes les futures fonctionnalités' : 'All future features'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Tek seferlik ödeme' : locale === 'de' ? 'Einmalige Zahlung' : locale === 'fr' ? 'Paiement unique' : 'One-time payment'}
                        </Typography>
                      </>
                    )}
                    {!period.key.match(/family|lifetime/) && (
                      <>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Tüm Premium özellikler' : locale === 'de' ? 'Alle Premium-Funktionen' : locale === 'fr' ? 'Toutes les fonctionnalités Premium' : 'All Premium features'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'Sınırsız AI chat' : locale === 'de' ? 'Unbegrenzter AI-Chat' : locale === 'fr' ? 'Chat IA illimité' : 'Unlimited AI chat'}
                        </Typography>
                        <Typography variant="small" className="text-text-secondary">
                          • {locale === 'tr' ? 'İstediğin zaman iptal et' : locale === 'de' ? 'Jederzeit kündbar' : locale === 'fr' ? 'Annuler à tout moment' : 'Cancel anytime'}
                        </Typography>
                      </>
                    )}
                  </div>

                  {/* Payment info note */}
                  <div className="mt-4 pt-4 border-t border-[var(--foam)]/50">
                    <Typography variant="small" className="text-text-secondary text-center">
                      {locale === 'tr'
                        ? 'Ödeme mobil uygulamadan yapılır'
                        : locale === 'de'
                        ? 'Zahlung über die mobile App'
                        : locale === 'fr'
                        ? 'Paiement via l\'application mobile'
                        : 'Payment via mobile app'}
                    </Typography>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Solana Payment Card */}
          <Card
            className="relative p-6 bg-gradient-to-br from-purple-500/20 via-[var(--foam)]/85 to-pink-500/20 backdrop-blur-sm border-purple-500 shadow-lg"
          >
            {/* Crypto Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                Blockchain
              </span>
            </div>

            <div className="text-center">
              <Typography variant="h4" className="mb-4">
                Solana
              </Typography>

              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  0.025 SOL
                </div>
                <Typography variant="small" className="text-text-secondary">
                  {t('regional.oneTime')}
                </Typography>
              </div>

              {/* Key Features */}
              <div className="space-y-2 mb-6 text-left">
                <Typography variant="small" className="text-text-secondary">
                  • {locale === 'tr' ? 'Özel cüzdan oluşturma' : locale === 'de' ? 'Benutzerdefinierte Wallet' : locale === 'fr' ? 'Portefeuille personnalisé' : 'Custom wallet generation'}
                </Typography>
                <Typography variant="small" className="text-text-secondary">
                  • {locale === 'tr' ? 'Direkt blockchain ödemesi' : locale === 'de' ? 'Direkte Blockchain-Zahlung' : locale === 'fr' ? 'Paiement blockchain direct' : 'Direct blockchain payment'}
                </Typography>
                <Typography variant="small" className="text-text-secondary">
                  • {locale === 'tr' ? 'App store ücreti yok' : locale === 'de' ? 'Keine App-Store-Gebühren' : locale === 'fr' ? 'Pas de frais d\'app store' : 'No app store fees'}
                </Typography>
                <Typography variant="small" className="text-text-secondary">
                  • {locale === 'tr' ? 'Tüm Premium özellikler' : locale === 'de' ? 'Alle Premium-Funktionen' : locale === 'fr' ? 'Toutes les fonctionnalités Premium' : 'All Premium features'}
                </Typography>
              </div>

              {/* Payment info note */}
              <div className="mt-4 pt-4 border-t border-purple-500/30">
                <Typography variant="small" className="text-text-secondary text-center">
                  {locale === 'tr'
                    ? 'Ödeme mobil uygulamadan yapılır'
                    : locale === 'de'
                    ? 'Zahlung über die mobile App'
                    : locale === 'fr'
                    ? 'Paiement via l\'application mobile'
                    : 'Payment via mobile app'}
                </Typography>
              </div>
            </div>
          </Card>
        </div>

        {/* VAT Note for EU */}
        {currentRegion.vatIncluded && (
          <div className="text-center mt-8">
            <Typography variant="small" className="text-text-secondary">
              {t('regional.vatIncluded')}
            </Typography>
          </div>
        )}

        {/* General Note */}
        <div className="text-center mt-4">
          <Typography variant="small" className="text-text-secondary">
            {t('regional.note')}
          </Typography>
        </div>
      </Container>
    </section>
  );
}
