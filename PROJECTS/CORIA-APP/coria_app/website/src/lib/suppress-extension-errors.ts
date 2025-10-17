/**
 * Suppress harmless browser extension errors
 *
 * Many browser wallet extensions (MetaMask, Backpack, Tron, etc.) try to inject
 * `window.ethereum` and other properties. When multiple extensions compete,
 * they generate console errors that are harmless but noisy.
 *
 * This utility suppresses these known extension-related errors to reduce console noise.
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Patterns to suppress (only in development)
  const suppressPatterns = [
    /Cannot redefine property: ethereum/i,
    /Cannot set property ethereum/i,
    /which has only a getter/i,
    /Backpack couldn't override/i,
    /runtime\.lastError/i,
    /Receiving end does not exist/i,
    /Failed to execute 'observe' on 'MutationObserver'/i,
    /solanaActionsContentScript/i,
    /pageProvider\.js/i,
    /evmAsk\.js/i,
    /inject\.js.*wallet/i,
    /chrome-extension:\/\//i,
    /hpclkefagolihohboafpheddmmgdffjm/i, // Phantom wallet extension ID
  ];

  console.error = (...args: any[]) => {
    const message = args.join(' ');

    // Check if error matches suppression patterns
    if (suppressPatterns.some(pattern => pattern.test(message))) {
      return; // Suppress
    }

    // Pass through other errors
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');

    // Suppress extension-related warnings
    if (suppressPatterns.some(pattern => pattern.test(message))) {
      return; // Suppress
    }

    // Pass through other warnings
    originalWarn.apply(console, args);
  };
}

export {};
