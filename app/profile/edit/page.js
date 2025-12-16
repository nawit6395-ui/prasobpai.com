'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Swal from 'sweetalert2';
import { User, Save, RefreshCw, Camera } from 'lucide-react';

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                // Fetch Public Profile
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (profile) {
                    setDisplayName(profile.display_name || user.user_metadata?.username || '');
                    setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url || '');
                } else {
                    // Fallback to metadata if profile doesn't exist yet
                    setDisplayName(user.user_metadata?.username || '');
                    setAvatarUrl(user.user_metadata?.avatar_url || '');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('กรุณาเลือกไฟล์ภาพที่ต้องการอัปโหลด');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);

        } catch (error) {
            Swal.fire('อัปโหลดไม่สำเร็จ', error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updates = {
                id: user.id,
                display_name: displayName,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            // Update Auth Metadata as well (optional but good for syncing)
            await supabase.auth.updateUser({
                data: { username: displayName, avatar_url: avatarUrl }
            });

            // 3. Update Password (if provided)
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error('รหัสผ่านไม่ตรงกัน');
                }
                if (newPassword.length < 6) {
                    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
                }

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (passwordError) throw passwordError;
            }

            await Swal.fire({
                title: 'บันทึกสำเร็จ!',
                text: 'ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#0f172a'
            });

            // Reset password fields
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);

            router.refresh(); // Refresh to update Navbar

        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                title: 'บันทึกไม่สำเร็จ',
                text: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
        } finally {
            setSaving(false);
        }
    };

    const generateNewAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffbf0] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] p-6 md:p-8">
                        <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <User className="text-amber-500" size={32} /> แก้ไขข้อมูลส่วนตัว
                        </h1>

                        <form onSubmit={handleSave} className="space-y-6">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-100">
                                        <img
                                            src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full hover:bg-amber-500 transition-colors shadow-lg cursor-pointer"
                                        title="อัปโหลดรูปภาพ"
                                    >
                                        <Camera size={16} />
                                    </label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={uploadAvatar}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={generateNewAvatar}
                                        className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
                                    >
                                        <RefreshCw size={12} /> สุ่มรูปการ์ตูน
                                    </button>
                                </div>
                                {uploading && <p className="text-xs text-amber-500 font-bold animate-pulse">กำลังอัปโหลด...</p>}
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อที่ใช้แสดง (Display Name)</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-slate-50 font-medium"
                                    placeholder="ใส่ชื่อเท่ๆ ของคุณ"
                                    maxLength={20}
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1 text-right">{displayName.length}/20</p>
                            </div>

                            {/* Password Change Section */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                    className="flex items-center justify-between w-full text-sm font-bold text-slate-700"
                                >
                                    <span>เปลี่ยนรหัสผ่าน</span>
                                    <span className={`text-xl transition-transform ${showPasswordSection ? 'rotate-45' : ''}`}>+</span>
                                </button>

                                {showPasswordSection && (
                                    <div className="mt-4 space-y-3 animate-slide-down">
                                        <div>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-medium"
                                                placeholder="รหัสผ่านใหม่"
                                                minLength={6}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-medium"
                                                placeholder="ยืนยันรหัสผ่านใหม่"
                                                minLength={6}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">ปล่อยว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
                                    </div>
                                )}
                            </div>

                            <hr className="border-slate-100" />

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-slate-900 text-amber-400 px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>กำลังบันทึก...</>
                                    ) : (
                                        <>
                                            <Save size={20} /> บันทึกการเปลี่ยนแปลง
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
