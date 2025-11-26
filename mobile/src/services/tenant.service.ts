import { supabase } from '@/lib/supabase';
import { Tenant } from '@/types';

class TenantService {
  async getTenants(limit?: number, search?: string): Promise<Tenant[]> {
    console.log('TenantService.getTenants called', { limit, search });

    let query = supabase
      .from('tenants')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('TenantService.getTenants error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('TenantService.getTenants succeeded:', data?.length || 0, 'tenants');
    return (data || []) as Tenant[];
  }

  async getCentersOfExcellence(search?: string): Promise<Tenant[]> {
    console.log('TenantService.getCentersOfExcellence called', { search });
    let query = supabase
      .from('tenants')
      .select('*')
      .or('name.ilike.%lab%,name.ilike.%centre%,name.ilike.%hub%,name.ilike.%incubator%,name.ilike.%energy%')
      .order('name', { ascending: true });

    if (search) {
       // We need to combine the OR conditions. Since we already have an OR for types, we should append search as AND.
       // Supabase doesn't easily chain ORs and ANDs in this fluent way without careful constructing.
       // However, we can use client side filtering or try to construct a complex filter string.
       // For simplicity, let's filter by search term on the returned data if we can't easily chain, 
       // OR assume the search is more specific.
       // Let's try adding another ilike filter which acts as AND.
       query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('TenantService.getCentersOfExcellence error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('TenantService.getCentersOfExcellence succeeded:', data?.length || 0, 'centers');
    return data || [];
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    console.log('TenantService.getTenantById called for id:', id);

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('TenantService.getTenantById error:', JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Tenant;
  }
}

export const tenantService = new TenantService();
