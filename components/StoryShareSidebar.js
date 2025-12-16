import { Facebook, Link as LinkIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StoryShareSidebar({ story }) {
    if (!story) return null;

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/story/${story.slug || story.id}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
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
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4">แชร์บทความนี้</h3>
            <div className="flex flex-col gap-3">
                {/* Facebook */}
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                </a>

                {/* Line */}
                <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.3.079.736.038 1.029l-.159.957c-.048.286-.233 1.118 1.171.611 1.405-.506 7.567-4.453 7.567-4.453C22.222 17.5 24 14.126 24 10.304zm-14.505 2.7h-3.3a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566v3.266h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 0 1-.566.566zm2.4 0h-.566a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566a.566.566 0 0 1 .566.566v3.837a.566.566 0 0 1-.566.566zm4.834 0h-.566a.566.566 0 0 1-.566-.566v-2.07l-2.066 2.827a.555.555 0 0 1-.453.226h-.066a.566.566 0 0 1-.566-.566V8.166a.566.566 0 0 1 .566-.566h.566a.566.566 0 0 1 .566.566v2.07l2.066-2.827a.556.556 0 0 1 .453-.226h.066a.566.566 0 0 1 .566.566v3.837a.566.566 0 0 1-.566.566zm2.4-2.167h-2.734v-.566h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 1 1-.566 1.134h-2.734V8.166h2.734a.566.566 0 0 1 .566.566v.566a.566.566 0 0 1-.566.566z" />
                    </svg>
                    Line
                </a>

                {/* Copy Link */}
                <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                    <LinkIcon size={20} />
                    คัดลอกลิงก์
                </button>
            </div>
        </div>
    );
}
