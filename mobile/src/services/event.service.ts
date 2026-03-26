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

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
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
      .order('created_at', { ascending: false });

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

  private async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(error.message || 'Failed to resolve current user');
    }

    if (!data.user?.id) {
      throw new Error('You must be logged in to RSVP');
    }

    return data.user.id;
  }

  async hasUserRsvped(eventId: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();

    const { data, error } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to check RSVP status');
    }

    return !!data;
  }

  async rsvpToEvent(eventId: string): Promise<EventRsvp> {
    const userId = await this.getCurrentUserId();

    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
        },
        {
          onConflict: 'event_id,user_id',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to RSVP to event');
    }

    return data as EventRsvp;
  }

  async cancelRsvp(eventId: string): Promise<void> {
    const userId = await this.getCurrentUserId();

    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to cancel RSVP');
    }
  }
}

export const EventService = new EventServiceClass();
