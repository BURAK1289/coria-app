import { test as base } from '@playwright/test';

type TestFixtures = {
  locale: string;
};

export const test = base.extend<TestFixtures>({
  locale: ['tr', { option: true }],
});

export { expect } from '@playwright/test';
