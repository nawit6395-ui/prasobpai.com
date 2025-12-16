'use client';

import React, { useState, useEffect } from 'react';
import { CloudRain, Zap, Coffee, LifeBuoy, AlertTriangle } from 'lucide-react';
import StoryCard from './StoryCard';
import { supabase } from '@/lib/supabaseClient';

const categories = [
    { id: 'all', label: 'รวมมิตร', icon: <AlertTriangle size={24} />, color: 'bg-slate-100' },
    { id: 'crisis', label: 'มรสุมชีวิต', icon: <CloudRain size={24} />, color: 'bg-blue-100 text-blue-600' },
    { id: 'daily', label: 'ภัยรายวัน', icon: <Zap size={24} />, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'funny', label: 'ขำแห้ง', icon: <Coffee size={24} />, color: 'bg-orange-100 text-orange-600' },
    { id: 'guide', label: 'คู่มือรอด', icon: <LifeBuoy size={24} />, color: 'bg-green-100 text-green-600' },
];

export default function Feed() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setCurrentUser({ ...user, role: profile?.role });
            }
        };
        fetchUser();
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            let query = supabase
                .from('stories')
                .select(`
                    *,
                profiles (
                        display_name,
                        avatar_url
                    ),
                    reactions (
                        user_id,
                        reaction_type
                    ),
                    comments (count),
                    view_count
                `)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            // Transform data
            const formattedStories = data.map(story => {
                // Check if current user liked this story
                const userReaction = currentUser ? story.reactions.find(r => r.user_id === currentUser.id) : null;
                const isLiked = !!userReaction;

                // Count hugs (assuming all reactions are positive/hugs for now or filter by type)
                const hugCount = story.reactions.length;

                return {
                    id: story.id,
                    title: story.title,
                    content: story.content,
                    category: story.category,
                    slug: story.slug,
                    severity: story.severity_level,
                    user_id: story.user_id,
                    time: new Date(story.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    }),
                    author: story.profiles?.display_name || 'Anonymous',
                    avatar: story.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous',

                    // Interaction Data
                    isLiked,
                    hugCount,
                    commentCount: story.comments?.[0]?.count || 0,
                    viewCount: story.view_count || 0
                };
            });

            setStories(formattedStories);
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (deletedStoryId) => {
        setStories(prev => prev.filter(story => story.id !== deletedStoryId));
    };

    const filteredStories = selectedCategory === 'all'
        ? stories
        : stories.filter(s => s.category === selectedCategory);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 pb-24 md:pb-12">

            {/* Mobile Categories (Horizontal Scroll) */}
            <div className="md:hidden mb-8">
                <h3 className="font-bold text-slate-900 mb-3 px-1">เลือกประเภทภัยพิบัติ</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                    {categories.map((cat) => (
                        <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="flex flex-col items-center gap-2 min-w-[80px] snap-start cursor-pointer group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${selectedCategory === cat.id ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {cat.icon}
                                {cat.id === 'daily' && (
                                    <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white">แนะนำ</div>
                                )}
                            </div>
                            <span className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-slate-900' : 'text-slate-500'}`}>{cat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Categories (Buttons) */}
            <div className="hidden md:flex flex-wrap gap-3 mb-10 justify-center">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border-2 transition-all ${selectedCategory === cat.id
                            ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-md'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-900'
                            }`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Stories Grid */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
                <CloudRain size={20} className="text-slate-900" />
                <h2 className="text-lg font-black text-slate-900">แลกเปลี่ยนประสบการณ์</h2>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">กำลังโหลดความพัง...</p>
                </div>
            ) : filteredStories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-300">
                    <p className="text-slate-500 font-bold text-lg">ยังไม่มีเรื่องราวในหมวดหมู่นี้</p>
                    <p className="text-slate-400 text-sm">เป็นคนแรกที่เริ่มระบายเลย!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                    {filteredStories.map((story) => (
                        <StoryCard
                            key={story.id}
                            story={story}
                            currentUserId={currentUser?.id}
                            currentUserRole={currentUser?.role}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
