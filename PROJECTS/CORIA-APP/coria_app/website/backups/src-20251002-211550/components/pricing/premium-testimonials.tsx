'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { StarIcon } from '@/components/icons';
import {
  TestimonialAnalyticsSvgIcon,
  TestimonialChatSvgIcon,
  TestimonialFoundationSvgIcon,
} from '@/components/icons/svg-icons';

export function PremiumTestimonials() {
  const t = useTranslations('pricing');

  const testimonials = [
    {
      name: t('testimonials.reviews.0.name'),
      location: t('testimonials.reviews.0.location'),
      rating: 5,
      text: t('testimonials.reviews.0.text'),
      feature: t('testimonials.reviews.0.feature'),
      icon: TestimonialAnalyticsSvgIcon,
      category: 'analytics',
    },
    {
      name: t('testimonials.reviews.1.name'),
      location: t('testimonials.reviews.1.location'),
      rating: 5,
      text: t('testimonials.reviews.1.text'),
      feature: t('testimonials.reviews.1.feature'),
      icon: TestimonialChatSvgIcon,
      category: 'chat',
    },
    {
      name: t('testimonials.reviews.2.name'),
      location: t('testimonials.reviews.2.location'),
      rating: 5,
      text: t('testimonials.reviews.2.text'),
      feature: t('testimonials.reviews.2.feature'),
      icon: TestimonialFoundationSvgIcon,
      category: 'foundation',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('testimonials.title')}
          </Typography>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const TestimonialIcon = testimonial.icon;
            return (
              <Card key={index} className="p-6 relative overflow-hidden">
                {/* Category Icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <TestimonialIcon size={48} className="text-coria-green" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center">
                    <TestimonialIcon size={20} className="text-coria-green mr-2" />
                    <span className="text-xs text-gray-500 capitalize">{testimonial.category}</span>
                  </div>
                </div>
              
              <Typography variant="large" className="mb-6 italic">
                &ldquo;{testimonial.text}&rdquo;
              </Typography>
              
                <div className="border-t pt-4">
                  <Typography variant="large" className="font-medium mb-1">
                    {testimonial.name}
                  </Typography>
                  <Typography variant="small" className="text-text-secondary mb-2">
                    {testimonial.location}
                  </Typography>
                  <div className="inline-block bg-coria-green/10 text-coria-green px-3 py-1 rounded-full text-sm">
                    {testimonial.feature}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}