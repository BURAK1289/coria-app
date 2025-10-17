import { useTranslations, useMessages } from 'next-intl';
import { Icon } from '@/components/icons/Icon';

import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { AppScreenshotGallery } from './app-screenshot-gallery';
import { MethodologyExplanation } from './methodology-explanation';
import { DataSourceAttribution } from './data-source-attribution';
import { RelatedFeatures } from './related-features';
import { getMessageValue } from '@/lib/messages';
import { isNonEmptyString, isValidArray, isValidObject } from '@/lib/type-guards';

interface FeatureDetailProps {
  category: string;
  feature: string;
}

interface FeatureStep {
  title: string;
  description: string;
}

interface FeatureTechnicalDetail extends FeatureStep {
  link?: string;
}

interface FeatureContent {
  howItWorks?: FeatureStep[];
  benefits?: string[];
  technicalDetails?: FeatureTechnicalDetail[];
}

function isFeatureStep(value: unknown): value is FeatureStep {
  if (!isValidObject(value)) {
    return false;
  }

  return isNonEmptyString(value.title) && isNonEmptyString(value.description);
}

function isTechnicalDetail(value: unknown): value is FeatureTechnicalDetail {
  if (!isFeatureStep(value) || !isValidObject(value)) {
    return false;
  }

  const detail = value as FeatureStep & { link?: unknown };
  return detail.link === undefined || isNonEmptyString(detail.link);
}

function isFeatureContent(value: unknown): value is FeatureContent {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    (value.howItWorks === undefined || (isValidArray(value.howItWorks) && value.howItWorks.every(isFeatureStep))) &&
    (value.benefits === undefined || (isValidArray(value.benefits) && value.benefits.every(isNonEmptyString))) &&
    (value.technicalDetails === undefined ||
      (isValidArray(value.technicalDetails) && value.technicalDetails.every(isTechnicalDetail)))
  );
}

export function FeatureDetail({ category, feature }: FeatureDetailProps) {
  const t = useTranslations('features');
  const messages = useMessages();

  const featureContent: FeatureContent =
    getMessageValue(messages, ['features', 'features', feature], isFeatureContent) ?? {
      howItWorks: [],
      benefits: [],
      technicalDetails: [],
    };

  const {
    howItWorks = [] as FeatureStep[],
    benefits = [] as string[],
    technicalDetails = [] as FeatureTechnicalDetail[],
  } = featureContent;

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Link href="/features" className="hover:text-coria-primary">
          {t('navigation.allFeatures')}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={{ pathname: '/features/[category]', params: { category } }}
          className="hover:text-coria-primary"
        >
          {t(`categories.${category}.title`)}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-coria-primary">{t(`features.${feature}.title`)}</span>
      </div>

      <Link href={{ pathname: '/features/[category]', params: { category } }}>
        <Button asChild variant="ghost" size="sm" className="gap-2 text-coria-primary">
          <span className="flex items-center gap-2">
            <Icon name="arrow-left" size={16} aria-hidden="true" />
            {t('navigation.backToCategory')}
          </span>
        </Button>
      </Link>

      <Card className="relative overflow-hidden rounded-[36px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-8 py-10 shadow-lg">
        <div className="relative z-10 space-y-6">
          <Badge variant="secondary" className="bg-[var(--foam)]/90 backdrop-blur-sm text-coria-primary">
            {t(`categories.${category}.title`)}
          </Badge>
          <Heading as="h1" size="3xl" weight="bold" className="text-balance">
            {t(`features.${feature}.title`)}
          </Heading>
          <Text size="lg" className="max-w-3xl text-white/85">
            {t(`features.${feature}.longDescription`)}
          </Text>
        </div>
      </Card>

      {benefits.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card
              key={benefit}
              className="flex items-start gap-3 rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-4 shadow-sm"
            >
              <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-coria-primary/10 text-coria-primary">
                <Icon name="check" size={16} aria-hidden="true" />
              </span>
              <Text size="sm" color="secondary" className="text-gray-700">
                {benefit}
              </Text>
            </Card>
          ))}
        </div>
      )}

      <AppScreenshotGallery category={category} />

      {howItWorks.length > 0 && (
        <section className="space-y-6">
          <Heading as="h2" size="2xl" weight="bold" className="text-coria-primary">
            {t('featureDetail.howItWorks.title')}
          </Heading>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, index) => (
              <Card
                key={`${step.title}-${index}`}
                className="h-full rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coria-primary/10 text-sm font-semibold text-coria-primary">
                  {index + 1}
                </div>
                <Heading as="h3" size="lg" weight="semibold" className="mt-4 text-coria-primary">
                  {step.title}
                </Heading>
                <Text size="sm" color="secondary" className="mt-2 text-gray-600">
                  {step.description}
                </Text>
              </Card>
            ))}
          </div>
        </section>
      )}

      {technicalDetails.length > 0 && (
        <section className="space-y-6">
          <Heading as="h2" size="2xl" weight="bold" className="text-coria-primary">
            {t('featureDetail.technicalDetails.title')}
          </Heading>
          <div className="space-y-4">
            {technicalDetails.map((detail, index) => (
              <Card
                key={`${detail.title}-${index}`}
                className="rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-coria-primary/10 text-coria-primary">
                    <Icon name="info" size={16} aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <Heading as="h3" size="lg" weight="semibold" className="text-coria-primary">
                      {detail.title}
                    </Heading>
                    <Text size="sm" color="secondary" className="text-gray-600">
                      {detail.description}
                    </Text>
                    {detail.link && (
                      <a
                        href={detail.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-coria-primary hover:underline"
                      >
                        {t('featureDetail.learnMore')}
                        <Icon name="external-link" size={16} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {category === 'sustainability-scoring' && <MethodologyExplanation feature={feature} />}

      <DataSourceAttribution feature={feature} />

      <RelatedFeatures category={category} currentFeature={feature} />

      <Card className="rounded-[32px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-8 py-10 text-center shadow-sm">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('featureDetail.cta.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto mt-3 max-w-3xl text-gray-600">
          {t('featureDetail.cta.description')}
        </Text>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="shadow-lg shadow-coria-primary/20"
          >
            <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
              {t('featureDetail.cta.downloadIos')}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-coria-primary/30">
            <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
              {t('featureDetail.cta.downloadAndroid')}
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
