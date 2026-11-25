import * as TrackingTransparency from 'expo-tracking-transparency';

export function getTrackingPermissionsAsync() {
  return TrackingTransparency.getTrackingPermissionsAsync();
}

export function requestTrackingPermissionsAsync() {
  return TrackingTransparency.requestTrackingPermissionsAsync();
}
