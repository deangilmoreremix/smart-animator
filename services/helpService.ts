import { supabase } from './supabase';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  page_context: string | null;
  search_tags: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

class HelpService {
  async getAllArticles(): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting help articles:', error);
      return [];
    }
  }

  async getArticlesByContext(context: string): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .or(`page_context.eq.${context},category.eq.general`)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting context articles:', error);
      return [];
    }
  }

  async getArticlesByCategory(category: string): Promise<HelpArticle[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .eq('category', category)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting category articles:', error);
      return [];
    }
  }

  async searchArticles(query: string): Promise<HelpArticle[]> {
    try {
      const lowerQuery = query.toLowerCase();
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${lowerQuery}%,content.ilike.%${lowerQuery}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }

  getPageContextFromRoute(page: string): string {
    const contextMap: Record<string, string> = {
      'landing': 'landing',
      'animator': 'animator',
      'history': 'video-creation',
      'contacts': 'contacts',
      'distribution': 'distribution',
      'admin': 'admin'
    };
    return contextMap[page] || 'general';
  }

  getDefaultArticles(): HelpArticle[] {
    return [
      {
        id: '1',
        title: 'Getting Started with Smart Animator',
        content: 'Welcome to Smart Animator! This platform helps you create personalized video outreach campaigns at scale.\n\n1. Create Videos: Use AI to generate videos from text prompts\n2. Manage Contacts: Import and organize your contact lists\n3. Launch Campaigns: Send personalized videos to multiple contacts\n4. Track Results: Monitor opens, views, and engagement\n\nStart by creating your first video in the Create tab!',
        category: 'getting-started',
        page_context: 'landing',
        search_tags: ['welcome', 'introduction', 'start', 'begin'],
        order_index: 1,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Creating Your First Video',
        content: 'To create a video:\n\n1. Click the Create tab in the navigation\n2. Enter your API key if you haven\'t already\n3. Write a detailed prompt describing the video you want\n4. Configure settings (duration, aspect ratio, resolution)\n5. Click Generate and wait 30-60 seconds\n\nTips:\n- Be specific about what you want to see\n- Mention camera angles, lighting, and mood\n- Describe any text or branding elements\n- Start simple and iterate based on results',
        category: 'video-creation',
        page_context: 'animator',
        search_tags: ['video', 'create', 'generate', 'veo', 'ai'],
        order_index: 1,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Managing Contacts',
        content: 'Import and organize contacts for your campaigns:\n\n1. Go to the Contacts tab\n2. Click "Import CSV" to upload a file\n3. Map your CSV columns to contact fields\n4. Or add contacts manually one at a time\n\nRecommended fields:\n- First Name, Last Name (for personalization)\n- Email (required for campaigns)\n- Company, Role, Industry (for better targeting)\n- Custom fields for specific data points\n\nMore data = better personalization!',
        category: 'contacts',
        page_context: 'contacts',
        search_tags: ['contacts', 'import', 'csv', 'recipients', 'list'],
        order_index: 1,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Launching Campaigns',
        content: 'Create and send personalized video campaigns:\n\n1. Go to the Distribute tab\n2. Click "Create Campaign"\n3. Select a video and contacts\n4. Choose personalization tier:\n   - Basic: Name and company\n   - Smart: Industry-specific content\n   - Advanced: Full AI personalization\n5. Configure email settings (subject, message)\n6. Review and launch\n\nThe system will generate personalized versions for each contact and track all engagement.',
        category: 'campaigns',
        page_context: 'distribution',
        search_tags: ['campaign', 'distribute', 'send', 'email', 'personalization'],
        order_index: 1,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Understanding Personalization Tiers',
        content: 'Choose the right level of personalization:\n\nBasic Tier:\n- Name and company merge fields\n- Fast processing (seconds)\n- Lower cost per contact\n- Good for large, general audiences\n\nSmart Tier:\n- Basic + industry-specific content\n- Role-based messaging\n- Moderate processing time\n- Best for targeted outreach\n\nAdvanced Tier:\n- Full AI personalization\n- Company research integration\n- Pain point targeting\n- Custom backgrounds per contact\n- Highest engagement rates\n- Best for high-value prospects',
        category: 'personalization',
        page_context: 'distribution',
        search_tags: ['tier', 'personalization', 'ai', 'basic', 'smart', 'advanced'],
        order_index: 2,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        title: 'Tracking Campaign Performance',
        content: 'Monitor your campaign metrics:\n\nKey Metrics:\n- Open Rate: % of emails opened\n- View Rate: % of videos watched\n- Click Rate: % clicking through links\n- Engagement Time: How long viewers watch\n\nAnalytics Dashboard:\n- Real-time updates as people engage\n- Individual recipient tracking\n- Campaign comparison tools\n- Export data for further analysis\n\nUse insights to:\n- Optimize subject lines\n- Test different personalization levels\n- Identify best-performing content\n- Refine targeting strategies',
        category: 'analytics',
        page_context: 'distribution',
        search_tags: ['analytics', 'tracking', 'metrics', 'performance', 'opens', 'clicks'],
        order_index: 3,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const helpService = new HelpService();
