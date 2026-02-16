'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Redirect to login page on success
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 border-white/10 backdrop-blur-xl relative overflow-hidden z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#e81c5a]/20 rounded-full blur-[80px] pointer-events-none" />
        
        <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Регистрация
          </CardTitle>
          <CardDescription className="text-gray-400">
            Создайте аккаунт для доступа к системе.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
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
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e81c5a] hover:bg-[#c01548] text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Зарегистрироваться
            </Button>
          </form>

          <div className="text-center text-sm text-gray-400 mt-4">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-white hover:underline transition-all">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
