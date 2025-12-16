'use client';

import Link from 'next/link';
import { PlusCircle, AlertTriangle } from 'lucide-react';

export default function Hero() {
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
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                        >
                            <PlusCircle size={20} className="inline mr-2" /> แจ้งเหตุฉุกเฉิน
                        </button>
                    </div>
                </div>

                <div className="md:w-1/3 w-full">
                    <div className="bg-white p-6 rounded-lg border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] transform rotate-2 md:hover:rotate-0 transition-transform cursor-pointer">
                        <div className="flex justify-between items-center mb-3 border-b-2 border-dashed border-slate-200 pb-2">
                            <span className="font-bold text-red-600 flex items-center gap-1 text-sm md:text-base"><AlertTriangle size={16} /> ภัยพิบัติประจำสัปดาห์</span>
                            <span className="text-xs text-slate-500">วันนี้</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">แฟนเก่าทักมาขอยืมเงิน...</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                            หลังจากเลิกกันไป 3 ปี อยู่ดีๆ ก็ทักมา "เตง สบายดีมั้ย พอดีเราเดือดร้อน..." นึกว่าจะมาง้อ ที่ไหนได้!!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
