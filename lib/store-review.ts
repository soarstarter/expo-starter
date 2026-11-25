import * as StoreReview from 'expo-store-review';

export function hasStoreReviewAction() {
  return StoreReview.hasAction();
}

export function requestStoreReview() {
  return StoreReview.requestReview();
}
