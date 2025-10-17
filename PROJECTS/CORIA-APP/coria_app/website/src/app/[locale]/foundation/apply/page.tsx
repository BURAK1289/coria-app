import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FoundationApplicationForm from '@/components/foundation/FoundationApplicationForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'foundation.apply.meta' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function FoundationApplyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('foundation.apply');

  return (
    <main className="min-h-screen bg-transparent pt-24 lg:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{t('hero.subtitle')}</p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
        </div>

        {/* Form Component */}
        <FoundationApplicationForm />

        {/* Help Section */}
        <div className="mt-12 bg-[var(--foam)]/60 backdrop-blur-sm rounded-lg border border-blue-200/50 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {t('help.title')}
          </h3>
          <p className="text-blue-800 mb-4">{t('help.description')}</p>
          <a
            href="mailto:foundation@coria.app"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            foundation@coria.app
          </a>
        </div>
      </div>
    </main>
  );
}
