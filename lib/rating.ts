import { CURRENT_APP_VERSION } from '@/lib/app-version';
import { getCacheJson, setCacheJson } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { hasStoreReviewAction, requestStoreReview } from '@/lib/store-review';

const RATING_CACHE_KEY = 'growth.rating.v1';
const MIN_ACTIONS_BEFORE_PROMPT = 3;
const MIN_DAYS_BETWEEN_PROMPTS = 90;

type RatingCache = {
  actionCount: number;
  lastPromptedAt?: string;
  lastPromptedVersion?: string;
};

function daysSince(date: string) {
  const startedAt = Date.parse(date);
  if (Number.isNaN(startedAt)) return Number.POSITIVE_INFINITY;
  return (Date.now() - startedAt) / (1000 * 60 * 60 * 24);
}

async function readRatingCache(): Promise<RatingCache> {
  return (
    (await getCacheJson<RatingCache>(RATING_CACHE_KEY)) ?? {
      actionCount: 0,
    }
  );
}

async function canRequestReview(cache: RatingCache) {
  if (cache.actionCount < MIN_ACTIONS_BEFORE_PROMPT) return false;
  if (cache.lastPromptedVersion === CURRENT_APP_VERSION) return false;
  if (cache.lastPromptedAt && daysSince(cache.lastPromptedAt) < MIN_DAYS_BETWEEN_PROMPTS) {
    return false;
  }
  return hasStoreReviewAction();
}

export async function requestReviewNow() {
  const hasAction = await hasStoreReviewAction();
  if (!hasAction) return false;
  await requestStoreReview();
  await setCacheJson(RATING_CACHE_KEY, {
    actionCount: 0,
    lastPromptedAt: new Date().toISOString(),
    lastPromptedVersion: CURRENT_APP_VERSION,
  } satisfies RatingCache);
  return true;
}

export async function recordRatingTrigger(reason: string) {
  try {
    const cache = await readRatingCache();
    const nextCache: RatingCache = {
      ...cache,
      actionCount: cache.actionCount + 1,
    };

    if (!(await canRequestReview(nextCache))) {
      await setCacheJson(RATING_CACHE_KEY, nextCache);
      return false;
    }

    await requestStoreReview();
    await setCacheJson(RATING_CACHE_KEY, {
      actionCount: 0,
      lastPromptedAt: new Date().toISOString(),
      lastPromptedVersion: CURRENT_APP_VERSION,
    } satisfies RatingCache);
    logger.info('rating.prompt_requested', { reason });
    return true;
  } catch (error) {
    logger.warn('rating.prompt_failed', { reason, error });
    return false;
  }
}
