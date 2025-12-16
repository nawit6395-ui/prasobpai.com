'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const MOCK_STORY = {
    id: 'mock-1',
    title: 'แฟนเก่าทักมาขอยืมเงิน...',
    content: 'หลังจากเลิกกันไป 3 ปี อยู่ดีๆ ก็ทักมา "เตง สบายดีมั้ย พอดีเราเดือดร้อน..." นึกว่าจะมาง้อ ที่ไหนได้!!',
    category: 'crisis'
};

export default function Hero() {
    const [topStories, setTopStories] = useState([MOCK_STORY]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopStories = async () => {
            try {
                // Fetch top 3 stories based on view_count (or mock logic if view_count is low)
                const { data, error } = await supabase
                    .from('stories')
                    .select('id, title, content, category, slug')
                    .order('view_count', { ascending: false })
                    .limit(3);

                if (error) throw error;

                if (data && data.length > 0) {
                    setTopStories(data);
                }
            } catch (error) {
                console.error('Error fetching top stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopStories();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (topStories.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % topStories.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [topStories.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % topStories.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + topStories.length) % topStories.length);
    };

    const currentStory = topStories[currentIndex];

    // Helper to strip HTML for preview
    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const safeContent = typeof document !== 'undefined' ? stripHtml(currentStory.content).substring(0, 150) + '...' : currentStory.content.substring(0, 150) + '...';

    return (
        <div className="bg-amber-50 border-b-4 border-slate-900 relative overflow-hidden mt-24 md:mt-0">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="max-w-6xl mx-auto px-4 py-8 md:py-20 relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-2/3">
                    <div className="inline-block bg-slate-900 text-amber-400 px-3 py-1 rounded-full text-sm font-bold mb-4 transform -rotate-1">
                        ⚠ พื้นที่ระบาย ของคนดวงตก
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-4 leading-tight">
                        เปลี่ยนเรื่อง <span className="text-red-600 inline-block transform rotate-2 bg-yellow-200 px-2">ซวย</span> <br />
                        ให้เป็นเรื่อง <span className="text-green-700 inline-block transform -rotate-2 bg-green-200 px-2">แชร์</span>
                    </h1>
                    <p className="text-md md:text-xl text-slate-700 mb-6 font-medium">
                        ยินดีต้อนรับสู่ "ประสบภัย.คอม" พื้นที่ของคนดวงตก <br className="hidden md:block" />
                        อย่าเก็บความพังไว้คนเดียว!
                    </p>
                    <div className="flex flex-wrap gap-4 hidden md:flex">
                        <button
                            onClick={async () => {
                                const { data: { session } } = await import('@/lib/supabaseClient').then(mod => mod.supabase.auth.getSession());
                                if (!session) {
                                    const Swal = (await import('sweetalert2')).default;
                                    Swal.fire({
                                        title: 'แจ้งเหตุฉุกเฉิน?',
                                        text: "กรุณาเข้าสู่ระบบก่อนแจ้งเหตุ",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#0f172a',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'เข้าสู่ระบบ',
                                        cancelButtonText: 'ยกเลิก'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            window.location.href = '/login';
                                        }
                                    })
                                } else {
                                    window.location.href = '/submit';
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transform transition hover:-translate-y-1"
                        >
                            <PlusCircle size={20} className="inline mr-2" /> แจ้งเหตุฉุกเฉิน
                        </button>
                    </div>
                </div>

                {/* Dynamic Carousel Card */}
                <div className="md:w-1/3 w-full relative group">
                    <div className="bg-white p-6 rounded-lg border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-2 md:hover:rotate-0 transition-all duration-300 relative z-10 min-h-[200px] flex flex-col justify-between">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-3 border-b-2 border-dashed border-slate-200 pb-2">
                            <span className="font-bold text-red-600 flex items-center gap-1 text-sm md:text-base animate-pulse">
                                <AlertTriangle size={16} /> ภัยพิบัติยอดฮิต
                            </span>
                            <span className="text-xs text-slate-500 font-bold px-2 py-0.5 bg-slate-100 rounded-full">Top 3</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            <Link href={currentStory.id === 'mock-1' ? '#' : `/story/${currentStory.slug || currentStory.id}`}>
                                <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight hover:text-amber-600 transition-colors line-clamp-2">
                                    {currentStory.title}
                                </h3>
                            </Link>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                {/* Use simple strip for simplicity in client component to avoid hydration mismatch if possible, 
                                    or just display consistent substring. For robustness, we check window/document presence above but 
                                    here we might just use CSS line-clamp effectively or a safer replace. 
                                */}
                                {currentStory.content?.replace(/<[^>]+>/g, '')}
                            </p>
                        </div>

                        {/* Navigation / Indicators */}
                        <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
                            <div className="flex gap-1">
                                {topStories.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-slate-900 w-4' : 'bg-slate-300'}`}
                                    />
                                ))}
                            </div>

                            {topStories.length > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute top-2 right-2 w-full h-full bg-slate-900 rounded-lg -z-0 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
            </div>
        </div>
    );
}
