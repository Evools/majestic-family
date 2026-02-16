import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OnlineUsersPopover } from "@/components/online-users-popover";
import { Sidebar } from "@/components/sidebar"; // Reusing Sidebar for now, maybe custom later
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
    // Or a custom 403 page
    return (
      <div className="flex min-h-screen bg-[#050505] items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#e81c5a]">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
          <a href="/" className="text-blue-500 hover:underline">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
       {/* Sidebar Area - Reusing the main sidebar for consistent look, or we can make a specific AdminSidebar */}
      <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 border-b border-[#1f1f1f] flex items-center px-4 bg-[#0a0a0a]">
            <span className="font-bold text-white">SHELBY ADMIN</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {/* Dotted Background for Main Area */}
            <div className="absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-20" />
            
            <div className="relative z-10">
                {children}
            </div>
        </main>
      </div>
      {/* Online Users Popover */}
      <OnlineUsersPopover />
    </div>
  );
}
