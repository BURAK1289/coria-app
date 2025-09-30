'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon 
} from '@/components/icons';

export function CustomerSupport() {
  const t = useTranslations('pricing');

  const supportMethods = [
    {
      title: t('support.methods.0.title'),
      description: t('support.methods.0.description'),
      contact: t('support.methods.0.contact'),
      icon: EnvelopeIcon,
      action: () => window.open('mailto:support@coria.app', '_blank'),
    },
    {
      title: t('support.methods.1.title'),
      description: t('support.methods.1.description'),
      contact: t('support.methods.1.contact'),
      icon: ChatBubbleLeftRightIcon,
      action: () => {
        // This would typically open a chat widget
        console.log('Opening live chat...');
      },
    },
    {
      title: t('support.methods.2.title'),
      description: t('support.methods.2.description'),
      contact: t('support.methods.2.contact'),
      icon: QuestionMarkCircleIcon,
      action: () => window.open('/help', '_blank'),
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('support.title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            {t('support.description')}
          </Typography>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {supportMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="p-6 text-center">
                <div className="w-12 h-12 bg-coria-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-coria-green" />
                </div>
                <Typography variant="h4" className="mb-2">
                  {method.title}
                </Typography>
                <Typography variant="large" className="text-text-secondary mb-4">
                  {method.description}
                </Typography>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={method.action}
                  className="w-full"
                >
                  {method.contact}
                </Button>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}