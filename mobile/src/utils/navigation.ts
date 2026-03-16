import { router } from 'expo-router';

/**
 * Navigate back from auth screens: dismiss if possible, otherwise replace to auth root.
 * Use consistently so back behavior is the same across login, signup, forgot-password, etc.
 */
export function authBack(): void {
  if (router.canDismiss()) {
    router.dismiss();
  } else {
    router.replace('/(auth)');
  }
}
