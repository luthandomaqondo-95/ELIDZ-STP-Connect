import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types';

class OpportunityServiceClass {
	async getOpportunities(filter?: string, search?: string): Promise<Opportunity[]> {
		console.log('OpportunityService.getOpportunities called with filter:', filter, 'search:', search);

		let query = supabase
			.from('opportunities')
			.select('*, posted_by(organization, name)')
			.eq('status', 'active');

		if (filter && filter !== 'All') {
			query = query.eq('type', filter);
		}

		if (search) {
			query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
		}

		const { data, error } = await query;
		if (error) {
			console.error('OpportunityService.getOpportunities error:', JSON.stringify(error, null, 2));
			// Handle cases where posted_by might not be found gracefully
			if (error.code === 'PGRST116') {
				console.warn('OpportunityService.getOpportunities: Join with posted_by failed for some rows, returning partial data.');
				const { data: fallbackData, error: fallbackError } = await supabase
					.from('opportunities')
					.select('*')
					.eq('status', 'active');
				if (fallbackError) throw fallbackError;
				return (fallbackData || []).map((item: any) => ({
					...item,
					org: 'ELIDZ',
					postedByDetails: null
				})) as Opportunity[];
			}
			throw error;
		}

		return (data || []).map((item: any) => ({
			...item,
			org: item.posted_by?.organization || 'ELIDZ',
			postedByDetails: item.posted_by
		})) as Opportunity[];
	}

	async getOpportunityById(id: string): Promise<Opportunity | null> {
		console.log('OpportunityService.getOpportunityById called for id:', id);

		const { data, error } = await supabase
			.from('opportunities')
			.select('*, posted_by(organization, name)')
			.eq('id', id)
			.single();

		if (error) {
			console.error('OpportunityService.getOpportunityById error:', JSON.stringify(error, null, 2));
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return {
			...data,
			org: data.posted_by?.organization || 'ELIDZ',
			postedByDetails: data.posted_by
		} as Opportunity;
	}

	async createOpportunity(opportunityData: Partial<Opportunity>): Promise<Opportunity> {
		console.log('OpportunityService.createOpportunity called');

		const { data, error } = await supabase
			.from('opportunities')
			.insert(opportunityData)
			.select()
			.single();

		if (error) {
			console.error('OpportunityService.createOpportunity error:', JSON.stringify(error, null, 2));
			throw error;
		}

		return data as Opportunity;
	}
}

export const OpportunityService = new OpportunityServiceClass();
