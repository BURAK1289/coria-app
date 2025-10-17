/**
 * Testing framework and utility type declarations
 */

// Vitest global types
declare global {
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const test: typeof import('vitest').test;
  const expect: typeof import('vitest').expect;
  const beforeAll: typeof import('vitest').beforeAll;
  const afterAll: typeof import('vitest').afterAll;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterEach: typeof import('vitest').afterEach;
  const vi: typeof import('vitest').vi;
}

// Testing Library types augmentation
declare module '@testing-library/react' {
  export interface RenderOptions {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    queries?: any;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    legacyRoot?: boolean;
  }

  export interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (element?: HTMLElement | DocumentFragment) => void;
    rerender: (ui: React.ReactElement) => void;
    unmount: () => void;
    asFragment: () => DocumentFragment;
  }

  export function render(
    ui: React.ReactElement,
    options?: RenderOptions
  ): RenderResult;

  export const screen: {
    getByRole: (role: string, options?: any) => HTMLElement;
    queryByRole: (role: string, options?: any) => HTMLElement | null;
    findByRole: (role: string, options?: any) => Promise<HTMLElement>;
    getAllByRole: (role: string, options?: any) => HTMLElement[];
    queryAllByRole: (role: string, options?: any) => HTMLElement[];
    findAllByRole: (role: string, options?: any) => Promise<HTMLElement[]>;
    
    getByText: (text: string | RegExp, options?: any) => HTMLElement;
    queryByText: (text: string | RegExp, options?: any) => HTMLElement | null;
    findByText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getAllByText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryAllByText: (text: string | RegExp, options?: any) => HTMLElement[];
    findAllByText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;
    
    getByLabelText: (text: string | RegExp, options?: any) => HTMLElement;
    queryByLabelText: (text: string | RegExp, options?: any) => HTMLElement | null;
    findByLabelText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getAllByLabelText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryAllByLabelText: (text: string | RegExp, options?: any) => HTMLElement[];
    findAllByLabelText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;
    
    getByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement;
    queryByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement | null;
    findByPlaceholderText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getAllByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryAllByPlaceholderText: (text: string | RegExp, options?: any) => HTMLElement[];
    findAllByPlaceholderText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;
    
    getByTestId: (testId: string, options?: any) => HTMLElement;
    queryByTestId: (testId: string, options?: any) => HTMLElement | null;
    findByTestId: (testId: string, options?: any) => Promise<HTMLElement>;
    getAllByTestId: (testId: string, options?: any) => HTMLElement[];
    queryAllByTestId: (testId: string, options?: any) => HTMLElement[];
    findAllByTestId: (testId: string, options?: any) => Promise<HTMLElement[]>;
    
    getByAltText: (text: string | RegExp, options?: any) => HTMLElement;
    queryByAltText: (text: string | RegExp, options?: any) => HTMLElement | null;
    findByAltText: (text: string | RegExp, options?: any) => Promise<HTMLElement>;
    getAllByAltText: (text: string | RegExp, options?: any) => HTMLElement[];
    queryAllByAltText: (text: string | RegExp, options?: any) => HTMLElement[];
    findAllByAltText: (text: string | RegExp, options?: any) => Promise<HTMLElement[]>;
    
    debug: (element?: HTMLElement | DocumentFragment) => void;
  };

  export function cleanup(): void;
  export function act(callback: () => void | Promise<void>): Promise<void>;
  export const fireEvent: any;
  export function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: {
      timeout?: number;
      interval?: number;
      onTimeout?: (error: Error) => Error;
    }
  ): Promise<T>;
  export function waitForElementToBeRemoved<T>(
    callback: (() => T) | T,
    options?: {
      timeout?: number;
      interval?: number;
      onTimeout?: (error: Error) => Error;
    }
  ): Promise<void>;
}

// User Event types
declare module '@testing-library/user-event' {
  export interface UserEventOptions {
    delay?: number;
    skipClick?: boolean;
    skipHover?: boolean;
    initialSelectionStart?: number;
    initialSelectionEnd?: number;
  }

