import { supabase } from '@/lib/supabase';

class ProfileService {
  /**
   * Upload a profile picture to the public `profile-avatars` bucket
   * and return a storage reference string that `useAvatarUri` understands.
   *
   * The returned value has the form: "storage:profile-avatars/<userId>/<filename>".
   */
  async uploadProfilePicture(localUri: string, userId: string): Promise<string> {
    try {
      // Fetch the file data from the local URI as ArrayBuffer (React Native / Expo-safe)
      const response = await fetch(localUri);
      const arrayBuffer = await response.arrayBuffer();

      // Try to infer a file extension from the URI; default to jpg
      const uriParts = localUri.split('?')[0].split('.');
      const ext = uriParts.length > 1 ? uriParts[uriParts.length - 1] : 'jpg';

      const filePath = `${userId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        });

      if (error) {
        console.error('ProfileService.uploadProfilePicture storage error:', error);
        throw new Error(error.message || 'Failed to upload profile picture');
      }

      // Store as a storage reference so useAvatarUri can resolve it to a public URL
      return `storage:profile-avatars/${filePath}`;
    } catch (err: any) {
      console.error('ProfileService.uploadProfilePicture error:', err);
      throw new Error(err.message || 'Failed to upload profile picture');
    }
  }
}

export const profileService = new ProfileService();

