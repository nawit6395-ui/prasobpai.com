import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="hidden md:block bg-slate-900 text-slate-400 py-12 border-t-8 border-amber-400">
            <div className="max-w-6xl mx-auto px-4 text-center flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; 2024 Prasobpai. All wrongs reserved.</p>
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                    <Link href="/about" className="hover:text-amber-400 transition-colors">เกี่ยวกับเรา</Link>
                    <Link href="/" className="hover:text-amber-400 transition-colors">รวมเรื่องซวยรายวัน</Link>
                    <Link href="/" className="hover:text-amber-400 transition-colors">บทความแนะนำ</Link>
                    <Link href="/privacy" className="hover:text-amber-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
                </div>
            </div>
        </footer>
    );
}
