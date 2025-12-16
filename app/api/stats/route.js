import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Admin client to bypass RLS for aggregation queries if needed, 
// though we enabled public select so standard client might work.
// Using Admin for safety in backend logic.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
    try {
        // 1. Record Visit (if new for today)
        let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        if (ip.includes(',')) ip = ip.split(',')[0];
        const ipHash = crypto.createHash('md5').update(ip).digest('hex');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        // Check if visited today
        const { data: existingVisit } = await supabaseAdmin
            .from('site_visits')
            .select('id')
            .eq('ip_hash', ipHash)
            .gte('visited_at', todayISO)
            .limit(1);

        if (!existingVisit || existingVisit.length === 0) {
            await supabaseAdmin.from('site_visits').insert({ ip_hash: ipHash });
        }

        // 2. Get Stats
        // A. Daily Visitors
        const { count: dailyCount, error: countError } = await supabaseAdmin
            .from('site_visits')
            .select('id', { count: 'exact', head: true })
            .gte('visited_at', todayISO);

        // B. Average Severity
        // Note: Averaging on large table might be slow eventually, but fine for now.
        // Or we can cache this value.
        const { data: severityData, error: severityError } = await supabaseAdmin
            .from('stories')
            .select('severity_level');

        let avgSeverity = 0;
        let severityLabel = 'ปกติ'; // default

        if (severityData && severityData.length > 0) {
            const total = severityData.reduce((sum, s) => sum + (s.severity_level || 0), 0);
            avgSeverity = (total / severityData.length).toFixed(1);
        }

        // Determine Label
        const score = parseFloat(avgSeverity);
        if (score > 8) severityLabel = 'วิกฤต';
        else if (score > 5) severityLabel = 'ปานกลาง';
        else if (score > 2) severityLabel = 'เล็กน้อย';
        else severityLabel = 'สดใส';

        return NextResponse.json({
            dailyVisitors: dailyCount || 0,
            avgSeverity: avgSeverity,
            severityLabel
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
