import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

class ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    console.log('ProfileService.getProfile called for userId:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist
        console.log('ProfileService.getProfile: Profile not found');
        return null;
      }
      console.error('ProfileService.getProfile error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('ProfileService.getProfile succeeded');
    return data as Profile;
  }

  async createProfile(userId: string, profileData: {
    name: string;
    email: string;
    role: Profile['role'];
    organization?: string;
    bio?: string;
    avatar?: string;
    address?: string;
  }): Promise<Profile> {
    console.log('ProfileService.createProfile called with:', profileData);

    // First, try direct insert
    let { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
      })
      .select()
      .single();

    // If RLS blocks it, use the database function instead
    if (error && error.code === '42501') {
      console.log('ProfileService.createProfile: RLS blocked, trying function...');
      
      const { data: functionData, error: functionError } = await supabase
        .rpc('create_user_profile', {
          p_user_id: userId,
          p_name: profileData.name,
          p_email: profileData.email,
          p_role: profileData.role,
          p_address: profileData.address || null,
          p_organization: profileData.organization || null,
          p_bio: profileData.bio || null,
          p_avatar: profileData.avatar || 'blue',
        });

      if (functionError) {
        console.error('ProfileService.createProfile function error:', JSON.stringify(functionError, null, 2));
        throw functionError;
      }

      console.log('ProfileService.createProfile succeeded via function:', functionData);
      return functionData as Profile;
    }

    if (error) {
      console.error('ProfileService.createProfile error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('ProfileService.createProfile succeeded:', data);
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    console.log('ProfileService.updateProfile called for userId:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('ProfileService.updateProfile error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('ProfileService.updateProfile succeeded:', data);
    return data as Profile;
  }

  /**
   * Upload a profile picture to Supabase Storage
   * @param fileUri - Local file URI from the device
   * @param userId - User ID for organizing files
   * @returns Public URL of the uploaded image
   */
  async uploadProfilePicture(fileUri: string, userId: string): Promise<string> {
    try {
      console.log('ProfileService.uploadProfilePicture called for userId:', userId);

      // Get file extension from URI
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const fileName = `avatar_${timestamp}.${fileExtension}`;
      // File path should NOT include bucket name - just the folder structure
      const filePath = `${userId}/${fileName}`;

      // Read the file
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Convert blob to ArrayBuffer for Supabase
      const arrayBuffer = await new Response(blob).arrayBuffer();
  
      // Determine content type
      const contentType = this.getContentType(fileExtension);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: true // Allow overwriting existing avatar
        });

      if (error) {
        console.error('ProfileService.uploadProfilePicture storage error:', error);
        throw new Error(`Failed to upload profile picture: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded profile picture');
      }

      console.log('ProfileService.uploadProfilePicture succeeded:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('ProfileService.uploadProfilePicture error:', error);
      throw new Error(error.message || 'Failed to upload profile picture. Please try again.');
    }
  }

  /**
   * Get the appropriate content type for a file extension
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    };
    return contentTypes[extension] || 'image/jpeg';
  }
}

export const profileService = new ProfileService();
