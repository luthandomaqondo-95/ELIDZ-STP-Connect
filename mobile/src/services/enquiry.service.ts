import { supabase } from '@/lib/supabase';

export interface Enquiry {
  id: string;
  user_id: string | null;
  enquiry_type: 'Product Line' | 'Facility' | 'Tenant' | 'General' | 'Opportunity' | 'Other';
  subject: string;
  message: string;
  related_facility_id?: string | null;
  related_tenant_id?: string | null;
  related_opportunity_id?: string | null;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  response?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEnquiryData {
  enquiry_type: Enquiry['enquiry_type'];
  subject: string;
  message: string;
  related_facility_id?: string;
  related_tenant_id?: string;
  related_opportunity_id?: string;
}

class EnquiryService {
  /**
   * Create a new enquiry
   */
  async createEnquiry(data: CreateEnquiryData): Promise<Enquiry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to submit an enquiry');
    }

    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert({
        user_id: user.id,
        enquiry_type: data.enquiry_type,
        subject: data.subject,
        message: data.message,
        related_facility_id: data.related_facility_id || null,
        related_tenant_id: data.related_tenant_id || null,
        related_opportunity_id: data.related_opportunity_id || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('EnquiryService.createEnquiry error:', error);
      throw new Error(error.message || 'Failed to submit enquiry');
    }

    return enquiry as Enquiry;
  }

  /**
   * Get user's enquiries
   */
  async getUserEnquiries(userId: string): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('EnquiryService.getUserEnquiries error:', error);
      throw new Error(error.message || 'Failed to fetch enquiries');
    }

    return (data || []) as Enquiry[];
  }

  /**
   * Get a specific enquiry by ID
   */
  async getEnquiryById(enquiryId: string): Promise<Enquiry | null> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', enquiryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('EnquiryService.getEnquiryById error:', error);
      throw new Error(error.message || 'Failed to fetch enquiry');
    }

    return data as Enquiry;
  }
}

export const enquiryService = new EnquiryService();

