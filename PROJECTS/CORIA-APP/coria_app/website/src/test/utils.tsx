import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

// Mock messages for testing
const mockMessages = {
  hero: {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    cta: 'Test CTA'
  },
  features: {
    title: 'Features',
    scanning: 'Barcode Scanning',
    sustainability: 'Sustainability Scoring',
    tracking: 'Impact Tracking'
  },
  navigation: {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    about: 'About',
    contact: 'Contact'
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry'
  }
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string
  messages?: any
}

const AllTheProviders = ({ 
  children, 
  locale = 'en', 
  messages = mockMessages 
}: { 
  children: React.ReactNode
  locale?: string
  messages?: any
}) => {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { locale, messages, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders locale={locale} messages={messages}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers
export const expectToBeAccessible = async (container: HTMLElement) => {
  const axeCore = await import('axe-core')
  const axe = axeCore.default || axeCore
  const results = await axe.run(container)
  expect(results.violations).toHaveLength(0)
}

// Mock data generators
export const mockFeature = {
  id: '1',
  name: { en: 'Test Feature' },
  description: { en: 'Test Description' },
  icon: 'test-icon',
  screenshots: [],
  benefits: { en: ['Benefit 1', 'Benefit 2'] },
  category: 'sustainability'
}

export const mockBlogPost = {
  id: '1',
  slug: 'test-post',
  title: { en: 'Test Post' },
  excerpt: { en: 'Test excerpt' },
  content: { en: 'Test content' },
  author: { name: 'Test Author', avatar: '' },
  category: 'sustainability',
  tags: ['test'],
  featuredImage: { url: '/test.jpg', alt: 'Test' },
  publishedAt: new Date(),
  seo: {
    title: { en: 'Test SEO Title' },
    description: { en: 'Test SEO Description' },
    keywords: { en: 'test, keywords' },
    ogImage: '/test-og.jpg'
  }
}