  export interface UserEvent {
    click: (element: Element, options?: UserEventOptions) => Promise<void>;
    dblClick: (element: Element, options?: UserEventOptions) => Promise<void>;
    type: (element: Element, text: string, options?: UserEventOptions) => Promise<void>;
    clear: (element: Element) => Promise<void>;
    selectOptions: (element: Element, values: string | string[]) => Promise<void>;
    deselectOptions: (element: Element, values: string | string[]) => Promise<void>;
    upload: (element: Element, file: File | File[]) => Promise<void>;
    hover: (element: Element) => Promise<void>;
    unhover: (element: Element) => Promise<void>;
    tab: (options?: { shift?: boolean }) => Promise<void>;
    keyboard: (text: string) => Promise<void>;
    paste: (text: string) => Promise<void>;
  }

  export function setup(options?: UserEventOptions): UserEvent;
  export default setup;
}

// Jest DOM matchers
declare module '@testing-library/jest-dom' {
  export interface CustomMatchers<R = unknown> {
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmpty(): R;
    toBeEmptyDOMElement(): R;
    toBeInTheDocument(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeVisible(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R;
    toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R;
    toHaveAttribute(attr: string, value?: string | RegExp): R;
    toHaveClass(...classNames: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, any>): R;
    toHaveStyle(css: string | Record<string, any>): R;
    toHaveTextContent(text: string | RegExp): R;
    toHaveValue(value: string | string[] | number): R;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveDescription(text?: string | RegExp): R;
  }
}

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T>, CustomMatchers<T> {}
  }
}

// Playwright types augmentation
declare module '@playwright/test' {
  export interface PlaywrightTestConfig {
    testDir?: string;
    timeout?: number;
    globalTimeout?: number;
    globalSetup?: string;
    globalTeardown?: string;
    forbidOnly?: boolean;
    fullyParallel?: boolean;
    grep?: RegExp | RegExp[];
    grepInvert?: RegExp | RegExp[];
    maxFailures?: number;
    metadata?: any;
    preserveOutput?: 'always' | 'never' | 'failures-only';
    reporter?: string | Array<[string, any]> | Array<[string, any, any]>;
    reportSlowTests?: { max: number; threshold: number } | null;
    quiet?: boolean;
    projects?: Array<any>;
    shard?: { total: number; current: number } | null;
    updateSnapshots?: 'all' | 'none' | 'missing';
    workers?: number | string;
    use?: {
      acceptDownloads?: boolean;
      baseURL?: string;
      browserName?: 'chromium' | 'firefox' | 'webkit';
      bypassCSP?: boolean;
      channel?: string;
      colorScheme?: 'light' | 'dark' | 'no-preference';
      deviceScaleFactor?: number;
      extraHTTPHeaders?: Record<string, string>;
      geolocation?: { latitude: number; longitude: number };
      hasTouch?: boolean;
      headless?: boolean;
      httpCredentials?: { username: string; password: string };
      ignoreHTTPSErrors?: boolean;
      isMobile?: boolean;
      javaScriptEnabled?: boolean;
      locale?: string;
      offline?: boolean;
      permissions?: string[];
      proxy?: {
        server: string;
        bypass?: string;
        username?: string;
        password?: string;
      };
      screenshot?: 'off' | 'on' | 'only-on-failure';
      storageState?: string | { cookies: any[]; origins: any[] };
      timezoneId?: string;
      trace?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
      userAgent?: string;
      video?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
      viewport?: { width: number; height: number } | null;
    };
    expect?: {
      timeout?: number;
      toHaveScreenshot?: {
        threshold?: number;
        mode?: 'pixel' | 'percent';
        animations?: 'disabled' | 'allow';
      };
      toMatchSnapshot?: {
        threshold?: number;
        mode?: 'pixel' | 'percent';
      };
    };
    webServer?: {
      command: string;
      port?: number;
      url?: string;
      timeout?: number;
      reuseExistingServer?: boolean;
      cwd?: string;
      env?: Record<string, string>;
      stdout?: 'pipe' | 'ignore';
      stderr?: 'pipe' | 'ignore';
    };
  }

  export interface Page {
    goto(url: string, options?: any): Promise<any>;
    click(selector: string, options?: any): Promise<void>;
    fill(selector: string, value: string, options?: any): Promise<void>;
    type(selector: string, text: string, options?: any): Promise<void>;
    press(selector: string, key: string, options?: any): Promise<void>;
    waitForSelector(selector: string, options?: any): Promise<any>;
    waitForURL(url: string | RegExp | ((url: URL) => boolean), options?: any): Promise<void>;
    screenshot(options?: any): Promise<Buffer>;
    locator(selector: string): Locator;
    getByRole(role: string, options?: any): Locator;
    getByText(text: string | RegExp, options?: any): Locator;
    getByLabel(text: string | RegExp, options?: any): Locator;
    getByPlaceholder(text: string | RegExp, options?: any): Locator;
    getByAltText(text: string | RegExp, options?: any): Locator;
    getByTitle(text: string | RegExp, options?: any): Locator;
    getByTestId(testId: string): Locator;
  }

