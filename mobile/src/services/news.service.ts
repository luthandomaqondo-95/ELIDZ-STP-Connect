import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export interface News {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  image_url: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  // Computed fields
  excerpt?: string;
  formattedDate?: string;
  category?: string; // Can be added to DB later
}

class NewsServiceClass {
  async getAllNews(search?: string): Promise<News[]> {
    console.log('NewsService.getAllNews called', { search });

    let query = supabase
      .from('news')
      .select('*, author:profiles(id, name, email)')
      .order('published_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('NewsService.getAllNews error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('NewsService.getAllNews succeeded:', data?.length || 0, 'news items');

    return (data || []).map((item: any) => {
      // Create excerpt from content (first 150 characters)
      const excerpt = item.content
        ? item.content.substring(0, 150).replace(/\n/g, ' ').trim() + (item.content.length > 150 ? '...' : '')
        : '';

      // Format date
      const publishedDate = new Date(item.published_at);
      const formattedDate = publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return {
        ...item,
        author: item.author || null,
        excerpt,
        formattedDate,
      } as News;
    });
  }

  async getNewsById(id: string): Promise<News | null> {
    console.log('NewsService.getNewsById called for id:', id);

    const { data, error } = await supabase
      .from('news')
      .select('*, author:profiles(id, name, email)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('NewsService.getNewsById error:', JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Format date
    const publishedDate = new Date(data.published_at);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      ...data,
      author: data.author || null,
      formattedDate,
    } as News;
  }

  async createNews(newsData: {
    title: string;
    content: string;
    author_id?: string;
    image_url?: string;
    published_at?: string;
  }): Promise<News> {
    console.log('NewsService.createNews called');

    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newsData,
        published_at: newsData.published_at || new Date().toISOString(),
      })
      .select('*, author:profiles(id, name, email)')
      .single();

    if (error) {
      console.error('NewsService.createNews error:', JSON.stringify(error, null, 2));
      throw error;
    }

    return data as News;
  }
}

export const NewsService = new NewsServiceClass();

