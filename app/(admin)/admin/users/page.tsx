'use client'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/custom-select';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Role } from '@prisma/client';
import { Award, Edit2, Shield, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserWithRole = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  rank: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false); // Using separate state for dialog visibility
  const [newRole, setNewRole] = useState<Role | null>(null);
  const [newRank, setNewRank] = useState<number>(1);
  const [isUpdating, setIsUpdating] = useState(false);
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
        if (res.status === 401) router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewRank(user.rank || 1);
    setIsEditOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setIsUpdating(true);
    // Optimistic update
    const previousUsers = [...users];
    const updatedUser = { ...selectedUser, role: newRole, rank: newRank };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, role: newRole, rank: newRank }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user');
      }
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      setUsers(previousUsers); // Revert
      alert('Не удалось обновить данные');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 text-red-500" />;
      case 'MODERATOR': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'Администратор';
      case 'MODERATOR': return 'Модератор';
      default: return 'Участник';
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
                   // eslint-disable-next-line @next/next/no-img-element
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
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{user.email}</span>
                        {user.rank > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                                <Award className="w-3 h-3" />
                                Ранг: {user.rank}
                            </span>
                        )}
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full border ${
                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    user.role === 'MODERATOR' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                    {getRoleLabel(user.role)}
                </span>
                
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditClick(user)}
                >
                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        {selectedUser && (
            <>
                <DialogHeader>
                    <DialogTitle>Редактирование пользователя</DialogTitle>
                    <DialogDescription>
                        Измените данные пользователя {selectedUser.name}. 
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-6 space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f]">
                        {selectedUser.image ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={selectedUser.image} alt={selectedUser.name || ''} className="w-12 h-12 rounded-full" />
                        ) : (
                           <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="font-bold text-white text-lg">{selectedUser.name?.[0]}</span>
                           </div>
                        )}
                        <div>
                            <p className="font-bold text-white text-lg">{selectedUser.name}</p>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Роль в системе</label>
                        <CustomSelect 
                            options={[
                                { value: 'MEMBER', label: 'Участник (Доступ к общим функциям)' },
                                { value: 'MODERATOR', label: 'Модератор (Проверка отчетов)' },
                                { value: 'ADMIN', label: 'Администратор (Полный доступ)' },
                            ]}
                            value={newRole || 'MEMBER'}
                            onChange={(val) => setNewRole(val as Role)}
                            className="bg-[#0f0f0f]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Ранг (Уровень доступа)</label>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={newRank}
                            onChange={(e) => setNewRank(parseInt(e.target.value) || 0)}
                            className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                        />
                        <p className="text-xs text-gray-500">Укажите числовое значение ранга (например, 1-10)</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-[#1f1f1f] hover:bg-[#1f1f1f] text-white">
                        Отмена
                    </Button>
                    <Button onClick={handleSaveRole} disabled={isUpdating} className="bg-[#e81c5a] hover:bg-[#c21548] text-white">
                        {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </DialogFooter>
            </>
        )}
      </Dialog>
    </div>
  );
}
