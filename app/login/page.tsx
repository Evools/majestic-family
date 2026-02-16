'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Loader2, LogIn } from 'lucide-react';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDiscordLogin = () => {
    setIsLoading(true);
    nextAuthSignIn('discord', { callbackUrl: '/' });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Login failed:', result.error);
        // creating a simple alert for now, can be improved with a toast later
        alert('Invalid credentials');
        setIsLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 border-white/10 backdrop-blur-xl relative overflow-hidden z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#5865F2]/20 rounded-full blur-[80px] pointer-events-none" />
        
        <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Вход в систему
          </CardTitle>
          <CardDescription className="text-gray-400">
            Войдите через Discord или используя Email и Пароль.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Войти
            </Button>
          </form>

          <div className="text-center text-sm text-gray-400">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-white hover:underline transition-all">
              Зарегистрироваться
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/60 px-2 text-gray-400">Или продолжить через</span>
            </div>
          </div>

          <Button 
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition-all shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_30px_rgba(88,101,242,0.5)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.12 3.12 0 0 0-.04.09.073.073 0 0 0 0 .001 3.2 3.2 0 0 0-.649 1.344 19.467 19.467 0 0 0-5.328 0 3.2 3.2 0 0 0-.687-1.42.072.072 0 0 0-.077-.035 19.79 19.79 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Войти через Discord
          </Button>

          {/* <div className="text-center text-sm text-gray-400 mt-4">
            Хотите вступить в семью?{' '}
            <Link href="/payouts" className="text-[#e81c5a] hover:underline transition-all font-medium">
              Подать заявку
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
