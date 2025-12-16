'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function RealTimeStats() {
    const [stats, setStats] = useState({ dailyVisitors: 0, avgSeverity: 0, severityLabel: '...' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                if (data.dailyVisitors !== undefined) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Optional: Polling every 60s
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (label) => {
        if (label === 'วิกฤต') return 'text-red-500';
        if (label === 'ปานกลาง') return 'text-orange-400';
        if (label === 'เล็กน้อย') return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className="bg-[#0f172a] relative rounded-2xl p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 text-center transform hover:scale-[1.01] transition-transform duration-500">

            {/* Header/Icon */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0f172a] px-4 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-amber-400 font-bold shadow-lg whitespace-nowrap">
                <Activity size={20} className="animate-pulse" /> สถิติความซวยเรียลไทม์
            </div>

            {/* Left Stat: Daily Visitors */}
            <div className="flex-1 w-full md:border-r border-slate-700 md:pr-8">
                {loading ? (
                    <div className="h-16 w-32 bg-slate-800 animate-pulse rounded mx-auto mb-2"></div>
                ) : (
                    <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                        {stats.dailyVisitors.toLocaleString()}
                    </div>
                )}
                <div className="text-slate-400 font-medium text-sm md:text-base">จำนวนผู้ประสบภัยวันนี้</div>
            </div>

            {/* Right Stat: Avg Severity */}
            <div className="flex-1 w-full md:pl-8">
                {loading ? (
                    <div className="h-16 w-32 bg-slate-800 animate-pulse rounded mx-auto mb-2"></div>
                ) : (
                    <div className={`text-5xl md:text-6xl font-black mb-2 tracking-tighter ${getSeverityColor(stats.severityLabel)}`}>
                        {stats.severityLabel}
                    </div>
                )}
                <div className="text-slate-400 font-medium text-sm md:text-base">ระดับความซวยเฉลี่ย</div>
            </div>

        </div>
    );
}
