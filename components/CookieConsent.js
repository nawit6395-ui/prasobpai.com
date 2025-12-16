'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('prasobpai_cookie_consent');
        if (!hasAccepted) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('prasobpai_cookie_consent', 'true');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
            <div className="max-w-6xl mx-auto bg-slate-900/95 backdrop-blur-sm text-white rounded-2xl shadow-2xl p-4 md:p-6 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Text Content */}
                <div className="flex items-start gap-4 flex-1">
                    <div className="bg-amber-400 p-2 rounded-lg shrink-0">
                        <Cookie className="text-slate-900 w-6 h-6" />
                    </div>
                    <div className="text-sm md:text-base text-slate-300">
                        <p className="font-bold text-white mb-1">เราใช้คุกกี้ (Cookies) 🍪</p>
                        <p>
                            เว็บไซต์นี้ใช้คุกกี้เพื่อจดจำการตั้งค่าและปรับปรุงประสบการณ์ของคุณ การใช้งานเว็บไซต์อย่างต่อเนื่องถือว่าคุณยอมรับ
                            <Link href="/privacy" className="text-amber-400 hover:text-amber-300 ml-1 underline underline-offset-2">
                                นโยบายความเป็นส่วนตัว
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={handleAccept}
                    className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all whitespace-nowrap"
                >
                    ยอมรับทั้งหมด
                </button>
            </div>
        </div>
    );
}
