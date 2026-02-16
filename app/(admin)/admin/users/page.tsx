'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Role, UserStatus } from '@prisma/client';
import { Award, Ban, Check, Clock, Edit2, Shield, ShieldCheck, UserCheck, User as UserIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserWithRole = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  rank: number;
  status: UserStatus;
};


export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ role: Role, rank: number, status: UserStatus } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: UserWithRole, b: UserWithRole) => {
             // Pending first
             if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
             if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
             return 0;
        });
        setUsers(sorted);
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
    if (editingId === user.id) {
      setEditingId(null);
      setEditForm(null);
    } else {
      setEditingId(user.id);
      setEditForm({ role: user.role, rank: user.rank || 1, status: user.status });
    }
  };

  const handleSave = async (userId: string) => {
    if (!editForm) return;
    
    setIsUpdating(true);
    const previousUsers = [...users];
    
    // Optimistic update
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, role: editForm.role, rank: editForm.rank, status: editForm.status } 
        : u
    ));
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, role: editForm.role, rank: editForm.rank, status: editForm.status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user');
      }
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      console.error(error);
      setUsers(previousUsers); // Revert
      alert('Не удалось обновить данные');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setIsUpdating(true);
    try {
        const res = await fetch(`/api/admin/users?userId=${userToDelete}`, { method: 'DELETE' });
        if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== userToDelete));
            setEditingId(null);
            setUserToDelete(null);
        } else {
            const data = await res.json();
            alert(data.error || "Не удалось удалить пользователя");
        }
    } catch (error) {
        console.error(error);
        alert("Ошибка при удалении");
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

  const getStatusBadge = (status: UserStatus) => {
    switch(status) {
        case 'PENDING': return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">На проверке</span>;
        case 'BANNED': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Заблокирован</span>;
        case 'ACTIVE': return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Активен</span>;
        default: return null;
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
        {users.map((user) => {
          const isEditing = editingId === user.id;

          return (
            <Card key={user.id} className={cn(
                "bg-[#0a0a0a] border transition-colors duration-300",
                isEditing ? 'border-[#e81c5a]/50' : 'border-[#1f1f1f]',
                user.status === 'PENDING' ? 'border-l-4 border-l-yellow-500' : ''
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
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
                            {getStatusBadge(user.status)}
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
                    {!isEditing && (
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                          user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          user.role === 'MODERATOR' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                          {getRoleLabel(user.role)}
                      </span>
                    )}
                    
                    <Button 
                        size="sm" 
                        variant={isEditing ? "secondary" : "ghost"}
                        className={`h-8 w-8 p-0 ${isEditing ? 'bg-white text-black hover:bg-gray-200' : ''}`}
                        onClick={() => handleEditClick(user)}
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />}
                    </Button>
                  </div>
                </div>

                {isEditing && editForm && (
                  <div className="mt-6 pt-6 border-t border-[#1f1f1f] animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-6">
                        {/* Status Selection */}
                        <div className="space-y-3">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус аккаунта</label>
                             <div className="border border-[#1f1f1f] bg-[#0f0f0f] rounded-xl p-1 flex gap-1">
                                {[
                                    { id: 'PENDING', label: 'На проверке', icon: Clock, color: 'text-yellow-500' },
                                    { id: 'ACTIVE', label: 'Активен', icon: UserCheck, color: 'text-green-500' },
                                    { id: 'BANNED', label: 'Бан', icon: Ban, color: 'text-red-500' }
                                ].map(status => (
                                    <button
                                        key={status.id}
                                        onClick={() => setEditForm(prev => prev ? ({ ...prev, status: status.id as UserStatus }) : null)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                            editForm.status === status.id ? "bg-[#1f1f1f] text-white shadow-sm" : "hover:bg-[#1f1f1f]/50 text-gray-500"
                                        )}
                                    >
                                        <status.icon className={cn("w-3 h-3", editForm.status === status.id ? status.color : "opacity-50")} />
                                        {status.label}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Выберите роль</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                  { id: 'MEMBER', label: 'Участник', icon: UserIcon, desc: 'Базовый доступ', color: 'gray' },
                                  { id: 'MODERATOR', label: 'Модератор', icon: Shield, desc: 'Проверка отчетов', color: 'blue' },
                                  { id: 'ADMIN', label: 'Администратор', icon: ShieldCheck, desc: 'Полный доступ', color: 'red' }
                                ].map((roleOption) => {
                                   const isSelected = editForm.role === roleOption.id;
                                   const Icon = roleOption.icon;
                                   
                                   let borderColor = 'border-[#1f1f1f]';
                                   let bgColor = 'bg-[#0f0f0f]';
                                   let iconColor = 'text-gray-500';
                                   
                                   if (isSelected) {
                                      bgColor = 'bg-[#1a1a1a]';
                                      if (roleOption.color === 'blue') { borderColor = 'border-blue-500'; iconColor = 'text-blue-500'; }
                                      else if (roleOption.color === 'red') { borderColor = 'border-red-500'; iconColor = 'text-red-500'; }
                                      else { borderColor = 'border-white'; iconColor = 'text-white'; }
                                   }

                                   return (
                                    <div 
                                        key={roleOption.id}
                                        onClick={() => setEditForm(prev => prev ? ({ ...prev, role: roleOption.id as Role }) : null)}
                                        className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-2 transition-all duration-200 hover:bg-[#1a1a1a] ${borderColor} ${bgColor}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <Icon className={`w-5 h-5 ${iconColor}`} />
                                            {isSelected && <div className={`w-2 h-2 rounded-full ${iconColor.replace('text-', 'bg-')}`} />}
                                        </div>
                                        <div>
                                            <h3 className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>{roleOption.label}</h3>
                                            <p className="text-xs text-gray-600">{roleOption.desc}</p>
                                        </div>
                                    </div>
                                   );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ранг участника</label>
                                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-3 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                        <Award className="w-4 h-4 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={editForm.rank}
                                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, rank: parseInt(e.target.value) || 0 }) : null)}
                                            className="bg-transparent border-none text-white h-8 text-lg font-mono focus-visible:ring-0 p-0"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                            onClick={() => setEditForm(prev => prev ? ({ ...prev, rank: Math.max(1, prev.rank - 1) }) : null)}
                                        >
                                            -
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                            onClick={() => setEditForm(prev => prev ? ({ ...prev, rank: prev.rank + 1 }) : null)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between gap-4">
                                <Button 
                                    onClick={() => setUserToDelete(user.id)}
                                    disabled={isUpdating}
                                    variant="destructive"
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                >
                                    {isUpdating ? <span className="animate-spin mr-2">⏳</span> : <Ban className="w-4 h-4 mr-2" />}
                                    Удалить
                                </Button>

                                <Button 
                                    onClick={() => handleSave(user.id)} 
                                    disabled={isUpdating} 
                                    className="bg-[#e81c5a] hover:bg-[#c21548] text-white"
                                >
                                    {isUpdating ? <span className="animate-spin mr-2">⏳</span> : <Check className="w-4 h-4 mr-2" />}
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogHeader>
          <DialogTitle>Удаление пользователя</DialogTitle>
          <DialogDescription>
             Вы действительно хотите удалить этого пользователя?
             <br />
             Это действие удалит весь прогресс, заявки и связанные данные. Отменить это действие невозможно.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUserToDelete(null)} className="h-9 border-[#1f1f1f] bg-transparent text-gray-400 hover:bg-[#1f1f1f] hover:text-white">
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isUpdating} className="h-9 bg-red-600 hover:bg-red-700 text-white">
            {isUpdating ? <span className="animate-spin mr-2">⏳</span> : null}
            Удалить навсегда
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
