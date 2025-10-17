/**
 * Helpers for working with next-intl message objects in a type-safe way.
 */

import type { AbstractIntlMessages } from 'next-intl';
import { isValidArray, isValidObject, isNonEmptyString } from './type-guards';

/**
 * Narrowly typed record utility used when traversing JSON-like structures.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return isValidObject(value);
}

function getNestedValue(
  source: AbstractIntlMessages,
  path: readonly string[]
): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    return current[segment];
  }, source);
}

export function getMessageValue<T>(
  messages: AbstractIntlMessages,
  path: readonly string[],
  guard: (value: unknown) => value is T
): T | null {
  const value = getNestedValue(messages, path);
  return guard(value) ? value : null;
}

export function getMessageArray<T>(
  messages: AbstractIntlMessages,
  path: readonly string[],
  itemGuard: (value: unknown) => value is T
): T[] {
  const value = getNestedValue(messages, path);

  if (!isValidArray(value)) {
    return [];
  }

  return value.filter(itemGuard);
}

export function getStringArray(
  messages: AbstractIntlMessages,
  path: readonly string[]
): string[] {
  return getMessageArray(messages, path, isNonEmptyString);
}
