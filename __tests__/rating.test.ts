import { recordRatingTrigger, requestReviewNow } from '@/lib/rating';
import { hasStoreReviewAction, requestStoreReview } from '@/lib/store-review';
import { createMemoryCache } from '@/test/helpers/memory-cache';

const mockCache = createMemoryCache();

jest.mock('@/lib/cache', () => ({
  getCacheJson: (key: string) => mockCache.getCacheJson(key),
  setCacheJson: (key: string, value: unknown) => mockCache.setCacheJson(key, value),
}));
jest.mock('@/lib/app-version', () => ({ CURRENT_APP_VERSION: '1.2.0' }));
jest.mock('@/lib/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn() } }));
jest.mock('@/lib/store-review', () => ({
  hasStoreReviewAction: jest.fn(),
  requestStoreReview: jest.fn(),
}));

const RATING_KEY = 'growth.rating.v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const hasAction = jest.mocked(hasStoreReviewAction);
const requestReview = jest.mocked(requestStoreReview);

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCache.store.clear();
  hasAction.mockResolvedValue(true);
  requestReview.mockResolvedValue(undefined);
});

describe('recordRatingTrigger', () => {
  it('waits for three qualifying actions before asking', async () => {
    expect(await recordRatingTrigger('a')).toBe(false);
    expect(await recordRatingTrigger('b')).toBe(false);
    expect(mockCache.store.get(RATING_KEY)).toEqual({ actionCount: 2 });
    expect(requestReview).not.toHaveBeenCalled();

    expect(await recordRatingTrigger('c')).toBe(true);
    expect(requestReview).toHaveBeenCalledTimes(1);
    expect(mockCache.store.get(RATING_KEY)).toMatchObject({
      actionCount: 0,
      lastPromptedVersion: '1.2.0',
    });
  });

  it('does not ask twice for the same app version', async () => {
    mockCache.store.set(RATING_KEY, {
      actionCount: 5,
      lastPromptedAt: daysAgo(200),
      lastPromptedVersion: '1.2.0',
    });
    expect(await recordRatingTrigger('again')).toBe(false);
    expect(requestReview).not.toHaveBeenCalled();
    expect(mockCache.store.get(RATING_KEY)).toMatchObject({ actionCount: 6 });
  });

  it('waits 90 days after the last prompt even on a new version', async () => {
    mockCache.store.set(RATING_KEY, {
      actionCount: 5,
      lastPromptedAt: daysAgo(30),
      lastPromptedVersion: '1.1.0',
    });
    expect(await recordRatingTrigger('too-soon')).toBe(false);

    mockCache.store.set(RATING_KEY, {
      actionCount: 5,
      lastPromptedAt: daysAgo(91),
      lastPromptedVersion: '1.1.0',
    });
    expect(await recordRatingTrigger('later')).toBe(true);
  });

  it('does not ask when the store has no review action', async () => {
    hasAction.mockResolvedValue(false);
    mockCache.store.set(RATING_KEY, { actionCount: 10 });
    expect(await recordRatingTrigger('no-store')).toBe(false);
    expect(requestReview).not.toHaveBeenCalled();
  });

  it('reports failure instead of throwing when the store request fails', async () => {
    requestReview.mockRejectedValueOnce(new Error('unavailable'));
    mockCache.store.set(RATING_KEY, { actionCount: 2 });
    await expect(recordRatingTrigger('boom')).resolves.toBe(false);
  });
});

describe('requestReviewNow', () => {
  it('asks right away and resets the counter', async () => {
    mockCache.store.set(RATING_KEY, { actionCount: 1 });
    expect(await requestReviewNow()).toBe(true);
    expect(requestReview).toHaveBeenCalledTimes(1);
    expect(mockCache.store.get(RATING_KEY)).toMatchObject({
      actionCount: 0,
      lastPromptedVersion: '1.2.0',
    });
  });

  it('does nothing when the store has no review action', async () => {
    hasAction.mockResolvedValue(false);
    expect(await requestReviewNow()).toBe(false);
    expect(requestReview).not.toHaveBeenCalled();
    expect(mockCache.store.has(RATING_KEY)).toBe(false);
  });
});
