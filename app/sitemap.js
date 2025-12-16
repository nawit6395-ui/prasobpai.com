import { supabase } from '@/lib/supabaseClient';

export const revalidate = 3600; // Update sitemap every 1 hour

export default async function sitemap() {
    const baseUrl = 'https://prasobpai.com';

    // Static routes
    const routes = [
        '',
        '/about',
        '/submit',
        '/privacy',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes (Stories)
    try {
        const { data: stories } = await supabase
            .from('stories')
            .select('slug, id, updated_at')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (stories) {
            const storyRoutes = stories.map((story) => ({
                url: `${baseUrl}/story/${story.slug || story.id}`,
                lastModified: new Date(story.updated_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.6,
            }));

            return [...routes, ...storyRoutes];
        }
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return routes;
}
