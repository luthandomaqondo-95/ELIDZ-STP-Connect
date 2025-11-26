import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  organizer_id?: string;
  image_url?: string;
  registration_url?: string;
  created_at: string;
  updated_at: string;
}

class EventServiceClass {
  async getUpcomingEvents(limit = 5): Promise<Event[]> {
    console.log('EventService.getUpcomingEvents called');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('EventService.getUpcomingEvents error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('EventService.getUpcomingEvents succeeded:', data?.length || 0, 'events');
    return (data || []) as Event[];
  }

  async getAllEvents(): Promise<Event[]> {
    console.log('EventService.getAllEvents called');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('EventService.getAllEvents error:', JSON.stringify(error, null, 2));
      throw error;
    }

    return (data || []) as Event[];
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    console.log('EventService.createEvent called');

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('EventService.createEvent error:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data as Event;
  }
}

export const EventService = new EventServiceClass();
