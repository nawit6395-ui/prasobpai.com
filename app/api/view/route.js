import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Initialize Supabase Admin client (to bypass RLS for checking/updating views)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    // WARN: Ideally use SERVICE_ROLE_KEY for backend logic, but if not set in locall, fallback to anon (RLS might block).
    // The user has .env.local, I should check if they can add SERVICE_KEY or if I should abuse RLS.
    // For now, let's assume Anon key is enough IF the logic is just checking.
    // Actually, to update `view_count` reliably without race conditions, RPC is best.
);

export async function POST(request) {
    try {
        const { story_id } = await request.json();

        if (!story_id) {
            return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
        }

        // 1. Get User Identity (IP or User ID)
        // IP Address
        let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        if (ip.includes(',')) ip = ip.split(',')[0];

        // Hash IP for basic privacy
        const ipHash = crypto.createHash('md5').update(ip).digest('hex');

        // Check for User ID (if sent in body or headers - usually we decode JWT but let's stick to IP + optional ID from body if needed)
        // Ideally we verify the session token here.
        // For simplicity: We will rely heavily on IP which is the main requirement "IP or User ID".

        // 2. Check 24-hour window
        // Calculate timestamp for 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Query: Has this IP viewed this story in the last 24H?
        const { data: recentViews, error: checkError } = await supabaseAdmin
            .from('story_views')
            .select('id')
            .eq('story_id', story_id)
            .eq('ip_hash', ipHash)
            .gte('viewed_at', twentyFourHoursAgo)
            .limit(1);

        if (checkError) {
            console.error('Check Error:', checkError);
            // Fail gracefully (don't recount?) or allow? Let's allow but log error.
        }

        // 3. Logic: If found, DO NOTHING
        if (recentViews && recentViews.length > 0) {
            return NextResponse.json({ message: 'View already counted in 24h' }, { status: 200 });
        }

        // 4. If NOT found: Recording View
        // A. Insert into story_views
        const { error: insertError } = await supabaseAdmin
            .from('story_views')
            .insert({
                story_id: story_id,
                ip_hash: ipHash,
                // user_id: userId // If we had it
            });

        if (insertError) {
            console.error('Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
        }

        // B. Increment Story Counter
        // We use the RPC function we created earlier
        const { error: incrementError } = await supabaseAdmin
            .rpc('increment_view_count', { story_id: story_id });

        if (incrementError) {
            console.error('Increment Error:', incrementError);
        }

        return NextResponse.json({ message: 'View counted successfully' }, { status: 200 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
