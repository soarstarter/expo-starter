export async function getTrackingPermissionsAsync() {
  return {
    canAskAgain: false,
    expires: 'never' as const,
    granted: true,
    status: 'granted' as const,
  };
}

export async function requestTrackingPermissionsAsync() {
  return getTrackingPermissionsAsync();
}
