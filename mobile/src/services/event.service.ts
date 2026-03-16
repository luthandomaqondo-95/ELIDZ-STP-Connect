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

    const all = await this.getAllEvents();
    const now = new Date().toISOString();
    const upcoming = all
      .filter((e) => e.date >= now)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, limit);

    console.log('EventService.getUpcomingEvents succeeded:', upcoming.length, 'upcoming of', all.length, 'total');
    return upcoming;
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

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('EventService.getEventById error:', error);
      throw error;
    }
    return data as Event | null;
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
