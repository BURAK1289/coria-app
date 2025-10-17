/**
 * Type-only tests for component prop interfaces
 * These tests validate that component props are correctly typed at compile time
 */

import { expectType, expectError, expectAssignable, expectNotAssignable } from 'tsd'
import type {
  ButtonProps,
  TypographyProps,
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  ContainerProps,
  BaseComponentProps,
  LocalizedPageProps,
  BlogPageProps,
  FeaturePageProps,
  DynamicPageProps,
  LayoutProps,
  LocaleLayoutProps,
  ProviderProps,
  ThemeProviderProps,
  AnalyticsProviderProps,
  LocaleProviderProps,
  Language
} from '../../types/global'

// Test BaseComponentProps
describe('BaseComponentProps type tests', () => {
  test('should accept valid base props', () => {
    expectType<BaseComponentProps>({
      className: 'test-class',
      children: 'test children',
      id: 'test-id',
      'data-testid': 'test-testid'
    })

    expectType<BaseComponentProps>({})
    expectType<BaseComponentProps>({ className: 'test' })
    expectType<BaseComponentProps>({ children: null })
  })

  test('should reject invalid base props', () => {
    expectError<BaseComponentProps>({
      // @ts-expect-error - invalid prop
      invalidProp: 'test'
    })

    expectError<BaseComponentProps>({
      // @ts-expect-error - wrong type
      className: 123
    })
  })
})

// Test ButtonProps
describe('ButtonProps type tests', () => {
  test('should extend BaseComponentProps', () => {
    expectAssignable<BaseComponentProps>({} as ButtonProps)
  })

  test('should accept valid button props', () => {
    expectType<ButtonProps>({
      variant: 'primary',
      size: 'md',
      disabled: false,
      loading: true,
      asChild: false,
      type: 'button',
      onClick: (event) => {
        expectType<React.MouseEvent<HTMLButtonElement>>(event)
      }
    })

    expectType<ButtonProps>({
      variant: 'secondary',
      size: 'lg',
      className: 'test-class'
    })
  })

  test('should enforce variant constraints', () => {
    expectType<ButtonProps>({ variant: 'primary' })
    expectType<ButtonProps>({ variant: 'secondary' })
    expectType<ButtonProps>({ variant: 'outline' })
    expectType<ButtonProps>({ variant: 'ghost' })
    expectType<ButtonProps>({ variant: 'destructive' })

    expectError<ButtonProps>({
      // @ts-expect-error - invalid variant
      variant: 'invalid'
    })
  })

  test('should enforce size constraints', () => {
    expectType<ButtonProps>({ size: 'sm' })
    expectType<ButtonProps>({ size: 'md' })
    expectType<ButtonProps>({ size: 'lg' })
    expectType<ButtonProps>({ size: 'icon' })

    expectError<ButtonProps>({
      // @ts-expect-error - invalid size
      size: 'xl'
    })
  })

  test('should enforce type constraints', () => {
    expectType<ButtonProps>({ type: 'button' })
    expectType<ButtonProps>({ type: 'submit' })
    expectType<ButtonProps>({ type: 'reset' })

    expectError<ButtonProps>({
      // @ts-expect-error - invalid type
      type: 'invalid'
    })
  })
})

// Test TypographyProps
describe('TypographyProps type tests', () => {
  test('should extend BaseComponentProps', () => {
    expectAssignable<BaseComponentProps>({} as TypographyProps)
  })

  test('should accept valid typography props', () => {
    expectType<TypographyProps>({
      variant: 'h1',
      as: 'h1'
    })

    expectType<TypographyProps>({
      variant: 'body',
      as: 'p',
      className: 'text-class'
    })
  })

  test('should enforce variant constraints', () => {
    expectType<TypographyProps>({ variant: 'h1' })
    expectType<TypographyProps>({ variant: 'h2' })
    expectType<TypographyProps>({ variant: 'h3' })
    expectType<TypographyProps>({ variant: 'h4' })
    expectType<TypographyProps>({ variant: 'large' })
    expectType<TypographyProps>({ variant: 'small' })
    expectType<TypographyProps>({ variant: 'muted' })
    expectType<TypographyProps>({ variant: 'body' })
    expectType<TypographyProps>({ variant: 'body-large' })
    expectType<TypographyProps>({ variant: 'body-small' })

    expectError<TypographyProps>({
      // @ts-expect-error - invalid variant
      variant: 'invalid'
    })
  })

  test('should accept valid HTML elements for as prop', () => {
    expectType<TypographyProps>({ as: 'h1' })
    expectType<TypographyProps>({ as: 'p' })
    expectType<TypographyProps>({ as: 'span' })
    expectType<TypographyProps>({ as: 'div' })
  })
})

// Test CardProps and sub-components
describe('Card component props type tests', () => {
  test('should extend BaseComponentProps', () => {
    expectAssignable<BaseComponentProps>({} as CardProps)
    expectAssignable<BaseComponentProps>({} as CardHeaderProps)
    expectAssignable<BaseComponentProps>({} as CardTitleProps)
    expectAssignable<BaseComponentProps>({} as CardDescriptionProps)
    expectAssignable<BaseComponentProps>({} as CardContentProps)
    expectAssignable<BaseComponentProps>({} as CardFooterProps)
  })

  test('should accept valid card props', () => {
    expectType<CardProps>({
      variant: 'default'
    })

    expectType<CardProps>({
      variant: 'outlined',
      className: 'card-class'
    })

    expectType<CardProps>({
      variant: 'elevated'
    })
  })

  test('should enforce variant constraints', () => {
    expectType<CardProps>({ variant: 'default' })
    expectType<CardProps>({ variant: 'outlined' })
    expectType<CardProps>({ variant: 'elevated' })

    expectError<CardProps>({
      // @ts-expect-error - invalid variant
      variant: 'invalid'
    })
  })
})

