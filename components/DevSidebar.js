'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Database, Home, User, FileText, Lock, EyeOff } from 'lucide-react';

export default function DevSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const pages = [
        { name: 'หน้าแรก', path: '/', icon: <Home size={16} /> },
        { name: 'แจ้งเหตุ', path: '/submit', icon: <FileText size={16} /> },
        { name: 'เกี่ยวกับเรา', path: '/about', icon: <User size={16} /> },
        { name: 'เข้าสู่ระบบ', path: '/login', icon: <Lock size={16} /> },
        { name: 'แก้ไขโปรไฟล์', path: '/profile/edit', icon: <User size={16} /> },
        { name: 'นโยบายความเป็นส่วนตัว', path: '/privacy', icon: <EyeOff size={16} /> },
    ];

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900 text-amber-400 p-3 rounded-full shadow-lg border-2 border-amber-400 hover:bg-slate-800 transition-all hover:scale-110"
                title="Dev Navigation"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Content */}
            <div
                className={`absolute bottom-16 right-0 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-4 w-56 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <div className="text-amber-400 font-bold text-sm mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">
                    เมนูลัด
                </div>
                <div className="flex flex-col gap-2">
                    {pages.map((page) => (
                        <Link
                            key={page.path}
                            href={page.path}
                            className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors text-sm font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="text-amber-400">{page.icon}</div>
                            {page.name}
                        </Link>
                    ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] text-slate-500 text-center">
                    เมนูผู้พัฒนา &copy; Prasobpai
                </div>
            </div>
        </div>
    );
}