  export interface Locator {
    click(options?: any): Promise<void>;
    fill(value: string, options?: any): Promise<void>;
    type(text: string, options?: any): Promise<void>;
    press(key: string, options?: any): Promise<void>;
    hover(options?: any): Promise<void>;
    focus(options?: any): Promise<void>;
    blur(options?: any): Promise<void>;
    check(options?: any): Promise<void>;
    uncheck(options?: any): Promise<void>;
    selectOption(values: string | string[], options?: any): Promise<string[]>;
    waitFor(options?: any): Promise<void>;
    isVisible(options?: any): Promise<boolean>;
    isHidden(options?: any): Promise<boolean>;
    isEnabled(options?: any): Promise<boolean>;
    isDisabled(options?: any): Promise<boolean>;
    isChecked(options?: any): Promise<boolean>;
    textContent(options?: any): Promise<string | null>;
    innerText(options?: any): Promise<string>;
    innerHTML(options?: any): Promise<string>;
    getAttribute(name: string, options?: any): Promise<string | null>;
    screenshot(options?: any): Promise<Buffer>;
    locator(selector: string): Locator;
    first(): Locator;
    last(): Locator;
    nth(index: number): Locator;
    count(): Promise<number>;
  }

  export interface BrowserContext {
    newPage(): Promise<Page>;
    close(): Promise<void>;
    pages(): Page[];
    cookies(urls?: string | string[]): Promise<any[]>;
    addCookies(cookies: any[]): Promise<void>;
    clearCookies(): Promise<void>;
    grantPermissions(permissions: string[], options?: any): Promise<void>;
    clearPermissions(): Promise<void>;
    setGeolocation(geolocation: { latitude: number; longitude: number }): Promise<void>;
    setExtraHTTPHeaders(headers: Record<string, string>): Promise<void>;
    setOffline(offline: boolean): Promise<void>;
    addInitScript(script: string | (() => void), arg?: any): Promise<void>;
    exposeFunction(name: string, callback: (...args: any[]) => any): Promise<void>;
    route(url: string | RegExp | ((url: URL) => boolean), handler: (route: any) => void): Promise<void>;
    unroute(url: string | RegExp | ((url: URL) => boolean), handler?: (route: any) => void): Promise<void>;
    waitForEvent(event: string, optionsOrPredicate?: any): Promise<any>;
    storageState(options?: any): Promise<any>;
    tracing: {
      start(options?: any): Promise<void>;
      stop(options?: any): Promise<void>;
    };
  }

  export interface Browser {
    newContext(options?: any): Promise<BrowserContext>;
    newPage(options?: any): Promise<Page>;
    contexts(): BrowserContext[];
    close(): Promise<void>;
    isConnected(): boolean;
    version(): string;
  }

  export function test(title: string, testFunction: ({ page }: { page: Page }) => Promise<void>): void;
  export function test(title: string, testFunction: ({ page, context }: { page: Page; context: BrowserContext }) => Promise<void>): void;
  export function test(title: string, testFunction: ({ page, context, browser }: { page: Page; context: BrowserContext; browser: Browser }) => Promise<void>): void;
  
  export const expect: {
    (actual: any): {
      toBe(expected: any): Promise<void>;
      toEqual(expected: any): Promise<void>;
      toContain(expected: any): Promise<void>;
      toHaveLength(expected: number): Promise<void>;
      toBeVisible(): Promise<void>;
      toBeHidden(): Promise<void>;
      toBeEnabled(): Promise<void>;
      toBeDisabled(): Promise<void>;
      toBeChecked(): Promise<void>;
      toHaveText(expected: string | RegExp | (string | RegExp)[]): Promise<void>;
      toHaveValue(expected: string | RegExp): Promise<void>;
      toHaveAttribute(name: string, value?: string | RegExp): Promise<void>;
      toHaveClass(expected: string | RegExp | (string | RegExp)[]): Promise<void>;
      toHaveCSS(name: string, value: string | RegExp): Promise<void>;
      toHaveCount(count: number): Promise<void>;
      toHaveURL(url: string | RegExp): Promise<void>;
      toHaveTitle(title: string | RegExp): Promise<void>;
      toHaveScreenshot(name?: string | string[], options?: any): Promise<void>;
      not: any;
    };
  };