// Test ContainerProps
describe('ContainerProps type tests', () => {
  test('should extend BaseComponentProps', () => {
    expectAssignable<BaseComponentProps>({} as ContainerProps)
  })

  test('should accept valid container props', () => {
    expectType<ContainerProps>({
      size: 'md',
      padding: 'lg'
    })
  })

  test('should enforce size constraints', () => {
    expectType<ContainerProps>({ size: 'sm' })
    expectType<ContainerProps>({ size: 'md' })
    expectType<ContainerProps>({ size: 'lg' })
    expectType<ContainerProps>({ size: 'xl' })
    expectType<ContainerProps>({ size: 'full' })

    expectError<ContainerProps>({
      // @ts-expect-error - invalid size
      size: 'invalid'
    })
  })

  test('should enforce padding constraints', () => {
    expectType<ContainerProps>({ padding: 'none' })
    expectType<ContainerProps>({ padding: 'sm' })
    expectType<ContainerProps>({ padding: 'md' })
    expectType<ContainerProps>({ padding: 'lg' })
    expectType<ContainerProps>({ padding: 'xl' })

    expectError<ContainerProps>({
      // @ts-expect-error - invalid padding
      padding: 'invalid'
    })
  })
})

// Test Next.js page props
describe('Next.js page props type tests', () => {
  test('should accept valid localized page props', () => {
    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({ q: 'search' })
    })

    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'tr' })
    })
  })

  test('should accept valid blog page props', () => {
    expectType<BlogPageProps>({
      params: Promise.resolve({ locale: 'en', slug: 'test-post' }),
      searchParams: Promise.resolve({ preview: 'true' })
    })
  })

  test('should accept valid feature page props', () => {
    expectType<FeaturePageProps>({
      params: Promise.resolve({ 
        locale: 'en', 
        category: 'sustainability', 
        feature: 'barcode-scanning' 
      })
    })
  })

  test('should accept valid dynamic page props', () => {
    expectType<DynamicPageProps<{ id: string }>>({
      params: Promise.resolve({ locale: 'en', id: '123' })
    })
  })

  test('should enforce locale constraints in params', () => {
    // Valid locales
    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'en' })
    })
    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'tr' })
    })
    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'de' })
    })
    expectType<LocalizedPageProps>({
      params: Promise.resolve({ locale: 'fr' })
    })
  })
})

// Test Layout props
describe('Layout props type tests', () => {
  test('should accept valid layout props', () => {
    expectType<LayoutProps>({
      children: 'test children'
    })

    expectType<LayoutProps>({
      children: 'test children',
      className: 'layout-class'
    })
  })

  test('should accept valid locale layout props', () => {
    expectType<LocaleLayoutProps>({
      children: 'test children',
      params: Promise.resolve({ locale: 'en' })
    })
  })

  test('should require children prop', () => {
    // Test that LayoutProps without children is rejected
    expectError<LayoutProps>({
      className: 'test'
      // Missing required 'children' prop
    } as any)
  })
})

// Test Provider props
describe('Provider props type tests', () => {
  test('should accept valid provider props', () => {
    expectType<ProviderProps>({
      children: 'test children'
    })
  })

  test('should accept valid theme provider props', () => {
    expectType<ThemeProviderProps>({
      children: 'test children',
      defaultTheme: 'light',
      storageKey: 'theme'
    })

    expectType<ThemeProviderProps>({
      children: 'test children',
      defaultTheme: 'dark'
    })

    expectType<ThemeProviderProps>({
      children: 'test children',
      defaultTheme: 'system'
    })
  })

  test('should enforce theme constraints', () => {
    expectError<ThemeProviderProps>({
      children: 'test children',
      // @ts-expect-error - invalid theme
      defaultTheme: 'invalid'
    })
  })

  test('should accept valid locale provider props', () => {
    expectType<LocaleProviderProps>({
      children: 'test children',
      locale: 'en',
      messages: { test: 'message' }
    })
  })

  test('should enforce locale constraints', () => {
    expectType<LocaleProviderProps>({
      children: 'test children',
      locale: 'en',
      messages: {}
    })

    expectType<LocaleProviderProps>({
      children: 'test children',
      locale: 'tr',
      messages: {}
    })

    expectError<LocaleProviderProps>({
      children: 'test children',
      // @ts-expect-error - invalid locale
      locale: 'invalid',
      messages: {}
    })
  })

  test('should require children prop for all providers', () => {
    // Test that ProviderProps without children is rejected
    expectError<ProviderProps>({
      // Missing required 'children' prop
    } as any)

    // Test that ThemeProviderProps without children is rejected
    expectError<ThemeProviderProps>({
      defaultTheme: 'light'
      // Missing required 'children' prop
    } as any)

    // Test that LocaleProviderProps without children is rejected
    expectError<LocaleProviderProps>({
      locale: 'en',
      messages: {}
      // Missing required 'children' prop
    } as any)
  })
})

// Test Language type
describe('Language type tests', () => {
  test('should accept valid languages', () => {
    expectType<Language>('tr')
    expectType<Language>('en')
    expectType<Language>('de')
    expectType<Language>('fr')
  })

  test('should reject invalid languages', () => {
    expectError<Language>('es' as any)
    expectError<Language>('it' as any)
    expectError<Language>('invalid' as any)
  })
})