import { Heart, MessageCircle, Share2, CloudRain, Zap, Coffee, LifeBuoy, AlertTriangle, Eye } from 'lucide-react';

const getSeverityColor = (level) => {
    if (level <= 3) return 'bg-yellow-400';
    if (level <= 7) return 'bg-orange-500';
    return 'bg-red-600';
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
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] transition-all overflow-hidden flex flex-col relative group">

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

            <div className="p-4 md:p-6 pb-2">
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
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-2 leading-snug line-clamp-1 hover:text-amber-500 transition-colors cursor-pointer">{story.title}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-900 flex items-center justify-center overflow-hidden">
                        <img src={story.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.author}`} alt="avatar" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{story.author}</span>
                </div>
            </div>

            <div className="px-4 md:px-6 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                    <span>ระดับความพัง:</span>
                    <span className={story.severity > 7 ? 'text-red-600' : 'text-slate-900'}>{story.severity}/10</span>
                </div>
                <div className="w-full h-2 md:h-4 bg-slate-100 rounded-full border border-slate-300 overflow-hidden relative">
                    <div
                        className={`h-full ${getSeverityColor(story.severity)}`}
                        style={{ width: `${story.severity * 10}%` }}
                    ></div>
                </div>
            </div>

            {/* Content with Smart Truncation */}
            <div className="px-4 md:px-6 pb-4 flex-grow relative group/content">
                <div className="max-h-[120px] overflow-hidden relative transition-all duration-300">
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed font-sans break-words whitespace-pre-line">
                        {story.content}
                    </p>

                    {/* Gradient Overlay & Read More Button - Always visible if content is long enough (controlled by max-height) 
                        Note: In a pure CSS approach, we rely on the container cropping. 
                        The gradient should just always present at the bottom to soften the cut.
                    */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2">
                        <Link href={`/story/${story.slug || story.id}`}>
                            <button className="text-slate-900 font-bold text-sm hover:underline flex items-center gap-1 bg-amber-100 px-2 py-1 rounded mb-1 shadow-sm hover:bg-amber-200 transition-colors">
                                อ่านต่อ... <BookOpen size={14} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-3 md:p-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-4">
                    {/* Hug / Like Button */}
                    <button
                        onClick={async () => {
                            if (!currentUserId) {
                                Swal.fire('เข้าสู่ระบบก่อนนะ', 'ต้องล็อกอินก่อนถึงจะส่งกำลังใจได้', 'warning');
                                return;
                            }

                            // Optimistic Update (Toggle UI immediately)
                            // Note: In real app, we should update parent state or use local state for counter
                            // For now, simpler implementation:

                            if (story.isLiked) {
                                await supabase.from('reactions').delete().match({ story_id: story.id, user_id: currentUserId });
                                // Improve: trigger refetch or update local state
                            } else {
                                await supabase.from('reactions').insert({ story_id: story.id, user_id: currentUserId, reaction_type: 'hug' });
                            }
                            window.location.reload(); // Temporary force refresh to show new state
                        }}
                        className={`flex items-center gap-1.5 text-xs md:text-sm font-bold transition-colors ${story.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                        <Heart size={18} className={story.isLiked ? 'fill-rose-500' : ''} />
                        {story.hugCount || 0}
                    </button>

                    {/* Comment Button */}
                    <Link href={`/story/${story.slug || story.id}#comments`}>
                        <button className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors">
                            <MessageCircle size={18} />
                            {story.commentCount || 0}
                        </button>
                    </Link>

                    {/* View Count (Eye) */}
                    <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-slate-400" title="จำนวนคนอ่าน">
                        <Eye size={18} />
                        {story.viewCount || 0}
                    </div>
                </div>

                {/* Share Button */}
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
                    }}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                    title="แชร์ความพัง"
                >
                    <Share2 size={18} />
                </button>
            </div>
        </div >
    );
}
