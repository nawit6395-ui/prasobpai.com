export const metadata = {
    title: 'นโยบายความเป็นส่วนตัว - Prasobpai.com',
    description: 'นโยบายความเป็นส่วนตัวของ Prasobpai.com (ประสบภัย.คอม) อธิบายวิธีการเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ'
};

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Eye, Lock, Trash2, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPage() {
    const lastUpdated = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header */}
                    <section className="text-center space-y-4">
                        <div className="inline-block bg-slate-900 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                            Privacy Policy
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            นโยบายความเป็นส่วนตัว
                        </h1>
                        <p className="text-slate-500">อัปเดตล่าสุดเมื่อ: {lastUpdated}</p>
                    </section>

                    {/* Section 1: Summary (TL;DR) */}
                    <section className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-amber-600 mb-6 flex items-center gap-2">
                            <Lock className="w-6 h-6" /> ฉบับย่อ (สำหรับผู้ประสบภัย)
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Eye size={18} className="text-slate-400" /> เราเก็บอะไรบ้าง?
                                </h3>
                                <p className="text-slate-600 text-sm">เราเก็บข้อมูลพื้นฐาน เช่น อีเมล ชื่อผู้ใช้ (Username) และรูปโปรไฟล์ เพื่อให้คุณ Login และโพสต์เรื่องราวได้</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <FileText size={18} className="text-slate-400" /> เรื่องที่คุณโพสต์
                                </h3>
                                <p className="text-slate-600 text-sm">เนื้อหาที่คุณกดโพสต์ถือเป็น "ข้อมูลสาธารณะ" เพื่อความบันเทิง (โปรดระวังการเปิดเผยชื่อจริงของบุคคลที่สาม)</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Shield size={18} className="text-slate-400" /> นิรนามคือปกปิด
                                </h3>
                                <p className="text-slate-600 text-sm">ถ้าเลือกโพสต์ "นิรนาม" ชื่อจะไม่โชว์หน้าเว็บ แต่หลังบ้านเรารู้ว่าเป็นใคร (เพื่อความปลอดภัยตามกฎหมาย)</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Trash2 size={18} className="text-slate-400" /> ลบได้เสมอ
                                </h3>
                                <p className="text-slate-600 text-sm">อยากลบโพสต์ หรือลบบัญชี แจ้งเราได้ตลอดเวลา เราไม่นำข้อมูลไปขายให้ใคร สบายใจได้</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200 border-dashed" />

                    {/* Section 2: Full Policy */}
                    <section className="prose prose-slate max-w-none">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="text-slate-400" /> นโยบายความเป็นส่วนตัว (ฉบับเต็ม)
                        </h2>
                        <p className="lead">
                            Prasobpai.com ("เรา" หรือ "เว็บไซต์") ให้ความสำคัญกับความเป็นส่วนตัวของคุณ นโยบายนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ เมื่อคุณเข้าใช้งานเว็บไซต์ของเรา เพื่อร่วมแบ่งปันประสบการณ์ "เปลี่ยนเรื่องซวย ให้เป็นเรื่องแชร์"
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อผู้ใช้ (Username), รูปภาพโปรไฟล์, และที่อยู่อีเมล (Email Address) ที่ได้จากการสมัครสมาชิก หรือการล็อกอินผ่าน Third-party (เช่น Google Login)</li>
                            <li><strong>เนื้อหาที่คุณสร้างขึ้น (User Generated Content):</strong> ข้อความ, รูปภาพ, และเรื่องราวที่คุณโพสต์ลงในเว็บไซต์ ทั้งในส่วนของ "แจ้งเหตุฉุกเฉิน", คอมเมนต์ และการกดถูกใจ</li>
                            <li><strong>ข้อมูลทางเทคนิค:</strong> หมายเลข IP Address, ประเภทของเบราว์เซอร์, ข้อมูลคุกกี้ (Cookies) และสถิติการใช้งานเว็บไซต์ เพื่อนำมาปรับปรุงระบบให้ดียิ่งขึ้น</li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. วัตถุประสงค์ในการใช้ข้อมูล</h3>
                        <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            <li>ยืนยันตัวตนในการเข้าสู่ระบบ (Login) และจัดการบัญชีผู้ใช้งาน</li>
                            <li>แสดงผลเรื่องราวของคุณบนหน้าเว็บไซต์ตามหมวดหมู่ที่คุณเลือก</li>
                            <li>วิเคราะห์ข้อมูลการใช้งาน (Analytics) เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์ และ SEO</li>
                            <li>ติดต่อสื่อสารกับคุณในกรณีที่จำเป็น เช่น การแจ้งเตือนเกี่ยวกับบัญชี หรือการละเมิดกฎชุมชน</li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. การเปิดเผยข้อมูลและการแสดงผล</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            <li><strong>เนื้อหาสาธารณะ:</strong> เรื่องราวที่คุณโพสต์จะถูกเผยแพร่ต่อสาธารณะ และอาจถูกค้นหาได้ผ่าน Search Engine (เช่น Google)</li>
                            <li><strong>การโพสต์แบบนิรนาม:</strong> หากคุณเลือกโพสต์ในโหมด "นิรนาม" ระบบจะไม่แสดงชื่อผู้ใช้ของคุณต่อหน้าสาธารณะ แต่ข้อมูลดังกล่าวยังคงถูกบันทึกในฐานข้อมูลของเราเพื่อวัตถุประสงค์ทางกฎหมายและความปลอดภัย</li>
                            <li><strong>บุคคลที่สาม:</strong> เราจะไม่ขาย หรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอก ยกเว้นกรณีที่ต้องปฏิบัติตามกฎหมาย หรือได้รับความยินยอมจากคุณ</li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. คุกกี้ (Cookies)</h3>
                        <p className="text-slate-700">เว็บไซต์นี้ใช้คุกกี้เพื่อจดจำการตั้งค่าการใช้งานของคุณ (เช่น การล็อกอินค้างไว้) และเพื่อเก็บสถิติผู้เข้าชม การใช้งานเว็บไซต์อย่างต่อเนื่องถือว่าคุณยอมรับนโยบายคุกกี้ของเรา</p>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. สิทธิ์ของคุณ (User Rights)</h3>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            <li><strong>สิทธิ์ในการเข้าถึงและแก้ไข:</strong> คุณสามารถแก้ไขข้อมูลส่วนตัวและเรื่องราวที่คุณโพสต์ได้ด้วยตนเอง</li>
                            <li><strong>สิทธิ์ในการลบ:</strong> คุณสามารถแจ้งขอให้เราลบบัญชีผู้ใช้ หรือลบเรื่องราวที่คุณโพสต์ได้ทุกเมื่อ โดยติดต่อทีมงาน</li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. ความปลอดภัยของข้อมูล</h3>
                        <p className="text-slate-700">เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคที่เหมาะสม เพื่อป้องกันการเข้าถึง แก้ไข หรือทำลายข้อมูลของคุณโดยไม่ได้รับอนุญาต</p>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. ติดต่อเรา</h3>
                        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                            <p className="mb-2">หากคุณมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการแจ้งลบข้อมูล สามารถติดต่อเราได้ที่:</p>
                            <p className="font-bold text-slate-900">อีเมล: admin@prasobpai.com</p>
                            <p className="font-bold text-slate-900">Facebook Page: Prasobpai - ประสบภัย.คอม</p>
                        </div>

                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
