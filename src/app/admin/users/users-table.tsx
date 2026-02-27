'use client';

import { useState } from 'react';
import { assignUserRole, disableUser } from '@/lib/user-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/roles';
import type { UserProfile } from '@/types/user';
import { Loader2 } from 'lucide-react';

export function UsersTable({ users: initialUsers }: { users: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setLoadingId(userId);
    const result = await assignUserRole(userId, newRole);
    if (result.success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast({ title: 'Role Updated', description: `User role changed to ${ROLE_LABELS[newRole]}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingId(null);
  };

  const handleDisableToggle = async (userId: string, currentDisabled: boolean) => {
    setLoadingId(userId);
    const result = await disableUser(userId, !currentDisabled);
    if (result.success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, disabled: !currentDisabled } : u));
      toast({
        title: !currentDisabled ? 'User Disabled' : 'User Enabled',
        description: !currentDisabled ? 'User has been disabled.' : 'User has been re-enabled.',
      });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingId(null);
  };

  if (users.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No registered users yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.uid} className={user.disabled ? 'opacity-50' : ''}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.displayName || 'Unnamed'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.uid, value as Role)}
                  disabled={loadingId === user.uid}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <Switch
                  checked={!user.disabled}
                  onCheckedChange={() => handleDisableToggle(user.uid, user.disabled)}
                  disabled={loadingId === user.uid}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
