import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Feed from '@/components/Feed';
import Footer from '@/components/Footer';


export default function Home() {
  return (
    <div className="min-h-screen bg-[#fffbf0] font-sans selection:bg-amber-200 selection:text-slate-900">
      <Navbar />
      <Hero />

      <Feed />
      <Footer />
    </div>
  );
}