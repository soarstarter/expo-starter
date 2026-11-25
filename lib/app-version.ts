import Constants from 'expo-constants';

export const CURRENT_APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.0';

function parseVersion(version: string) {
  return version
    .split(/[.-]/)
    .slice(0, 3)
    .map((part) => {
      const parsed = Number.parseInt(part.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    });
}

export function compareAppVersions(a: string, b: string) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  const length = Math.max(left.length, right.length, 3);

  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index] ?? 0;
    const rightPart = right[index] ?? 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}
