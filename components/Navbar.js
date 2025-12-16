'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, Home, FileText, Plus, Bell, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const [showMobileMenu, setShowMobileMenu] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [user, setUser] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    // Hide mobile header on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setShowMobileMenu(false);
            } else {
                setShowMobileMenu(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const isActive = (path) => pathname === path;

    return (
        <>
            {/* --- Desktop Navbar --- */}
            <nav className="hidden md:block sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b-4 border-amber-400">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2 cursor-pointer transform hover:-rotate-2 transition-transform">
                            <div className="bg-amber-400 text-slate-900 p-2 rounded-lg font-black text-xl border-2 border-white">
                                PRASOBPAI
                            </div>
                            <span className="font-bold text-lg text-amber-100">ประสบภัย.คอม</span>
                        </Link>
                        <div className="flex space-x-6 items-center">
                            <Link href="/" className={`hover:text-amber-400 font-medium ${isActive('/') ? 'text-amber-400 underline decoration-wavy underline-offset-4' : ''}`}>ศูนย์บรรเทาทุกข์</Link>
                            <Link href="/submit" className={`hover:text-amber-400 font-medium ${isActive('/submit') ? 'text-amber-400 underline decoration-wavy underline-offset-4' : ''}`}>แจ้งเหตุฉุกเฉิน</Link>
                            <Link href="/about" className={`hover:text-amber-400 font-medium ${isActive('/about') ? 'text-amber-400 underline decoration-wavy underline-offset-4' : ''}`}>เกี่ยวกับเรา</Link>

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/profile/edit" className="flex items-center gap-2 hover:text-amber-400">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white flex items-center justify-center overflow-hidden">
                                            <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" />
                                        </div>
                                        <span className="text-sm font-medium">{user.user_metadata?.username || 'User'}</span>
                                    </Link>
                                    <button onClick={handleSignOut} className="text-red-400 hover:text-red-300" title="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors">
                                    เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Mobile Top Navigation (Fixed) --- */}
            <div className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showMobileMenu ? 'translate-y-0' : '-translate-y-full'}`}>
                {/* Upper Bar */}
                <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link href="/profile/edit">
                                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center overflow-hidden">
                                    <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" />
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <User className="text-amber-400" />
                            </Link>
                        )}
                    </div>
                    <div className="font-black text-lg text-amber-400 tracking-wide">PRASOBPAI</div>
                    <div className="flex items-center gap-3">
                        <Search size={22} className="text-white" />
                    </div>
                </div>

                {/* Sub-menu (Scrollable Tabs) */}
                <div className="bg-slate-800 text-slate-300 px-2 py-2 overflow-x-auto no-scrollbar flex items-center gap-6 shadow-lg">
                    {['ภาพรวม', 'ประสบการณ์', 'เกร็ดความรู้', 'แลกเครดิตความซวย', 'ร้านค้าแก้เคล็ด'].map((item, index) => (
                        <span key={index} className={`whitespace-nowrap text-sm font-medium px-2 pb-1 border-b-2 ${index === 0 ? 'text-amber-400 border-amber-400' : 'border-transparent'}`}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* --- Mobile Bottom Navigation (Fixed) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
                <Link href="/" className={`flex flex-col items-center gap-1 w-1/5 ${isActive('/') ? 'text-slate-900' : 'text-slate-400'}`}>
                    <Home size={24} strokeWidth={isActive('/') ? 3 : 2} />
                    <span className="text-[10px] font-bold">หน้าแรก</span>
                </Link>

                <button className="flex flex-col items-center gap-1 w-1/5 text-slate-400 hover:text-slate-900">
                    <FileText size={24} />
                    <span className="text-[10px] font-bold">บอร์ด</span>
                </button>

                {/* Central Floating Button */}
                <div className="relative w-1/5 flex justify-center">
                    <Link href="/submit" className="absolute -top-8 bg-slate-900 text-amber-400 p-4 rounded-full shadow-lg border-4 border-white transform hover:scale-105 transition-transform">
                        <Plus size={28} strokeWidth={3} />
                    </Link>
                    <span className="text-[10px] font-bold mt-8 text-slate-900">โพสต์</span>
                </div>

                <button className="flex flex-col items-center gap-1 w-1/5 text-slate-400 hover:text-slate-900">
                    <Bell size={24} />
                    <span className="text-[10px] font-bold">แจ้งเตือน</span>
                </button>

                <Link href="/profile/edit" className={`flex flex-col items-center gap-1 w-1/5 ${isActive('/profile/edit') ? 'text-slate-900' : 'text-slate-400'}`}>
                    <User size={24} strokeWidth={isActive('/profile/edit') ? 3 : 2} />
                    <span className="text-[10px] font-bold">ฉัน</span>
                </Link>
            </div>
        </>
    );
}
