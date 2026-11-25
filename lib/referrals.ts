import Constants from 'expo-constants';
import { Share } from 'react-native';

import { createAppLink } from '@/lib/deep-links';

export function getInviteLink(): string {
  return createAppLink('/');
}

/** The app's display name from `app.config.ts`, so the share sheet follows a rename. */
function getAppName(): string {
  return Constants.expoConfig?.name?.trim() || 'this app';
}

export async function shareInviteLink() {
  const inviteLink = getInviteLink();
  await Share.share({
    title: `Join me on ${getAppName()}`,
    message: `Check out this app: ${inviteLink}`,
    url: inviteLink,
  });
}
