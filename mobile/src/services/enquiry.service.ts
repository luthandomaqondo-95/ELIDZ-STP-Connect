import { supabase } from '@/lib/supabase';
import { shouldUseBff, mobileApi } from '@/lib/mobile-api';

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
  async createEnquiry(data: CreateEnquiryData): Promise<Enquiry> {
    if (shouldUseBff()) {
      const res = await mobileApi<{ enquiry: Enquiry }>('/api/mobile/enquiries', {
        method: 'POST',
        body: data,
      });
      return res.enquiry;
    }

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

  async getUserEnquiries(userId: string): Promise<Enquiry[]> {
    if (shouldUseBff()) {
      // Server always scopes to the authenticated user — ignore client userId for authz
      const res = await mobileApi<{ enquiries: Enquiry[] }>('/api/mobile/enquiries');
      return res.enquiries;
    }

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

  async getEnquiryById(enquiryId: string): Promise<Enquiry | null> {
    if (shouldUseBff()) {
      try {
        const res = await mobileApi<{ enquiry: Enquiry }>(`/api/mobile/enquiries/${enquiryId}`);
        return res.enquiry;
      } catch (e: any) {
        if (e?.status === 404) return null;
        throw e;
      }
    }

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', enquiryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('EnquiryService.getEnquiryById error:', error);
      throw new Error(error.message || 'Failed to fetch enquiry');
    }

    return data as Enquiry;
  }
}

export const enquiryService = new EnquiryService();
