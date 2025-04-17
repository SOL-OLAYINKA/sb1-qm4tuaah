import { supabase } from './supabase';

export type WellnessContent = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'audio';
  category: 'mental' | 'physical' | 'nutrition' | 'sleep';
  thumbnail_url?: string;
  content_url?: string;
  featured: boolean;
  active_date: string;
};

const DAILY_CONTENT = {
  mental: [
    {
      title: 'Morning Mindfulness Practice',
      description: 'Start your day with a guided meditation session focused on mental clarity and emotional balance.',
      type: 'audio',
      thumbnail_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=300'
    },
    {
      title: 'Stress Management Techniques',
      description: 'Learn effective strategies for managing daily stress and anxiety.',
      type: 'article',
      thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300'
    }
  ],
  physical: [
    {
      title: 'Gentle Morning Yoga Flow',
      description: 'A 15-minute yoga sequence to energize your body and improve flexibility.',
      type: 'video',
      thumbnail_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300'
    },
    {
      title: 'Understanding Your Body Rhythms',
      description: 'Explore how hormonal cycles affect your physical well-being.',
      type: 'article',
      thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300'
    }
  ],
  nutrition: [
    {
      title: 'Hormone-Balancing Foods',
      description: 'Discover foods that support hormonal health and boost energy levels.',
      type: 'article',
      thumbnail_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300'
    },
    {
      title: 'Meal Planning for Wellness',
      description: 'Simple and nutritious meal ideas for optimal health.',
      type: 'video',
      thumbnail_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300'
    }
  ],
  sleep: [
    {
      title: 'Evening Relaxation Routine',
      description: 'A calming routine to help you unwind and prepare for restful sleep.',
      type: 'audio',
      thumbnail_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=300'
    },
    {
      title: 'Sleep Quality Tips',
      description: 'Expert advice for improving your sleep quality naturally.',
      type: 'article',
      thumbnail_url: 'https://images.unsplash.com/photo-1455642305367-68834a9d4337?auto=format&fit=crop&w=300'
    }
  ]
};

export const useWellnessContent = () => {
  const fetchDailyContent = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have content for today
    const { data: existingContent } = await supabase
      .from('wellness_content')
      .select('*')
      .eq('active_date', today);

    if (existingContent && existingContent.length > 0) {
      return existingContent;
    }

    // Generate new content for today
    const newContent = Object.entries(DAILY_CONTENT).flatMap(([category, items]) =>
      items.map(item => ({
        ...item,
        category,
        active_date: today,
        featured: false
      }))
    );

    // Randomly select one item to be featured
    const featuredIndex = Math.floor(Math.random() * newContent.length);
    newContent[featuredIndex].featured = true;

    // Insert new content using the edge function to bypass RLS
    try {
      const insertUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insert-content`;
      const response = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert content');
      }

      const data = await response.json();

      // Trigger cleanup of old content
      const cleanupUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-content`;
      await fetch(cleanupUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      return data;
    } catch (error) {
      console.error('Error generating daily content:', error);
      return [];
    }
  };

  return { fetchDailyContent };
};