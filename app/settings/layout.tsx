import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Sidebar } from '@/components/sidebar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar Area */}
      <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Placeholder */}
        <header className="md:hidden h-16 border-b border-[#1f1f1f] flex items-center px-4 bg-[#0a0a0a]">
            <span className="font-bold text-white">SHELBY FAMILY</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {/* Dotted Background for Main Area */}
            <div className="absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-20" />
            
            <div className="relative z-10">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
