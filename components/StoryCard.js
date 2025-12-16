import { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, CloudRain, Zap, Coffee, LifeBuoy, AlertTriangle, Eye, Facebook, Link as LinkIcon } from 'lucide-react';

const getSeverityColor = (level) => {
    if (level <= 2) return 'bg-green-500';
    if (level <= 4) return 'bg-yellow-500';
    if (level <= 6) return 'bg-orange-500';
    if (level <= 8) return 'bg-red-500';
    return 'bg-purple-600';
};
const getSeverityTextColor = (level) => {
    if (level <= 2) return 'text-green-500';
    if (level <= 4) return 'text-yellow-500';
    if (level <= 6) return 'text-orange-500';
    if (level <= 8) return 'text-red-500';
    return 'text-purple-600';
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

const categoriesInternal = [
    { id: 'all', label: 'รวมมิตร' },
    { id: 'crisis', label: 'มรสุมชีวิต' },
    { id: 'daily', label: 'ภัยรายวัน' },
    { id: 'funny', label: 'ขำแห้ง' },
    { id: 'guide', label: 'คู่มือรอด' },
];

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen } from 'lucide-react';

export default function StoryCard({ story, currentUserId, currentUserRole, onDelete }) {
    const [showShare, setShowShare] = useState(false);
    const shareRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShare(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isOwner = currentUserId && story.user_id === currentUserId;
    const isAdmin = currentUserRole === 'admin';
    // Disable management for mock data (id starting with 'mock-')
    const isMock = story.id.toString().startsWith('mock-');
    const canManage = (isOwner || isAdmin) && !isMock;

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'แน่ใจนะวิ?',
            text: "ลบแล้วกู้คืนไม่ได้นะ จะลบความพังนี้จริงๆ หรอ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0f172a',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'เก็บไว้ก่อน'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('stories')
                    .delete()
                    .eq('id', story.id);

                if (error) throw error;

                await Swal.fire(
                    'ลบเรียบร้อย!',
                    'ความพังนี้ถูกลบออกจากสารบบแล้ว',
                    'success'
                );

                if (onDelete) onDelete(story.id);

            } catch (error) {
                console.error('Error deleting story:', error);
                Swal.fire(
                    'เกิดข้อผิดพลาด',
                    'ลบไม่ได้ ลองใหม่อีกทีนะ',
                    'error'
                );
            }
        }
    };

    return (
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] transition-all flex flex-col relative group">

            {/* Edit/Delete Buttons for Owner or Admin */}
            {canManage && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 p-1 rounded-md backdrop-blur-sm">
                    <Link href={`/edit/${story.id}`}>
                        <button className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center hover:bg-amber-500 transition-colors shadow-sm" title="แก้ไข">
                            <FontAwesomeIcon icon={faPen} size="xs" />
                        </button>
                    </Link>
                    <button onClick={handleDelete} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm" title="ลบ">
                        <FontAwesomeIcon icon={faTrash} size="xs" />
                    </button>
                </div>
            )}

            <div className="p-4 md:p-5 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-900 ${story.category === 'crisis' ? 'bg-blue-100 text-blue-800' :
                        story.category === 'daily' ? 'bg-yellow-100 text-yellow-800' :
                            story.category === 'funny' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {getCategoryIcon(story.category)} {categoriesInternal.find(c => c.id === story.category)?.label || 'General'}
                    </span>
                    <span className="text-slate-400 text-xs">{story.time}</span>
                </div>
                <Link href={`/story/${story.slug || story.id}`}>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-snug line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer">{story.title}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-900 flex items-center justify-center overflow-hidden">
                        <img src={story.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.author}`} alt="avatar" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{story.author}</span>
                </div>
            </div>

            <div className="px-4 md:px-5 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                    <span>ระดับความพัง:</span>
                    <span className={getSeverityTextColor(story.severity)}>{story.severity}/10</span>
                </div>
                <div className="w-full h-2 md:h-2.5 bg-slate-100 rounded-full border border-slate-300 overflow-hidden relative">
                    <div
                        className={`h-full ${getSeverityColor(story.severity)}`}
                        style={{ width: `${story.severity * 10}%` }}
                    ></div>
                </div>
            </div>

            <div className="px-4 md:px-5 pb-4 flex-grow group/content">
                <div className="relative">
                    {/* Text Content with Fixed Height and Fade Out */}
                    <div className="relative h-24 overflow-hidden">
                        <p className="text-slate-700 text-sm leading-relaxed font-sans break-words whitespace-pre-line line-clamp-3">
                            {story.content.replace(/<[^>]+>/g, '')}
                        </p>

                        {/* Fade Out Gradient */}
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>

                    {/* Read More Button - clean simple link */}
                    <div className="mt-2 text-right">
                        <Link href={`/story/${story.slug || story.id}`}>
                            <button className="text-slate-900 font-bold text-sm hover:underline inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors">
                                อ่านต่อ... <BookOpen size={14} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-3 md:px-5 md:py-3 border-t border-slate-100 flex justify-between items-center rounded-b-xl opacity-95">
                <div className="flex gap-2">
                    {/* Hug / Like Button - Improved Contrast & Hover */}
                    <button
                        onClick={async () => {
                            if (!currentUserId) {
                                Swal.fire('เข้าสู่ระบบก่อนนะ', 'ต้องล็อกอินก่อนถึงจะส่งกำลังใจได้', 'warning');
                                return;
                            }

                            if (story.isLiked) {
                                await supabase.from('reactions').delete().match({ story_id: story.id, user_id: currentUserId });
                            } else {
                                await supabase.from('reactions').insert({ story_id: story.id, user_id: currentUserId, reaction_type: 'hug' });
                            }
                            window.location.reload();
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${story.isLiked
                            ? 'bg-rose-100 text-rose-600'
                            : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                    >
                        <Heart size={18} className={story.isLiked ? 'fill-rose-500' : ''} />
                        {story.hugCount || 0}
                    </button>

                    {/* Comment Button - Improved Contrast & Hover */}
                    <Link href={`/story/${story.slug || story.id}#comments`}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <MessageCircle size={18} />
                            {story.commentCount || 0}
                        </button>
                    </Link>

                    {/* View Count (Eye) - Increased Contrast & Hover */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all select-none cursor-default" title="จำนวนคนอ่าน">
                        <Eye size={18} />
                        {story.viewCount || 0}
                    </div>
                </div>

                {/* Share Dropdown */}
                {/* Fan-out Buttons */}
                <div className="relative" ref={shareRef}>
                    {/* Particles Effect Container */}
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none z-0 ${showShare ? 'overflow-visible' : 'overflow-hidden'}`}>
                        {showShare && (
                            <>
                                <span className={`absolute bg-orange-400 rounded-full w-2 h-2 animate-[ping_1s_ease-out_forwards]`} style={{ '--tw-translate-x': '-20px', '--tw-translate-y': '-30px' }}></span>
                                <span className={`absolute bg-yellow-400 rounded-full w-2 h-2 animate-[ping_0.8s_ease-out_forwards_0.1s]`} style={{ top: '-10px', left: '10px' }}></span>
                                <span className={`absolute bg-red-400 rounded-full w-1.5 h-1.5 animate-[ping_1.2s_ease-out_forwards_0.05s]`} style={{ top: '-25px', left: '-15px' }}></span>
                                <span className={`absolute bg-white rounded-full w-1 h-1 animate-[ping_0.6s_ease-out_forwards_0.2s]`} style={{ top: '-35px', left: '5px' }}></span>
                                {/* Smoke puffs */}
                                <span className="absolute w-4 h-4 bg-gray-200/50 rounded-full blur-sm animate-[ping_1.5s_ease-out_forwards]" style={{ top: '-10px' }}></span>
                            </>
                        )}
                    </div>

                    {/* Main Toggle Button */}
                    <button
                        onClick={() => setShowShare(!showShare)}
                        className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${showShare
                            ? 'bg-slate-800 text-white rotate-90 shadow-inner'
                            : 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 hover:scale-110'
                            }`}
                        title="แชร์ความพัง"
                    >
                        <Share2 size={18} className={`transition-transform duration-500 ${!showShare && 'group-hover:rotate-180'}`} />

                        {/* Ping Effect Ring */}
                        {!showShare && (
                            <span className="absolute -inset-1 rounded-full border border-emerald-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none"></span>
                        )}
                    </button>

                    {/* Fan Out Items */}
                    {/* Facebook - Top Left */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            typeof window !== 'undefined' ? `${window.location.origin}/story/${story.slug || story.id}` : ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute inset-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white shadow-md transition-all duration-500 ease-elastic z-10 ${showShare ? '-translate-x-[45px] -translate-y-[45px] opacity-100 scale-100 rotate-0' : 'translate-x-0 translate-y-0 opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
                            }`}
                        title="แชร์ Facebook"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>

                    {/* Line - Top Center */}
                    <a
                        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                            typeof window !== 'undefined' ? `${window.location.origin}/story/${story.slug || story.id}` : ''
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute inset-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#06C755] text-white shadow-md transition-all duration-500 ease-elastic delay-75 z-10 ${showShare ? '-translate-y-[60px] opacity-100 scale-100 rotate-0' : 'translate-y-0 opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
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
                            const url = `${window.location.origin}/story/${story.slug || story.id}`;
                            navigator.clipboard.writeText(url);

                            const Toast = Swal.mixin({
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 2000,
                                timerProgressBar: true,
                            });
                            Toast.fire({
                                icon: 'success',
                                title: 'คัดลอกลิงก์แล้ว!'
                            });
                            setShowShare(false);
                        }}
                        className={`absolute inset-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-500 text-white shadow-md transition-all duration-500 ease-elastic delay-150 z-10 ${showShare ? 'translate-x-[45px] -translate-y-[45px] opacity-100 scale-100 rotate-0' : 'translate-x-0 translate-y-0 opacity-0 scale-50 rotate-[-45deg] pointer-events-none'
                            }`}
                        title="คัดลอกลิงก์"
                    >
                        <LinkIcon size={20} />
                    </button>
                </div>
            </div>
        </div >
    );
}
