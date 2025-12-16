'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Clock, User, Heart, MessageCircle, Share2, AlertTriangle, CloudRain, Zap, Coffee, LifeBuoy, MoreHorizontal, Smile, Meh, Send, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import StoryShareSidebar from '@/components/StoryShareSidebar';

const PawPrint = ({ size = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="3" />
        <circle cx="19" cy="5" r="3" />
        <circle cx="5" cy="5" r="3" />
        <circle cx="19" cy="19" r="3" />
        <circle cx="5" cy="19" r="3" />
    </svg>
);

export default function StoryDetailPage({ params }) {
    const { id } = params;
    const [story, setStory] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showShare, setShowShare] = useState(false);

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

            <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
                {/* Main Content Column */}
                <div className="flex-1 min-w-0">
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
                        <div
                            className="text-lg text-slate-800 leading-8 font-medium font-sans [&_.spoiler]:bg-slate-800 [&_.spoiler]:text-transparent [&_.spoiler]:cursor-pointer [&_.spoiler]:rounded [&_.spoiler]:transition-all [&_.spoiler:hover]:bg-slate-700 [&_.spoiler.is-revealed]:bg-transparent [&_.spoiler.is-revealed]:text-inherit [&_.spoiler.is-revealed]:cursor-text"
                            onClick={(e) => {
                                if (e.target.classList.contains('spoiler')) {
                                    e.target.classList.toggle('is-revealed');
                                }
                            }}
                            dangerouslySetInnerHTML={{ __html: story.content }}
                        />
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
                        <div className="relative">
                            {/* Particles Effect Container */}
                            <div className={`absolute left-1/2 bottom-full -translate-x-1/2 w-0 h-0 pointer-events-none z-0 ${showShare ? 'overflow-visible' : 'overflow-hidden'}`}>
                                {showShare && (
                                    <>
                                        <span className={`absolute bg-orange-400 rounded-full w-2 h-2 animate-[ping_1s_ease-out_forwards]`} style={{ '--tw-translate-x': '-20px', '--tw-translate-y': '-30px' }}></span>
                                        <span className={`absolute bg-yellow-400 rounded-full w-2 h-2 animate-[ping_0.8s_ease-out_forwards_0.1s]`} style={{ top: '-10px', left: '10px' }}></span>
                                        <span className={`absolute bg-red-400 rounded-full w-1.5 h-1.5 animate-[ping_1.2s_ease-out_forwards_0.05s]`} style={{ top: '-25px', left: '-15px' }}></span>
                                        <span className={`absolute bg-white rounded-full w-1 h-1 animate-[ping_0.6s_ease-out_forwards_0.2s]`} style={{ top: '-35px', left: '5px' }}></span>
                                        <span className="absolute w-4 h-4 bg-gray-200/50 rounded-full blur-sm animate-[ping_1.5s_ease-out_forwards]" style={{ top: '-10px' }}></span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setShowShare(!showShare)}
                                className={`relative z-20 flex flex-col items-center gap-1 p-2 transition-all duration-300 ${showShare ? 'text-slate-900 scale-110' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <Share2 size={24} className={showShare ? 'rotate-90 transition-transform' : 'transition-transform'} />
                                <span className="text-xs font-bold">แชร์</span>
                            </button>

                            {/* Fan Out Items (Upward from Top Edge) */}
                            {/* Facebook - Top Left */}
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                    typeof window !== 'undefined' ? window.location.href : ''
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white shadow-md transition-all duration-500 ease-elastic z-0 ${showShare ? '-translate-x-[55px] -translate-y-[45px] opacity-100 scale-100 rotate-0' : 'translate-x-[-50%] translate-y-[50%] opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
                                    }`}
                                title="แชร์ Facebook"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>

                            {/* Line - Top Center (Straight Up) */}
                            <a
                                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                                    typeof window !== 'undefined' ? window.location.href : ''
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[#06C755] text-white shadow-md transition-all duration-500 ease-elastic delay-75 z-0 ${showShare ? '-translate-y-[75px] opacity-100 scale-100 rotate-0' : 'translate-x-[-50%] translate-y-[50%] opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
                                    }`}
                                title="แชร์ Line"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.3.079.736.038 1.029l-.159.957c-.048.286-.233 1.118 1.171.611 1.405-.506 7.567-4.453 7.567-4.453C22.222 17.5 24 14.126 24 10.304zm-14.505 2.7h-3.3a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566v3.266h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 0 1-.566.566zm2.4 0h-.566a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566a.566.566 0 0 1 .566.566v3.837a.566.566 0 0 1-.566.566zm4.834 0h-.566a.566.566 0 0 1-.566-.566v-2.07l-2.066 2.827a.555.555 0 0 1-.453.226h-.066a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566a.566.566 0 0 1 .566.566v2.07l2.066-2.827a.556.556 0 0 1 .453-.226h.066a.566.566 0 0 1 .566.566v3.837a.566.566 0 0 1-.566.566zm2.4-2.167h-2.734v-.566h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 1 1-.566 1.134h-2.734V8.166h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 0 1-.566.566z" />
                                </svg>
                            </a>

                            {/* Copy Link - Top Right */}
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    navigator.clipboard.writeText(url);

                                    const Toast = Swal.mixin({
                                        toast: true,
                                        position: 'top-end',
                                        showConfirmButton: false,
                                        timer: 2000,
                                    });
                                    Toast.fire({
                                        icon: 'success',
                                        title: 'คัดลอกลิงก์แล้ว!'
                                    });
                                    setShowShare(false);
                                }}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-slate-500 text-white shadow-md transition-all duration-500 ease-elastic delay-150 z-0 ${showShare ? 'translate-x-[55px] -translate-y-[45px] opacity-100 scale-100 rotate-0' : 'translate-x-[-50%] translate-y-[50%] opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
                                    }`}
                                title="คัดลอกลิงก์"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Comments Section (Real) */}
                    <div id="comments" className="bg-white rounded-xl p-6 border border-slate-100 mb-12 scroll-mt-24 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-4">
                            ความคิดเห็น <span className="text-slate-400 text-sm font-normal">({comments.length})</span>
                        </h3>

                        {/* Comment Form */}
                        <form onSubmit={handlePostComment} className="mb-8 flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex-shrink-0 overflow-hidden border border-orange-200 flex items-center justify-center text-orange-500">
                                {currentUser?.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <PawPrint size={20} />
                                )}
                            </div>
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={currentUser ? "แสดงความคิดเห็นเพื่อให้กำลังใจ..." : "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"}
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 outline-none transition-all text-slate-600 placeholder:text-slate-400"
                                    disabled={submitting}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-500 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>

                        {/* Comment List */}
                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center gap-3">
                                    <div className="p-3 bg-orange-50 rounded-full text-orange-400 mb-2">
                                        <PawPrint size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium">ยังไม่มีความคิดเห็น เป็นคนแรกเลยไหม?</p>
                                </div>
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
                                                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none relative group-hover:bg-slate-100 transition-colors">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {comment.profiles?.display_name || 'Anonymous'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(comment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>

                                                    {/* Delete Button for Owner */}
                                                    {isMyComment && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="absolute -right-2 -top-2 bg-white border border-slate-200 text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 shadow-sm"
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

                {/* Right Sidebar (Desktop Only) */}
                <div className="hidden lg:block w-[320px] flex-shrink-0">
                    <StoryShareSidebar story={story} />
                </div>
            </div>
            <Footer />
        </div >
    );
}
