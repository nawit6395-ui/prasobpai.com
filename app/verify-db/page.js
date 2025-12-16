'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyDB() {
    const [status, setStatus] = useState('Checking...');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                const { data, error } = await supabase.from('stories').select('count', { count: 'exact', head: true });

                if (error) {
                    throw error;
                }

                setStatus('Connected');
                setData(`Successfully connected! Found ${data?.length ?? 0} stories (or verified table access).`);
            } catch (err) {
                setStatus('Error');
                setError(err.message);
            }
        }

        checkConnection();
    }, []);

    return (
        <div className="p-10 border-4 border-slate-900 m-10 rounded-xl bg-white">
            <h1 className="text-2xl font-black mb-4">Database Connection Status</h1>

            <div className={`p-4 rounded-lg border-2 ${status === 'Connected' ? 'bg-green-100 border-green-600 text-green-800' : 'bg-red-100 border-red-600 text-red-800'}`}>
                <p className="font-bold text-lg">{status}</p>
                {data && <p className="mt-2">{data}</p>}
                {error && <p className="mt-2 font-mono text-sm">Error: {error}</p>}
            </div>

            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <h3 className="font-bold mb-2">Checklist:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Created <code>lib/supabaseClient.js</code>? ✅</li>
                    <li>Installed <code>@supabase/supabase-js</code>? {status === 'Checking...' ? '...' : '✅'}</li>
                    <li>Added <code>NEXT_PUBLIC_SUPABASE_URL</code> to <code>.env.local</code>? ❓</li>
                    <li>Added <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>? ❓</li>
                </ul>
            </div>
        </div>
    );
}
