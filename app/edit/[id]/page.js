'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Edit, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Swal from 'sweetalert2';
import Link from 'next/link';
import SeveritySlider from '@/components/SeveritySlider';

export default function EditPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'มรสุมชีวิต',
        severity: 5,
        content: ''
    });

    const categoryMap = {
        'crisis': 'มรสุมชีวิต',
        'daily': 'ภัยรายวัน',
        'funny': 'ขำแห้ง',
        'guide': 'คู่มือรอด'
    };

    const reverseCategoryMap = {
        'มรสุมชีวิต': 'crisis',
        'ภัยรายวัน': 'daily',
        'ขำแห้ง': 'funny',
        'คู่มือรอด': 'guide'
    };

    useEffect(() => {
        const fetchStory = async () => {
            try {
                // Check auth
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Fetch story first
                const { data, error } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Get User Role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const isOwner = data.user_id === user.id;
                const isAdmin = profile?.role === 'admin';

                // Check ownership or admin status
                if (!isOwner && !isAdmin) {
                    Swal.fire('Error', 'คุณไม่มีสิทธิ์แก้ไขโพสต์นี้', 'error');
                    router.push('/');
                    return;
                }

                setFormData({
                    title: data.title,
                    category: categoryMap[data.category] || 'มรสุมชีวิต',
                    severity: data.severity_level,
                    content: data.content
                });
            } catch (error) {
                console.error('Error fetching story:', error);
                Swal.fire('Error', 'ไม่พบโพสต์ที่ต้องการแก้ไข', 'error');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const categoryEnum = reverseCategoryMap[formData.category];

        try {
            const { error } = await supabase
                .from('stories')
                .update({
                    title: formData.title,
                    category: categoryEnum,
                    severity_level: parseInt(formData.severity),
                    content: formData.content,
                })
                .eq('id', id);

            if (error) throw error;

            await Swal.fire({
                title: 'บันทึกสำเร็จ!',
                text: 'แก้ไขเรื่องราวเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#0f172a'
            });

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error updating story:', error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fffbf0]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 mt-20 md:mt-0 pb-24 md:pb-0">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ArrowLeft size={20} /> กลับหน้าแรก
                </Link>

                <div className="bg-white p-6 md:p-8 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] relative">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <Edit className="text-amber-500" /> แก้ไขเรื่องราว
                    </h2>
                    <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อเรื่อง</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
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
                                className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 text-sm"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-900 text-amber-400 font-bold py-3 rounded-lg border-2 border-transparent hover:border-amber-400 shadow-lg transform active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {saving ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกการแก้ไข</>}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
