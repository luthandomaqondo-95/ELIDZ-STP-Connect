import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types';

class OpportunityServiceClass {
	async getOpportunities(filter?: string, search?: string): Promise<Opportunity[]> {
		console.log('OpportunityService.getOpportunities called with filter:', filter, 'search:', search);

		let query = supabase
			.from('opportunities')
			.select('*, posted_by(organization, name)')
			.eq('status', 'active')
			.order('created_at', { ascending: false });

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
					.eq('status', 'active')
					.order('created_at', { ascending: false });
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

	async applyToOpportunity(opportunityId: string, coverLetter?: string): Promise<{ id: string }> {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			throw new Error('You must be logged in to apply for an opportunity');
		}

		const { data, error } = await supabase
			.from('applications')
			.insert({
				opportunity_id: opportunityId,
				applicant_id: user.id,
				cover_letter: coverLetter || null,
				status: 'pending',
			})
			.select('id')
			.single();

		if (error) {
			console.error('OpportunityService.applyToOpportunity error:', JSON.stringify(error, null, 2));
			if (error.code === '23505') {
				throw new Error('You have already applied for this opportunity.');
			}
			if (error.code === '22P02') {
				throw new Error('Invalid opportunity selected. Please try again from the opportunities list.');
			}
			throw new Error(error.message || 'Failed to submit application');
		}

		return data as { id: string };
	}

	/**
	 * Get recommended opportunities for a user
	 */
	async getRecommendedOpportunities(userId: string, limit = 5): Promise<Opportunity[]> {
		// Import here to avoid circular dependency
		const { recommendationService } = await import('./recommendation.service');
		const { profileService } = await import('./profile.service');

		// Get user profile
		const user = await profileService.getProfile(userId);
		if (!user) {
			return [];
		}

		// Get all active opportunities
		const allOpportunities = await this.getOpportunities();

		// Get recommendations
		const recommendations = recommendationService.getRecommendedOpportunities(user, allOpportunities, limit);

		return recommendations.map(r => r.opportunity);
	}
}

export const OpportunityService = new OpportunityServiceClass();
