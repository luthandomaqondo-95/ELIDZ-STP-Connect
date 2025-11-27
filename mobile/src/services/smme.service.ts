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

		// Fetch all verified SMMEs from profiles table (new method) or from verifications table (old method)
		let query = supabase
			.from('profiles')
			.select('*')
			.eq('role', 'SMME')
			.order('name', { ascending: true });

        // Check for verified status in profiles OR existence in sme_verifications
        // Since Supabase doesn't support complex OR across joined tables easily in one go for this specific logic without views,
        // we'll fetch all SMMEs and filter in memory or fetch verified IDs first.
        // Better approach: Get profiles that are EITHER verified in profiles table OR have a verified record in sme_verifications.
        
        // 1. Get IDs from sme_verifications
		const { data: verifications } = await supabase
			.from('sme_verifications')
			.select('user_id')
			.eq('status', 'verified');
        
        const verifiedIds = new Set(verifications?.map(v => v.user_id) || []);

        if (search) {
			query = query.or(`name.ilike.%${search}%,organization.ilike.%${search}%,bio.ilike.%${search}%`);
		}

		const { data: profiles, error: profilesError } = await query;

		if (profilesError) {
			console.error('SMMEService.getAllSMMEsWithServicesProducts profiles error:', JSON.stringify(profilesError, null, 2));
			throw profilesError;
		}

        // Filter for verified status
        const verifiedProfiles = (profiles || []).filter(p => 
            p.verification_status === 'verified' || verifiedIds.has(p.id)
        );

		if (verifiedProfiles.length === 0) {
			console.log('SMMEService.getAllSMMEsWithServicesProducts: No verified SMMEs found');
			
            // RETURN DUMMY DATA AS FAILOVER
            if (!search) {
                return this.getDummySMMEs();
            }
			return [];
		}

		const smmmeIds = verifiedProfiles.map(p => p.id);
		const { data: servicesProducts, error: spError } = await supabase
			.from('sme_services_products')
			.select('*')
			.in('sme_id', smmmeIds) // Database column is still sme_id
			.eq('status', 'active');

		if (spError) {
			console.error('SMMEService.getAllSMMEsWithServicesProducts services/products error:', JSON.stringify(spError, null, 2));
			// Don't throw, just return profiles without services
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

		const result: SMMEWithServicesProducts[] = verifiedProfiles.map((profile: Profile) => {
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

    getDummySMMEs(): SMMEWithServicesProducts[] {
        return [
            {
                id: 'dummy-1',
                name: 'TechSolutions Ltd',
                email: 'contact@techsolutions.co.za',
                role: 'SMME',
                organization: 'Technology',
                bio: 'Leading provider of software development and IT consulting services in the ELIDZ.',
                avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
                verification_status: 'verified',
                created_at: new Date().toISOString(),
                services: [
                    {
                        id: 's1',
                        sme_id: 'dummy-1',
                        type: 'Service',
                        name: 'Custom Software Development',
                        description: 'Tailored software solutions for businesses.',
                        category: 'Technology',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ],
                products: []
            },
            {
                id: 'dummy-2',
                name: 'GreenLeaf Agro',
                email: 'info@greenleaf.co.za',
                role: 'SMME',
                organization: 'Agriculture',
                bio: 'Sustainable agricultural products and consulting.',
                avatar: 'https://images.unsplash.com/photo-1628359355624-855775b5c9c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
                verification_status: 'verified',
                created_at: new Date().toISOString(),
                services: [],
                products: [
                    {
                        id: 'p1',
                        sme_id: 'dummy-2',
                        type: 'Product',
                        name: 'Organic Fertilizer',
                        description: 'High-yield organic fertilizer for commercial farming.',
                        category: 'Agriculture',
                        price: 'R500',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]
            },
            {
                id: 'dummy-3',
                name: 'Precision Engineering',
                email: 'sales@precisioneng.co.za',
                role: 'SMME',
                organization: 'Manufacturing',
                bio: 'Specialized precision engineering components for automotive industry.',
                avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
                verification_status: 'verified',
                created_at: new Date().toISOString(),
                services: [
                    {
                        id: 's2',
                        sme_id: 'dummy-3',
                        type: 'Service',
                        name: 'CNC Machining',
                        description: 'High-precision CNC machining services.',
                        category: 'Manufacturing',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ],
                products: []
            }
        ];
    }

}

export const smmmeService = new SMMEService();
