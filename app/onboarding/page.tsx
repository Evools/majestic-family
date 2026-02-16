import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SignOutButton } from "@/components/auth/sign-out-button"; // Need to create this or use client component inline
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Ban, Clock, FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ApplicationForm } from "./application-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // If user is already active, send them to dashboard
  if (session.user.status === 'ACTIVE' || session.user.role === 'ADMIN' || session.user.role === 'MODERATOR') {
    redirect("/");
  }

  // Check if banned
  if (session.user.status === 'BANNED') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0a0a0a] border-red-900/50">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ban className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Доступ ограничен</h1>
            <p className="text-gray-400">Ваш аккаунт был заблокирован администрацией.</p>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for existing application
  const existingApplication = await prisma.recruitmentApplication.findUnique({
    where: { userId: session.user.id }
  });

  // If Rejected (User status might be REJECTED or Application is REJECTED)
  if (session.user.status === 'REJECTED' || (existingApplication && existingApplication.status === 'REJECTED')) {
     return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0a0a0a] border-red-900/50">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ban className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Заявка отклонена</h1>
            <p className="text-gray-400">К сожалению, ваша заявка на вступление была отклонена. Вы не можете повторно подать заявку.</p>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Pending Application
  if (existingApplication && existingApplication.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <Card className="w-full max-w-md bg-[#121212] border-[#1f1f1f] relative z-10">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-yellow-500/20">
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Заявка на рассмотрении</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Мы получили вашу заявку и рассматриваем ее. Это обычно занимает до 24 часов.
                <br />
                Пожалуйста, следите за обновлениями в нашем Discord.
              </p>
            </div>

            <div className="bg-[#1f1f1f]/50 rounded-lg p-4 border border-[#1f1f1f] text-left">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Статус: {existingApplication.status}</p>
                  <p className="text-xs text-gray-500">
                    ID заявки: {existingApplication.id}
                  </p>
                </div>
              </div>
            </div>

            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // No application -> Show Form
  // Try to pre-fill from user profile/account if possible
  // We don't have direct access to Discord profile in session unless we put it there.
  // But we have session.user.name, image etc.
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-10 w-full max-w-2xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Добро пожаловать</h1>
                <p className="text-gray-400">Для завершения регистрации, пожалуйста, подайте заявку на вступление.</p>
            </div>
            
            <ApplicationForm 
                initialDiscordName={session.user.name || ""} 
            />
            
            <div className="mt-8 text-center">
                <SignOutButton variant="ghost" />
            </div>
        </div>
    </div>
  );
}
