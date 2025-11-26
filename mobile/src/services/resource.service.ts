import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';
import { Feather } from '@expo/vector-icons';

export interface ServiceResource {
	id: string;
	name: string;
	description?: string;
	icon: keyof typeof Feather.glyphMap;
	available: number;
	category: string;
	targetCategory: string;
}

function getResourceIcon(type: string): keyof typeof Feather.glyphMap {
	const typeLower = type.toLowerCase();
	if (typeLower.includes('document') || typeLower.includes('pdf')) return 'file-text';
	if (typeLower.includes('video')) return 'video';
	if (typeLower.includes('link') || typeLower.includes('url')) return 'link';
	return 'file';
}

class ResourceServiceClass {
	async getResources(): Promise<Resource[]> {
		console.log('ResourceService.getResources called');

		const { data, error } = await supabase
			.from('resources')
			.select('*')
			.order('title', { ascending: true });

		if (error) {
			console.error('ResourceService.getResources error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ResourceService.getResources succeeded:', data?.length || 0, 'resources');
		return (data || []) as Resource[];
	}

	async getServicesResources(search?: string): Promise<ServiceResource[]> {
		console.log('ResourceService.getServicesResources called', { search });
		let query = supabase
			.from('resources')
			.select('*')
			.order('title', { ascending: true });

		if (search) {
			query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
		}

		const { data, error } = await query;

		if (error) {
			console.error('ResourceService.getServicesResources error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ResourceService.getServicesResources succeeded:', data?.length || 0, 'resources');
		return (data || []).map(item => ({
			id: item.id,
			name: item.title,
			description: item.description,
			icon: getResourceIcon(item.type),
			available: Math.floor(Math.random() * 10) + 1, // Mock availability for now
			category: item.category || 'General',
			targetCategory: item.category || 'General',
		}));
	}

	async createResource(resourceData: Partial<Resource>): Promise<Resource> {
		console.log('ResourceService.createResource called');

		const { data, error } = await supabase
			.from('resources')
			.insert(resourceData)
			.select()
			.single();

		if (error) {
			console.error('ResourceService.createResource error:', JSON.stringify(error, null, 2));
			throw error;
		}

		return data as Resource;
	}
}

export const ResourceService = new ResourceServiceClass();
