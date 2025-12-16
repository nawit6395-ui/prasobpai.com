'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Settings, FileText, User, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AboutPage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        display_name: '',
        avatar_url: ''
    });

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch profile data from Supabase
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                const loadedProfile = {
                    ...data,
                    username: data.username || user.email.split('@')[0],
                    avatar: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    stats: { posts: 0, hugs: 0, badLuck: 5 }, // Placeholder stats - Ideally fetch real count
                    role: data.role || 'user'
                };
                setProfile(loadedProfile);
                setEditForm({
                    display_name: loadedProfile.display_name || loadedProfile.username,
                    avatar_url: loadedProfile.avatar
                });
            }
            setLoading(false);
        }
        getProfile();
    }, [router]);

    const handleRoleChange = async (e) => {
        const newRole = e.target.value;
        setUpdating(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, role: newRole }));
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveProfile = async () => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: editForm.display_name,
                    avatar_url: editForm.avatar_url
                })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile(prev => ({
                ...prev,
                display_name: editForm.display_name,
                avatar: editForm.avatar_url
            }));
            setIsEditing(false);
            Swal.fire({
                icon: 'success',
                title: 'บันทึกเรียบร้อย!',
                text: 'ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire('เกิดข้อผิดพลาด', 'บันทึกไม่ได้ ลองใหม่อีกทีนะ', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        const { value: password } = await Swal.fire({
            title: 'เปลี่ยนรหัสผ่าน',
            input: 'password',
            inputLabel: 'รหัสผ่านใหม่',
            inputPlaceholder: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)',
            inputAttributes: {
                minlength: 6,
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'เปลี่ยนรหัสผ่าน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#0f172a'
        });

        if (password) {
            try {
                const { error } = await supabase.auth.updateUser({ password: password });
                if (error) throw error;

                Swal.fire('สำเร็จ!', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
            } catch (error) {
                console.error('Password Update Error:', error);
                Swal.fire('เปลี่ยนไม่ได้', 'รหัสผ่านมาตรฐานต้องมี 6 ตัวอักษรขึ้นไป', 'error');
            }
        }
    };

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setEditForm(prev => ({
            ...prev,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
        }));
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Basic Check
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('ไฟล์ใหญ่เกินไป', 'ขนาดรูปต้องไม่เกิน 2MB นะ', 'warning');
            return;
        }

        setUpdating(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload via Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                // Check if it's a "Bucket not found" error to give a hint
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Bucket "avatars" not found in Supabase. Please create it.');
                }
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setEditForm(prev => ({
                ...prev,
                avatar_url: data.publicUrl
            }));

        } catch (error) {
            console.error('Upload Error:', error);
            let msg = 'อัพโหลดรูปไม่สำเร็จ ลองใหม่อีกที';
            if (error.message.includes('Bucket')) msg = 'System Error: Storage Bucket Missing';
            Swal.fire('เกิดข้อผิดพลาด', msg, 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#fffbf0] flex items-center justify-center font-bold text-slate-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 mt-20 md:mt-0 pb-24 md:pb-0">

                {/* Profile Card */}
                <div className="bg-white rounded-xl border-2 border-slate-900 overflow-hidden shadow-md mb-6 relative">
                    <div className="h-24 bg-slate-900 relative">
                        {/* Avatar */}
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                            <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center overflow-hidden relative">
                                <img src={isEditing ? editForm.avatar_url : profile.avatar} alt="Profile" className="w-full h-full object-cover" />

                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
                                        {/* Upload Button */}
                                        <label htmlFor="avatar-upload" className="cursor-pointer text-white hover:text-amber-400 hover:scale-110 transition-all p-2 bg-slate-900/50 rounded-full" title="อัพโหลดรูป">
                                            <FileText size={18} />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={updating}
                                            />
                                        </label>

                                        {/* Randomize Button */}
                                        <button
                                            onClick={handleRandomizeAvatar}
                                            className="cursor-pointer text-white hover:text-amber-400 hover:scale-110 transition-all p-2 bg-slate-900/50 rounded-full"
                                            title="สุ่มรูปใหม่"
                                            disabled={updating}
                                        >
                                            <Zap size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 pb-6 px-4 text-center">

                        {/* Editing Mode: Inputs */}
                        {isEditing ? (
                            <div className="max-w-xs mx-auto mb-4 animate-fade-in">
                                <div className="mb-2">
                                    <label className="text-xs font-bold text-slate-500 block mb-1 text-left">ชื่อที่ใช้แสดง</label>
                                    <input
                                        type="text"
                                        value={editForm.display_name}
                                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 outline-none font-bold text-slate-900 text-center"
                                    />
                                </div>
                                <div className="flex justify-center gap-2 mt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-1.5 rounded-full text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={updating}
                                        className="px-4 py-1.5 rounded-full bg-slate-900 text-amber-400 font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {updating ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div className="flex items-center justify-center gap-2">
                                    <h2 className="text-xl font-black text-slate-900">{profile.display_name || profile.username}</h2>
                                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-slate-900 transition-colors" title="แก้ไขโปรไฟล์">
                                        <FileText size={16} />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-sm">@{profile.username}</p>
                            </>
                        )}


                        {/* Display Role Badge */}
                        <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold border ${profile.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                            profile.role === 'moderator' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-orange-100 text-orange-700 border-orange-200'
                            }`}>
                            {profile.role?.toUpperCase() || 'USER'} - Level 1 Survivor
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6 border-t border-slate-100 pt-4">
                            <div>
                                <div className="font-black text-slate-900 text-lg">{profile.stats.posts}</div>
                                <div className="text-xs text-slate-500">โพสต์</div>
                            </div>
                            <div>
                                <div className="font-black text-slate-900 text-lg">{profile.stats.hugs}</div>
                                <div className="text-xs text-slate-500">ได้รับกอด</div>
                            </div>
                            <div>
                                <div className="font-black text-slate-900 text-lg">{profile.stats.badLuck}</div>
                                <div className="text-xs text-slate-500">ความซวยเฉลี่ย</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Settings Section */}
            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="bg-white p-6 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings size={20} /> ตั้งค่าบัญชี
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-600">รหัสผ่าน</label>
                            <button
                                onClick={handleChangePassword}
                                className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all flex justify-between items-center"
                            >
                                <span>เปลี่ยนรหัสผ่าน</span>
                                <Settings size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    );
}
