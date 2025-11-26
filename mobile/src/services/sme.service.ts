import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export interface SMEServiceProduct {
	id: string;
	sme_id: string;
	type: 'Service' | 'Product';
	name: string;
	description: string;
	category: string;
	price?: string;
	image_url?: string;
	contact_email?: string;
	contact_phone?: string;
	website_url?: string;
	status: 'active' | 'inactive' | 'pending';
	created_at: string;
	updated_at: string;
}

export interface SMEWithServicesProducts extends Profile {
	services: SMEServiceProduct[];
	products: SMEServiceProduct[];
}

class SMEService {
	async getServicesProducts(smeId?: string): Promise<SMEServiceProduct[]> {
		console.log('SMEService.getServicesProducts called with smeId:', smeId);

		let query = supabase
			.from('sme_services_products')
			.select('*')
			.eq('status', 'active');

		if (smeId) {
			query = query.eq('sme_id', smeId);
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) {
			console.error('SMEService.getServicesProducts error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('SMEService.getServicesProducts succeeded:', data?.length || 0, 'items');
		return data || [];
	}

	async getServicesProductsBySME(smeId: string): Promise<{ services: SMEServiceProduct[]; products: SMEServiceProduct[] }> {
		console.log('SMEService.getServicesProductsBySME called with smeId:', smeId);

		const all = await this.getServicesProducts(smeId);
		const services = all.filter(item => item.type === 'Service');
		const products = all.filter(item => item.type === 'Product');

		return { services, products };
	}

	async createServiceProduct(smeId: string, data: {
		type: 'Service' | 'Product';
		name: string;
		description: string;
		category: string;
		price?: string;
		image_url?: string;
		contact_email?: string;
		contact_phone?: string;
		website_url?: string;
	}): Promise<SMEServiceProduct> {
		console.log('SMEService.createServiceProduct called for smeId:', smeId, 'with data:', data);

		const { data: result, error } = await supabase
			.from('sme_services_products')
			.insert({
				sme_id: smeId,
				...data,
				status: 'active',
			})
			.select()
			.single();

		if (error) {
			console.error('SMEService.createServiceProduct error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('SMEService.createServiceProduct succeeded:', result);
		return result;
	}

	async getAllSMEsWithServicesProducts(search?: string): Promise<SMEWithServicesProducts[]> {
		console.log('SMEService.getAllSMEsWithServicesProducts called', { search });

		let query = supabase
			.from('profiles')
			.select('*')
			.eq('role', 'SME')
			.order('name', { ascending: true });

		if (search) {
			query = query.or(`name.ilike.%${search}%,organization.ilike.%${search}%,bio.ilike.%${search}%`);
		}

		const { data: profiles, error: profilesError } = await query;

		if (profilesError) {
			console.error('SMEService.getAllSMEsWithServicesProducts profiles error:', JSON.stringify(profilesError, null, 2));
			throw profilesError;
		}

		if (!profiles || profiles.length === 0) {
			console.log('SMEService.getAllSMEsWithServicesProducts: No SMEs found');
			return [];
		}

		const smeIds = profiles.map(p => p.id);
		const { data: servicesProducts, error: spError } = await supabase
			.from('sme_services_products')
			.select('*')
			.in('sme_id', smeIds)
			.eq('status', 'active');

		if (spError) {
			console.error('SMEService.getAllSMEsWithServicesProducts services/products error:', JSON.stringify(spError, null, 2));
			throw spError;
		}

		const smeMap = new Map<string, { services: SMEServiceProduct[]; products: SMEServiceProduct[] }>();

		(servicesProducts || []).forEach((item: SMEServiceProduct) => {
			if (!smeMap.has(item.sme_id)) {
				smeMap.set(item.sme_id, { services: [], products: [] });
			}
			const smeData = smeMap.get(item.sme_id)!;
			if (item.type === 'Service') {
				smeData.services.push(item);
			} else {
				smeData.products.push(item);
			}
		});

		const result: SMEWithServicesProducts[] = profiles.map((profile: Profile) => {
			const spData = smeMap.get(profile.id) || { services: [], products: [] };
			return {
				...profile,
				services: spData.services,
				products: spData.products,
			};
		});

		console.log('SMEService.getAllSMEsWithServicesProducts succeeded:', result.length, 'SMEs');
		return result;
	}
}

export const smeService = new SMEService();
