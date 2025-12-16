'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, User, Mail, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                            full_name: username,
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                        }
                    }
                });
                if (error) throw error;
                await Swal.fire({
                    title: 'ลงทะเบียนสำเร็จ!',
                    text: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#0f172a'
                });
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ'
                })

                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Auth Error:', error);

            let title = 'เกิดข้อผิดพลาด';
            let text = error.message;
            let icon = 'error';
            let showCancelButton = false;
            let confirmButtonText = 'ลองใหม่';
            let cancelButtonText = 'ยกเลิก';

            // Check for specific Supabase errors
            if (error.message.includes('Invalid login credentials')) {
                title = 'เข้าสู่ระบบไม่สำเร็จ';
                text = 'ไม่พบบัญชีผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง\nคุณลงทะเบียนหรือยัง?';
                icon = 'warning';
                confirmButtonText = 'สมัครสมาชิกเลย';
                cancelButtonText = 'ลองใหม่อีกครั้ง';
                showCancelButton = true;
            } else if (error.message.includes('User already registered')) {
                title = 'บัญชีนี้มีอยู่แล้ว';
                text = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ';
                icon = 'info';
                confirmButtonText = 'เข้าสู่ระบบ';
                showCancelButton = false;
            }

            Swal.fire({
                title,
                text,
                icon,
                showCancelButton,
                confirmButtonText,
                cancelButtonText,
                confirmButtonColor: '#0f172a',
                cancelButtonColor: '#94a3b8'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (error.message.includes('Invalid login credentials')) {
                        // Switch to Sign Up mode if user clicks "Register"
                        setIsSignUp(true);
                    } else if (error.message.includes('User already registered')) {
                        // Switch to Login mode
                        setIsSignUp(false);
                    }
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900">
            <Navbar />
            <div className="max-w-md mx-auto px-4 py-8 md:py-20 mt-20 md:mt-0">
                <div className="bg-white p-8 rounded-xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)]">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        {isSignUp ? <User size={32} className="text-amber-500" /> : <LogIn size={32} className="text-amber-500" />}
                        {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                    </h2>
                    <p className="text-slate-500 mb-6 font-medium">
                        {isSignUp ? 'เข้าร่วมแก๊งคนดวงตกได้แล้ววันนี้' : 'กลับมาแชร์ความพังกันต่อเถอะ'}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 font-medium"
                                        placeholder="ตั้งชื่อเท่ๆ"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 font-medium"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 p-3 border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-slate-50 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-amber-400 font-bold py-3 rounded-lg border-2 border-transparent hover:border-amber-400 shadow-lg transform active:scale-95 transition-transform flex justify-center items-center gap-2 group"
                        >
                            {loading ? 'กำลังโหลด...' : (isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-600 text-sm font-medium">
                            {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-2 text-slate-900 font-bold underline decoration-amber-400 decoration-2 underline-offset-2 hover:text-amber-600"
                            >
                                {isSignUp ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
