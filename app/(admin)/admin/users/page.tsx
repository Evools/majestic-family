'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/custom-select';
import { Role } from '@prisma/client';
import { Shield, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserWithRole = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        setUsers(await res.json());
      } else {
        // Handle unauthorized or error
        if (res.status === 401) router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as Role } : u));
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 text-red-500" />;
      case 'MODERATOR': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Управление участниками</h1>
        <span className="text-gray-400 text-sm">Всего: {users.length}</span>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-[#0a0a0a] border border-[#1f1f1f]">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user.image ? (
                   <img src={user.image} alt={user.name || ''} className="w-10 h-10 rounded-full" />
                ) : (
                   <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="font-bold text-white">{user.name?.[0]}</span>
                   </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{user.name}</p>
                        {getRoleIcon(user.role)}
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="w-48">
                  <CustomSelect 
                    options={[
                        { value: 'MEMBER', label: 'Участник' },
                        { value: 'MODERATOR', label: 'Модератор' },
                        { value: 'ADMIN', label: 'Администратор' },
                    ]}
                    value={user.role}
                    onChange={(val) => handleRoleChange(user.id, val)}
                    className="h-9 text-xs"
                    placeholder="Выберите роль"
                  />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
