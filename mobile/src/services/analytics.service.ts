import { supabase } from '@/lib/supabase';

export const analyticsService = {
    async recordVisit(entityType: 'service' | 'product' | 'facility' | 'lab', entityId: string, entityName: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase.from('analytics_visits').insert({
                user_id: user?.id || null,
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName,
            });

            if (error) {
                console.error('Error recording visit:', error);
            }
        } catch (error) {
            console.error('Error in recordVisit:', error);
        }
    }
};

