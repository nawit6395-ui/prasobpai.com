'use client';

import Swal from 'sweetalert2';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import SeveritySlider from '@/components/SeveritySlider';

export default function SubmitPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'มรสุมชีวิต',
        severity: 5,
        content: ''
    });

    const categoryMap = {
        'มรสุมชีวิต': 'crisis',
        'ภัยรายวัน': 'daily',
        'ขำแห้ง': 'funny',
        'คู่มือรอด': 'guide'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const categoryEnum = categoryMap[formData.category];

        try {
            // Check for user session first
            const { data: { user } } = await supabase.auth.getUser();

            // Note: In a real app, we must have a user. 
            // For this demo, if no user, we might fail or need a fallback if RLS allows.
            // Assuming the schema requires user_id.

            if (!user) {
                Swal.fire({
                    title: 'กรุณาเข้าสู่ระบบ',
                    text: 'ต้องเข้าสู่ระบบก่อนโพสต์เรื่องราว',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
                    confirmButtonColor: '#0f172a'
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push('/login');
                    }
                });
                setLoading(false);
                return;
            }

            // Generate Slug (Sending category too)
            const slugResponse = await fetch('/api/slugify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    category: categoryEnum // Send the English category code (e.g., 'crisis')
                })
            });
            const { slug } = await slugResponse.json();

            const { error } = await supabase
                .from('stories')
                .insert([
                    {
                        title: formData.title,
                        category: categoryEnum,
                        severity_level: parseInt(formData.severity),
                        content: formData.content,
                        user_id: user.id,
                        slug: slug || `story-${Date.now()}` // Fallback
                    }
                ]);

            if (error) throw error;

            await Swal.fire({
                title: 'โพสต์สำเร็จ!',
                text: 'เรื่องราวของคุณถูกแชร์เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'กลับหน้าแรก',
                confirmButtonColor: '#0f172a'
            });

            router.push('/');
        } catch (error) {
            console.error('Error adding story:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 mt-20 md:mt-0 pb-24 md:pb-0">
                <div className="bg-white p-6 md:p-8 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] relative">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <PlusCircle className="text-red-500" /> เขียนเรื่องใหม่
                    </h2>
                    <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อเรื่อง (ขอแบบพีคๆ)</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="เช่น เดินตกท่อต่อหน้าคนที่แอบชอบ..."
                                className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">หมวดหมู่</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 text-sm"
                                >
                                    <option>มรสุมชีวิต</option>
                                    <option>ภัยรายวัน</option>
                                    <option>ขำแห้ง</option>
                                    <option>คู่มือรอด</option>
                                </select>
                            </div>
                            <div>
                                <SeveritySlider
                                    value={formData.severity}
                                    onChange={handleChange}
                                    name="severity"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">เล่าเหตุการณ์</label>
                            <textarea
                                name="content"
                                rows="5"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="ระบายมาให้หมด..."
                                className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 text-sm"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-amber-400 font-bold py-3 rounded-lg border-2 border-transparent hover:border-amber-400 shadow-lg transform active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {loading ? 'กำลังโพสต์...' : 'โพสต์เลย (เตือนภัยเพื่อนมนุษย์)'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
