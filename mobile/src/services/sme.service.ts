import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export interface SMMEServiceProduct {
	id: string;
	sme_id: string; // Database column name - keep as sme_id for backward compatibility
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

export interface SMMEWithServicesProducts extends Profile {
	services: SMMEServiceProduct[];
	products: SMMEServiceProduct[];
}

class SMMEService {
	async getServicesProducts(smmmeId?: string): Promise<SMMEServiceProduct[]> {
		console.log('SMMEService.getServicesProducts called with smmmeId:', smmmeId);

		let query = supabase
			.from('sme_services_products')
			.select('*')
			.eq('status', 'active');

		if (smmmeId) {
			query = query.eq('sme_id', smmmeId); // Database column is still sme_id
		}

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) {
			console.error('SMMEService.getServicesProducts error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('SMMEService.getServicesProducts succeeded:', data?.length || 0, 'items');
		return data || [];
	}

	async getServicesProductsBySMME(smmmeId: string): Promise<{ services: SMMEServiceProduct[]; products: SMMEServiceProduct[] }> {
		console.log('SMMEService.getServicesProductsBySMME called with smmmeId:', smmmeId);

		const all = await this.getServicesProducts(smmmeId);
		const services = all.filter(item => item.type === 'Service');
		const products = all.filter(item => item.type === 'Product');

		return { services, products };
	}

	async createServiceProduct(smmmeId: string, data: {
		type: 'Service' | 'Product';
		name: string;
		description: string;
		category: string;
		price?: string;
		image_url?: string;
		contact_email?: string;
		contact_phone?: string;
		website_url?: string;
	}): Promise<SMMEServiceProduct> {
		console.log('SMMEService.createServiceProduct called for smmmeId:', smmmeId, 'with data:', data);

		const { data: result, error } = await supabase
			.from('sme_services_products')
			.insert({
				sme_id: smmmeId, // Database column is still sme_id
				...data,
				status: 'active',
			})
			.select()
			.single();

		if (error) {
			console.error('SMMEService.createServiceProduct error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('SMMEService.createServiceProduct succeeded:', result);
		return result;
	}

	async getAllSMMEsWithServicesProducts(search?: string): Promise<SMMEWithServicesProducts[]> {
		console.log('SMMEService.getAllSMMEsWithServicesProducts called', { search });

		let query = supabase
			.from('profiles')
			.select('*')
			.eq('role', 'SMME')
			.order('name', { ascending: true });

		if (search) {
			query = query.or(`name.ilike.%${search}%,organization.ilike.%${search}%,bio.ilike.%${search}%`);
		}

		const { data: profiles, error: profilesError } = await query;

		if (profilesError) {
			console.error('SMMEService.getAllSMMEsWithServicesProducts profiles error:', JSON.stringify(profilesError, null, 2));
			throw profilesError;
		}

		if (!profiles || profiles.length === 0) {
			console.log('SMMEService.getAllSMMEsWithServicesProducts: No SMMEs found');
			return [];
		}

		const smmmeIds = profiles.map(p => p.id);
		const { data: servicesProducts, error: spError } = await supabase
			.from('sme_services_products')
			.select('*')
			.in('sme_id', smmmeIds) // Database column is still sme_id
			.eq('status', 'active');

		if (spError) {
			console.error('SMMEService.getAllSMMEsWithServicesProducts services/products error:', JSON.stringify(spError, null, 2));
			throw spError;
		}

		const smmmeMap = new Map<string, { services: SMMEServiceProduct[]; products: SMMEServiceProduct[] }>();

		(servicesProducts || []).forEach((item: SMMEServiceProduct) => {
			if (!smmmeMap.has(item.sme_id)) {
				smmmeMap.set(item.sme_id, { services: [], products: [] });
			}
			const smmmeData = smmmeMap.get(item.sme_id)!;
			if (item.type === 'Service') {
				smmmeData.services.push(item);
			} else {
				smmmeData.products.push(item);
			}
		});

		const result: SMMEWithServicesProducts[] = profiles.map((profile: Profile) => {
			const spData = smmmeMap.get(profile.id) || { services: [], products: [] };
			return {
				...profile,
				services: spData.services,
				products: spData.products,
			};
		});

		console.log('SMMEService.getAllSMMEsWithServicesProducts succeeded:', result.length, 'SMMEs');
		return result;
	}
}

export const smmmeService = new SMMEService();
