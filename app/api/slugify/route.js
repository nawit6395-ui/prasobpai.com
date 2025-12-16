import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { title, category } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        let slug = '';
        let translatedText = '';

        // ---------------------------------------------------------
        // STRATEGY 1: REAL AI TRANSLATION (Best for SEO)
        // ---------------------------------------------------------
        // Using native fetch to avoid 'npm install openai' dependency issues.
        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: `You are an SEO Specialist for a Thai community website named "Prasobpai".
                                Your task is to generate a clean, SEO-friendly URL slug from a Thai content title.
                                Rules:
                                1. Translate & Summarize intent to English.
                                2. NO Transliteration (Karaoke) - Strictly forbidden.
                                3. Format: lowercase, hyphens instead of spaces.
                                4. Length: under 60 chars.
                                5. Stop Words: Remove a, an, the, and, of, krub, ka.
                                Output ONLY the slug string.`
                            },
                            { role: "user", content: title }
                        ],
                        max_tokens: 50,
                        temperature: 0.3
                    })
                });

                const data = await response.json();
                if (data.choices && data.choices[0]) {
                    translatedText = data.choices[0].message.content.trim();
                }
            } catch (aiError) {
                console.error("OpenAI Error:", aiError);
            }
        }

        // ---------------------------------------------------------
        // STRATEGY 2: MOCK DICTIONARY (For Demo/Testing)
        // ---------------------------------------------------------
        if (!translatedText) {
            const mockDict = {
                // User Examples
                'สบายดีครับ': 'feeling-good',
                'สบายดี': 'feeling-good',
                'เดินตกท่อ': 'falling-drain-front-of-crush',
                'ตกท่อ': 'falling-drain',
                'แอบชอบ': 'crush',
                'วันซวย': 'epic-bad-day',
                'ตกรถ': 'missed-bus',
                'ตกงาน': 'fired',
                'กาแฟ': 'coffee',
                'คาปูชิโน่': 'cappuccino',

                // Existing Common Keywords
                'ฝนตก': 'rain',
                'น้ำท่วม': 'flood',
                'รถเมล์': 'bus',
                'หวย': 'lotto',
                'กิน': 'eat',
                'แฟน': 'relationship',
                'เลิก': 'breakup',
                'เจ้านาย': 'boss',
                'ไล่ออก': 'fired',
                'ซวย': 'bad-day',
                'ผี': 'ghost',
                'รถชน': 'car-crash',
                'หมากัด': 'dog-bite',
            };

            // Enhanced keyword extraction: Try to capture the main intent
            // Simple approach: Find matches and join them
            let foundKeywords = [];
            for (const [thai, eng] of Object.entries(mockDict)) {
                if (title.includes(thai)) {
                    foundKeywords.push(eng);
                }
            }
            if (foundKeywords.length > 0) {
                // Use a Set to remove duplicates in case of overlaps (e.g. falling-drain vs drain)
                translatedText = [...new Set(foundKeywords)].join('-');
            }
        }

        // ---------------------------------------------------------
        // STRATEGY 3: CLEAN FALLBACK (No Karaoke)
        // ---------------------------------------------------------
        // If translation failed, rely on ID. Do NOT show "sbay-di-khrab".
        if (!translatedText) {
            const cleanCategory = (category || 'story').toLowerCase().replace(/\s+/g, '-');
            translatedText = cleanCategory; // e.g. "daily" or "crisis"
        }

        // ---------------------------------------------------------
        // FINALIZE SLUG
        // ---------------------------------------------------------
        // Clean up: lowercase, remove special chars, trim hyphens
        translatedText = translatedText.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Add random ID for uniqueness
        const shortId = Math.random().toString(16).substring(2, 6); // e.g., "c88a"
        slug = `${translatedText}-${shortId}`;

        return NextResponse.json({ slug });

    } catch (error) {
        console.error('Slug Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
