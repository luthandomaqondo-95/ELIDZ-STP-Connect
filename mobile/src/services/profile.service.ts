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
}

export const profileService = new ProfileService();
