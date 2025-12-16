export const metadata = {
    title: 'เกี่ยวกับเรา - Prasobpai.com | เว็บรวมเรื่องซวยและพื้นที่ระบายของคนดวงตก',
    description: 'รู้จักกับ Prasobpai.com (ประสบภัย.คอม) คอมมูนิตี้เปลี่ยนเรื่องซวยให้เป็นเรื่องแชร์ พื้นที่ระบายความเครียด อ่านเรื่องตลกร้าย และมรสุมชีวิตของเพื่อนร่วมโลก'
};

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RealTimeStats from '@/components/RealTimeStats';
import Link from 'next/link';
import { CloudRain, Zap, Coffee, LifeBuoy, AlertTriangle, Users, Activity, Bug, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header Section */}
                    <section className="text-center space-y-6">
                        <div className="inline-block bg-slate-900 text-amber-400 px-3 py-1 rounded-full text-sm font-bold transform -rotate-2">
                            พื้นที่ของคนดวงตก
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            เกี่ยวกับ <span className="text-red-600 bg-yellow-200 px-2 transform rotate-1 inline-block">Prasobpai.com</span> <br />
                            ศูนย์รวมผู้ประสบภัยทางชีวิต
                        </h1>
                        <p className="text-lg md:text-xl text-slate-700 font-medium max-w-2xl mx-auto">
                            ยินดีต้อนรับสู่ <span className="font-bold">Prasobpai.com (ประสบภัย.คอม)</span> – คอมมูนิตี้บำบัดทุกข์บำรุงสุข สำหรับคนที่รู้สึกว่าโลกนี้ช่างโหดร้ายกับเราเหลือเกิน!
                        </p>
                    </section>

                    {/* Value Proposition */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <HeartHandshake className="text-rose-500" /> ทำไมต้องมีเว็บนี้?
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                เราเชื่อว่า <span className="font-bold text-slate-900">"ความซวย"</span> เป็นทรัพยากรที่ใช้แล้วไม่หมดไป ไม่ว่าจะเดินตกท่อ แฟนเก่าทักมายืมเงิน หรือเจ้านายตามงานตอนตีสอง... เรื่องเหล่านี้ถ้าเก็บไว้คนเดียวมันคือ "ความเครียด" แต่ถ้าเล่าออกมาให้เพื่อนฟัง มันจะกลายเป็น "คอนเทนต์" ทันที
                            </p>
                            <p>
                                ที่นี่ไม่ใช่แค่เว็บระบายความในใจ แต่คือ <span className="bg-green-100 text-green-800 px-1 rounded font-bold">พื้นที่ปลอดภัย (Safe Zone)</span> ให้คุณได้ปลดปล่อย พักใจ และหัวเราะทั้งน้ำตาไปพร้อมกับเพื่อนร่วมชะตากรรมทั่วไทย เพราะเราอยากบอกให้รู้ว่า <span className="underline decoration-wavy decoration-red-500">"คุณไม่ได้ซวยคนเดียว"</span>
                            </p>
                        </div>
                    </section>

                    {/* Categories Grid */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">รวบรวมภัยความฮาและดราม่าชีวิตไว้ครบจบ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <Link href="/" className="group">
                                <div className="bg-blue-50 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-md transition-all h-full cursor-pointer group-hover:-translate-y-1">
                                    <CloudRain size={32} className="text-blue-600 mb-3" />
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">มรสุมชีวิต</h3>
                                    <p className="text-slate-600 text-sm">เรื่องหนักอกหนักใจ ปัญหาความรัก การงาน การเงิน ที่อยากระบาย</p>
                                </div>
                            </Link>
                            <Link href="/" className="group">
                                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-slate-200 hover:border-yellow-500 hover:shadow-md transition-all h-full cursor-pointer group-hover:-translate-y-1">
                                    <Zap size={32} className="text-yellow-600 mb-3" />
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">ภัยรายวัน</h3>
                                    <p className="text-slate-600 text-sm">เรื่องซวยเล็กๆ น้อยๆ ในชีวิตประจำวัน ที่เจอแล้วต้องร้อง "อิหยังวะ"</p>
                                </div>
                            </Link>
                            <Link href="/" className="group">
                                <div className="bg-orange-50 p-6 rounded-xl border-2 border-slate-200 hover:border-orange-500 hover:shadow-md transition-all h-full cursor-pointer group-hover:-translate-y-1">
                                    <Coffee size={32} className="text-orange-600 mb-3" />
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">ขำแห้ง</h3>
                                    <p className="text-slate-600 text-sm">เรื่องตลกร้ายที่ทำได้แค่ยิ้มแห้งๆ ให้โชคชะตา</p>
                                </div>
                            </Link>
                            <Link href="/" className="group">
                                <div className="bg-green-50 p-6 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:shadow-md transition-all h-full cursor-pointer group-hover:-translate-y-1">
                                    <LifeBuoy size={32} className="text-green-600 mb-3" />
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">คู่มือรอด</h3>
                                    <p className="text-slate-600 text-sm">ทริคการใช้ชีวิต หรือสายมูเตลู เพื่อก้าวผ่านวันแย่ๆ ไปให้ได้</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Fun Stats (Gimmick) */}
                    {/* Real-Time Stats */}
                    <div className="py-8">
                        <RealTimeStats />
                    </div>

                    {/* Meet The Team */}
                    <section className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Meet the Team</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            {/* Team Member 1 */}
                            <div className="w-full md:w-64 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
                                <div className="w-24 h-24 bg-rose-100 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm filter grayscale hover:grayscale-0 transition-all">
                                    <Users size={40} className="text-rose-500" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Admin</h3>
                                <p className="text-rose-500 font-bold text-xs uppercase tracking-wide mb-2">หน่วยกู้ภัยความรู้สึก</p>
                                <p className="text-slate-500 text-sm italic">"ซับน้ำตาด้วยมีม"</p>
                            </div>

                            {/* Team Member 2 */}
                            <div className="w-full md:w-64 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
                                <div className="w-24 h-24 bg-indigo-100 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm filter grayscale hover:grayscale-0 transition-all">
                                    <Bug size={40} className="text-indigo-500" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Developer</h3>
                                <p className="text-indigo-500 font-bold text-xs uppercase tracking-wide mb-2">ผู้เชี่ยวชาญด้านการ(สร้าง)บั๊ก</p>
                                <p className="text-slate-500 text-sm italic">"เขียนโค้ดหลักสิบ แก้บั๊กหลักร้อย"</p>
                            </div>
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className="text-center space-y-6 pt-8 pb-8">
                        <h2 className="text-3xl font-black text-slate-900">อย่าเก็บความซวยไว้ให้หนักสมอง</h2>
                        <p className="text-slate-600">เปลี่ยนเรื่องร้ายให้กลายเป็นเรื่องเล่าสุดพีกได้แล้ววันนี้</p>
                        <Link href="/submit">
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-[0px_8px_20px_rgba(220,38,38,0.4)] hover:shadow-[0px_8px_25px_rgba(220,38,38,0.5)] transform hover:-translate-y-1 transition-all">
                                <AlertTriangle className="inline-block mr-2" /> แจ้งเหตุฉุกเฉิน
                            </button>
                        </Link>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