  export function describe(title: string, callback: () => void): void;
  export function beforeAll(callback: () => void | Promise<void>): void;
  export function afterAll(callback: () => void | Promise<void>): void;
  export function beforeEach(callback: () => void | Promise<void>): void;
  export function afterEach(callback: () => void | Promise<void>): void;
}

// Axe accessibility testing types
declare module 'axe-core' {
  export interface AxeResults {
    violations: AxeViolation[];
    passes: AxeResult[];
    incomplete: AxeResult[];
    inapplicable: AxeResult[];
    timestamp: string;
    url: string;
  }

  export interface AxeViolation extends AxeResult {
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
  }

  export interface AxeResult {
    id: string;
    description: string;
    help: string;
    helpUrl: string;
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
    tags: string[];
    nodes: AxeResultNode[];
  }

  export interface AxeResultNode {
    html: string;
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
    target: string[];
    xpath?: string[];
    ancestry?: string[];
    any: AxeResultCheck[];
    all: AxeResultCheck[];
    none: AxeResultCheck[];
    failureSummary?: string;
  }

  export interface AxeResultCheck {
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    message: string;
    data: any;
    relatedNodes?: AxeResultRelatedNode[];
  }

  export interface AxeResultRelatedNode {
    target: string[];
    html: string;
  }

  export interface RunOptions {
    runOnly?: string | string[] | { type: 'rule' | 'tag'; values: string[] };
    rules?: { [ruleId: string]: { enabled: boolean } };
    reporter?: 'v1' | 'v2' | 'raw' | 'raw-env' | 'no-passes';
    resultTypes?: ('violations' | 'incomplete' | 'inapplicable' | 'passes')[];
    selectors?: boolean;
    ancestry?: boolean;
    xpath?: boolean;
    absolutePaths?: boolean;
    iframes?: boolean;
    elementRef?: boolean;
    frameWaitTime?: number;
    preload?: boolean;
    performanceTimer?: boolean;
  }

  export function run(context?: any, options?: RunOptions): Promise<AxeResults>;
  export function configure(spec: any): void;
  export function reset(): void;
}

declare module 'axe-playwright' {
  export function injectAxe(page: import('@playwright/test').Page): Promise<void>;
  export function checkA11y(
    page: import('@playwright/test').Page,
    context?: any,
    options?: import('axe-core').RunOptions,
    skipFailures?: boolean
  ): Promise<void>;
  export function getViolations(
    page: import('@playwright/test').Page,
    context?: any,
    options?: import('axe-core').RunOptions
  ): Promise<import('axe-core').AxeViolation[]>;
}

// Mock service worker types
declare module 'msw' {
  export interface RestHandler {
    info: {
      header: string;
      path: string;
      method: string;
    };
  }

  export interface GraphQLHandler {
    info: {
      header: string;
      operationType: 'query' | 'mutation' | 'subscription';
      operationName: string;
    };
  }

  export type RequestHandler = RestHandler | GraphQLHandler;

  export function setupServer(...handlers: RequestHandler[]): {
    listen: (options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }) => void;
    close: () => void;
    use: (...handlers: RequestHandler[]) => void;
    restoreHandlers: () => void;
    resetHandlers: (...handlers: RequestHandler[]) => void;
  };

  export const rest: {
    get: (path: string, resolver: any) => RestHandler;
    post: (path: string, resolver: any) => RestHandler;
    put: (path: string, resolver: any) => RestHandler;
    patch: (path: string, resolver: any) => RestHandler;
    delete: (path: string, resolver: any) => RestHandler;
    head: (path: string, resolver: any) => RestHandler;
    options: (path: string, resolver: any) => RestHandler;
  };

  export const graphql: {
    query: (operationName: string, resolver: any) => GraphQLHandler;
    mutation: (operationName: string, resolver: any) => GraphQLHandler;
    subscription: (operationName: string, resolver: unknown) => GraphQLHandler;
  };
}

export {};