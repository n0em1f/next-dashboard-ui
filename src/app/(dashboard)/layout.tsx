import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import AIAssistantContainer from '@/components/AIAssistantContainer';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Global blurred background */}

      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086')",
          filter: 'blur(6px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Dark overlay */}

      <div className="fixed inset-0 bg-black/50 -z-10" />

      {/* LEFT - sidebar */}

      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 overflow-hidden h-screen flex flex-col">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold text-white">Academos</span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          {' '}
          <Menu />
        </div>
      </div>

      {/* RIGHT - main content */}

      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] flex flex-col">
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
          <Navbar />
        </div>
        <div className="flex-1 bg-white/15 backdrop-blur-sm overflow-y-auto">
          {children}
        </div>
      </div>
      <AIAssistantContainer />
    </div>
  );
}
