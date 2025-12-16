'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Clock, User, Heart, MessageCircle, Share2, AlertTriangle, CloudRain, Zap, Coffee, LifeBuoy, MoreHorizontal, Smile, Meh, Send, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function StoryDetailPage({ params }) {
    const { id } = params;
    const [story, setStory] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch User
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setCurrentUser({ ...user, ...profile });
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        // Increment View Count (Once per mount)
        // We need the ID first, but id might be a slug.
        // It's better to do this AFTER we resolve the story.
    }, []);

    useEffect(() => {
        async function fetchStoryAndComments() {
            try {
                const { id } = params;

                // 1. Fetch Story
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                let query = supabase.from('stories').select(`
                    *,
                    profiles (
                        display_name,
                        avatar_url
                    ),
                    reactions (
                        reaction_type
                    )
                `);

                if (isUUID) {
                    query = query.eq('id', id);
                } else {
                    query = query.eq('slug', id);
                }

                const { data: storyData, error: storyError } = await query.single();

                if (storyError) throw storyError;

                // INCREMENT VIEW COUNT (Via Secure API with Spam Protection)
                if (storyData?.id) {
                    fetch('/api/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story_id: storyData.id })
                    }).catch(err => console.error('View Count Error:', err));
                }

                // Process Reactions
                const reactions = { hug: 0, understand: 0, dryLaugh: 0 };
                if (storyData.reactions) {
                    storyData.reactions.forEach(r => {
                        if (r.reaction_type === 'hug') reactions.hug++;
                        // Add others if we expand types
                    });
                }

                setStory({
                    ...storyData,
                    author: storyData.profiles?.display_name || 'Anonymous',
                    avatar: storyData.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${storyData.profiles?.display_name || 'Anonymous'}`,
                    time: new Date(storyData.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }),
                    reactionsCount: reactions
                });

                // 2. Fetch Comments (if story exists)
                if (storyData?.id) {
                    const { data: commentData, error: commentError } = await supabase
                        .from('comments')
                        .select(`
                            id,
                            content,
                            created_at,
                            user_id,
                            profiles (
                                display_name,
                                avatar_url
                            )
                        `)
                        .eq('story_id', storyData.id)
                        .order('created_at', { ascending: true }); // Oldest first

                    if (!commentError) {
                        setComments(commentData);
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoryAndComments();
    }, [id]);

    const handlePostComment = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            Swal.fire({
                title: 'เข้าสู่ระบบก่อนนะ',
                text: 'ต้องล็อกอินก่อนถึงจะคอมเมนต์ได้ครับ',
                icon: 'warning',
                confirmButtonText: 'ไปหน้าล็อกอิน',
                showCancelButton: true,
                cancelButtonText: 'ไว้ก่อน'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/login';
                }
            });
            return;
        }

        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    story_id: story.id,
                    user_id: currentUser.id,
                    content: newComment.trim()
                });

            if (error) throw error;

            setNewComment('');

            // Refetch comments to be safe and simple
            const { data: newComments } = await supabase
                .from('comments')
                .select(`
                    id, content, created_at, user_id,
                    profiles (display_name, avatar_url)
                `)
                .eq('story_id', story.id)
                .order('created_at', { ascending: true });

            setComments(newComments || []);

        } catch (error) {
            console.error('Comment Error:', error);
            Swal.fire('คอมเมนต์ไม่ได้', 'เกิดข้อผิดพลาด ลองใหม่อีกทีนะ', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
            title: 'ลบความเห็น?',
            text: 'แน่ใจนะว่าจะลบ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'ลบเลย'
        });

        if (result.isConfirmed) {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (!error) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                Swal.fire('ลบแล้ว', '', 'success');
            }
        }
    };

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'crisis': return <CloudRain size={20} />;
            case 'daily': return <Zap size={20} />;
            case 'funny': return <Coffee size={20} />;
            case 'guide': return <LifeBuoy size={20} />;
            default: return <AlertTriangle size={20} />;
        }
    };

    const getSeverityColor = (level) => {
        if (level <= 3) return 'bg-yellow-400';
        if (level <= 7) return 'bg-orange-500';
        return 'bg-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffbf0] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-[#fffbf0] flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">ไม่พบเรื่องราวนี้</h1>
                <Link href="/" className="px-6 py-2 bg-slate-900 text-amber-400 rounded-lg font-bold">กลับหน้าหลัก</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-0 pt-16 md:pt-20 font-sans selection:bg-amber-200 selection:text-slate-900">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 mt-8">
                {/* Back Button */}
                <Link href="/" className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors inline-block">
                    <ArrowLeft size={20} /> กลับหน้าแรก
                </Link>

                {/* Article Header */}
                <div className="mb-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-slate-900 mb-3 ${story.category === 'crisis' ? 'bg-blue-100 text-blue-800' :
                        story.category === 'daily' ? 'bg-yellow-100 text-yellow-800' :
                            story.category === 'funny' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {getCategoryIcon(story.category)} {story.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{story.title}</h1>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-900 flex items-center justify-center overflow-hidden">
                                <img src={story.avatar} alt={story.author} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">{story.author}</div>
                                <div className="text-xs text-slate-500">{story.time}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-slate-500 text-sm font-bold">
                                <Eye size={16} /> {story.view_count || 0}
                            </div>
                            <button className="text-slate-400 hover:text-slate-900">
                                <MoreHorizontal size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Severity Bar */}
                <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">ระดับความพังพินาศ</span>
                        <span className={`text-xl font-black ${story.severity_level > 7 ? 'text-red-600' : 'text-slate-900'}`}>{story.severity_level}/10</span>
                    </div>
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getSeverityColor(story.severity_level)} transition-all duration-1000 ease-out`}
                            style={{ width: `${story.severity_level * 10}%` }}
                        ></div>
                    </div>
                </div>

                {/* Full Content */}
                <article className="prose prose-slate max-w-none mb-12">
                    <p className="text-lg text-slate-800 leading-8 whitespace-pre-line font-medium font-sans">
                        {story.content}
                    </p>
                </article>

                {/* Action Bar (Sticky Bottom) - UPDATED to handle real reactions data if needed */}
                <div className="sticky bottom-20 md:bottom-8 bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-full p-2 flex justify-around items-center max-w-md mx-auto mb-12 z-40">
                    <button className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-rose-500 transition-colors">
                        <Heart size={24} className={story.reactionsCount?.hug > 0 ? "fill-rose-100 text-rose-500" : ""} />
                        <span className="text-xs font-bold">{story.reactionsCount?.hug || 0}</span>
                    </button>
                    <button
                        onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                        className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-blue-500 transition-colors"
                    >
                        <MessageCircle size={24} />
                        <span className="text-xs font-bold">{comments.length}</span>
                    </button>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(url);
                            Swal.fire({
                                icon: 'success',
                                toast: true,
                                position: 'top-end',
                                title: 'คัดลอกลิงก์แล้ว',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }}
                        className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <Share2 size={24} />
                        <span className="text-xs font-bold">แชร์</span>
                    </button>
                </div>

                {/* Comments Section (Real) */}
                <div id="comments" className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-12 scroll-mt-24">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        ความคิดเห็น <span className="text-slate-400 text-sm font-normal">({comments.length})</span>
                    </h3>

                    {/* Comment Form */}
                    <form onSubmit={handlePostComment} className="mb-8 flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                            <img
                                src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`}
                                alt="My Avatar"
                            />
                        </div>
                        <div className="flex-grow relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={currentUser ? "แสดงความคิดเห็นเพื่อให้กำลังใจ..." : "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"}
                                className="w-full p-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 outline-none resize-none h-14 min-h-[56px] transition-all"
                                disabled={submitting}
                            ></textarea>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="absolute right-2 top-2 p-2 bg-slate-900 text-amber-400 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <p className="text-center text-slate-400 py-4">ยังไม่มีความคิดเห็น เป็นคนแรกเลยไหม?</p>
                        ) : (
                            comments.map((comment) => {
                                const isMyComment = currentUser && currentUser.id === comment.user_id;
                                return (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-100">
                                            <img
                                                src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.display_name || 'User'}`}
                                                alt="avatar"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative group-hover:border-slate-300 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-900">
                                                        {comment.profiles?.display_name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(comment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                                {/* Delete Button for Owner */}
                                                {isMyComment && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="absolute -right-2 -top-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
