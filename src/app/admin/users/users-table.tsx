'use client';

import { useState } from 'react';
import { assignUserRole, disableUser, createUserManually, adminUpdateUser, deleteUser } from '@/lib/user-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/roles';
import type { UserProfile } from '@/types/user';
import { Plus, Edit2, Trash2, Search, Mail, Shield, User, Phone, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { IosLoader } from '@/components/ui/ios-loader';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const DOMAIN_OPTIONS = [
  { value: 'gen_ai', label: 'Generative AI' },
  { value: 'ds_ml', label: 'Data Science & ML' },
  { value: 'azure', label: 'Azure Cloud' },
  { value: 'web_app', label: 'Web & App Dev' },
  { value: 'event_management', label: 'Event Management' },
  { value: 'public_relations', label: 'Public Relations' },
  { value: 'media_marketing', label: 'Media & Marketing' },
  { value: 'creativity', label: 'Creativity' },
];

export function UsersTable({ users: initialUsers }: { users: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    displayName: '',
    email: '',
    username: '',
    role: 'user' as Role,
    domain: 'gen_ai',
    phone: '',
    rollNo: '',
    branch: '',
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    username: '',
    role: 'user' as Role,
    domain: 'gen_ai',
    phone: '',
    rollNo: '',
    branch: '',
    bio: '',
  });

  // Delete User Dialog State
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setLoadingId(userId);
    const user = users.find(u => u.uid === userId);
    const domain = newRole === 'panel' ? (user?.domain || 'gen_ai') : null;
    const result = await assignUserRole(userId, newRole, domain);
    if (result.success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole, domain } : u));
      toast({ title: 'Role Updated', description: `User role changed to ${ROLE_LABELS[newRole]}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingId(null);
  };

  const handleDomainChange = async (userId: string, domain: string) => {
    setLoadingId(userId);
    const user = users.find(u => u.uid === userId);
    if (!user) return;
    const result = await assignUserRole(userId, user.role, domain);
    if (result.success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, domain } : u));
      toast({ title: 'Domain Updated', description: `User panel domain set to ${DOMAIN_OPTIONS.find(d => d.value === domain)?.label || domain}.` });
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

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.displayName || !createForm.email) {
      toast({ variant: 'destructive', title: 'Required Fields', description: 'Name and Email are required.' });
      return;
    }
    setCreateLoading(true);
    const res = await createUserManually(createForm);
    if (res.success && res.user) {
      setUsers(prev => [res.user!, ...prev]);
      toast({ title: 'User Created', description: `User ${createForm.displayName} has been added successfully.` });
      setIsCreateOpen(false);
      setCreateForm({
        displayName: '',
        email: '',
        username: '',
        role: 'user',
        domain: 'gen_ai',
        phone: '',
        rollNo: '',
        branch: '',
      });
    } else {
      toast({ variant: 'destructive', title: 'Creation Failed', description: res.error || 'Failed to create user.' });
    }
    setCreateLoading(false);
  };

  // Open Edit User
  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'user',
      domain: user.domain || 'gen_ai',
      phone: (user as any).phone || '',
      rollNo: user.rollNo || '',
      branch: user.branch || '',
      bio: user.bio || '',
    });
  };

  // Handle Update User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    const res = await adminUpdateUser(editingUser.uid, editForm);
    if (res.success) {
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? {
        ...u,
        ...editForm,
        domain: editForm.role === 'panel' ? editForm.domain : null,
      } : u));
      toast({ title: 'User Updated', description: 'User profile updated successfully.' });
      setEditingUser(null);
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: res.error || 'Failed to update user.' });
    }
    setEditLoading(false);
  };

  // Handle Delete User Confirmation
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    const res = await deleteUser(userToDelete.uid);
    if (res.success) {
      setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
      toast({ title: 'User Deleted', description: 'User account has been permanently removed.' });
      setUserToDelete(null);
    } else {
      toast({ variant: 'destructive', title: 'Delete Failed', description: res.error || 'Failed to delete user.' });
    }
    setDeleteLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 stroke-[2.5]" />
          <Input 
            placeholder="Search by name, email, roll no, or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]"
          />
        </div>

        {/* Add User Button & Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000000] gap-2">
              <Plus className="h-4 w-4 stroke-[3]" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-4 border-black text-black shadow-[10px_10px_0px_0px_#000000] font-sans">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-black uppercase italic text-black">Add New User</DialogTitle>
              <DialogDescription className="text-zinc-600 text-xs font-bold">
                Manually register a user or team member account into the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-black">Full Name *</Label>
                <Input 
                  placeholder="e.g. Rahul Sharma"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm(p => ({ ...p, displayName: e.target.value }))}
                  required
                  className="bg-white border-2 border-black text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Email Address *</Label>
                  <Input 
                    type="email"
                    placeholder="user@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Username (Optional)</Label>
                  <Input 
                    placeholder="e.g. rahul_s"
                    value={createForm.username}
                    onChange={(e) => setCreateForm(p => ({ ...p, username: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Roll Number</Label>
                  <Input 
                    placeholder="e.g. 21B01A0501"
                    value={createForm.rollNo}
                    onChange={(e) => setCreateForm(p => ({ ...p, rollNo: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Branch</Label>
                  <Input 
                    placeholder="e.g. CSE"
                    value={createForm.branch}
                    onChange={(e) => setCreateForm(p => ({ ...p, branch: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-black">Role</Label>
                <Select 
                  value={createForm.role} 
                  onValueChange={(val) => setCreateForm(p => ({ ...p, role: val as Role }))}
                >
                  <SelectTrigger className="bg-white border-2 border-black text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black text-black">
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {createForm.role === 'panel' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Panel Tech Domain</Label>
                  <Select 
                    value={createForm.domain} 
                    onValueChange={(val) => setCreateForm(p => ({ ...p, domain: val }))}
                  >
                    <SelectTrigger className="bg-white border-2 border-black text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black text-black">
                      {DOMAIN_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-2 border-black bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000]">
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading} className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2">
                  {createLoading ? (
                    <>
                      <IosLoader size="xs" color="text-black" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000]">
          <User className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-[2]" />
          <p className="text-black text-sm font-bold">No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers.map(user => {
            const isSuperAdminEmail = user.email === 'vinaysiddha19@gmail.com';

            return (
              <div 
                key={user.uid} 
                className={`flex flex-col gap-4 p-5 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000000] transition-all duration-200 ${user.disabled ? 'opacity-50 grayscale-[0.5]' : 'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#000000]'}`}
              >
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="h-10 w-10 border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="bg-[#FFE600] text-black font-black">{user.displayName?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-black text-sm truncate text-black uppercase">{user.displayName || 'Unnamed'}</span>
                      <span className="text-xs text-zinc-600 truncate font-bold" title={user.email}>{user.email}</span>
                      {user.username && (
                        <span className="text-[10px] text-zinc-500 font-mono font-bold">@{user.username}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-black ${user.disabled ? 'border-black text-white bg-[#FF0055]' : 'border-black text-black bg-[#00FF66]'}`}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </Badge>
                    <Switch
                      checked={!user.disabled}
                      onCheckedChange={() => handleDisableToggle(user.uid, user.disabled)}
                      disabled={loadingId === user.uid || isSuperAdminEmail}
                      className="scale-75 origin-right mt-1"
                    />
                  </div>
                </div>

                {/* Info badges */}
                {(user.rollNo || user.branch) && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-black font-bold pt-1">
                    {user.rollNo && (
                      <span className="bg-zinc-100 border-2 border-black px-2 py-0.5 font-mono shadow-[1px_1px_0px_0px_#000000]">
                        {user.rollNo}
                      </span>
                    )}
                    {user.branch && (
                      <span className="bg-zinc-100 border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                        {user.branch}
                      </span>
                    )}
                  </div>
                )}

                {/* Role Assignment */}
                <div className="space-y-3 pt-3 border-t-2 border-black">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Role</span>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.uid, value as Role)}
                      disabled={loadingId === user.uid || isSuperAdminEmail}
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-white border-2 border-black text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-black text-black">
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {user.role === 'panel' && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">Panel Domain</span>
                      <Select
                        value={user.domain || 'gen_ai'}
                        onValueChange={(value) => handleDomainChange(user.uid, value)}
                        disabled={loadingId === user.uid}
                      >
                        <SelectTrigger className="w-full h-8 text-xs bg-[#FFE600] border-2 border-black text-black font-bold">
                          <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-black text-black">
                          {DOMAIN_OPTIONS.map((d) => (
                            <SelectItem key={d.value} value={d.value} className="text-xs">
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Actions: Edit & Delete */}
                <div className="pt-3 border-t-2 border-black flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold text-zinc-600">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : 'Active'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(user)}
                      className="h-7 w-7 p-0 border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000]"
                      title="Edit User"
                    >
                      <Edit2 className="h-3.5 w-3.5 stroke-[2.5]" />
                    </Button>
                    
                    {!isSuperAdminEmail && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setUserToDelete(user)}
                        disabled={loadingId === user.uid}
                        className="h-7 w-7 p-0 bg-[#FF0055] hover:bg-[#FF0055]/90 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-md bg-white border-4 border-black text-black shadow-[10px_10px_0px_0px_#000000] font-sans">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-black uppercase italic text-black">Edit User Details</DialogTitle>
              <DialogDescription className="text-zinc-600 text-xs font-bold">
                Update information and roles for {editingUser.email}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-black">Display Name</Label>
                <Input 
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(p => ({ ...p, displayName: e.target.value }))}
                  required
                  className="bg-white border-2 border-black text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Email</Label>
                  <Input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                    disabled={editingUser.email === 'vinaysiddha19@gmail.com'}
                    required
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Username</Label>
                  <Input 
                    value={editForm.username}
                    onChange={(e) => setEditForm(p => ({ ...p, username: e.target.value }))}
                    disabled={editingUser.email === 'vinaysiddha19@gmail.com'}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Roll Number</Label>
                  <Input 
                    value={editForm.rollNo}
                    onChange={(e) => setEditForm(p => ({ ...p, rollNo: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Branch</Label>
                  <Input 
                    value={editForm.branch}
                    onChange={(e) => setEditForm(p => ({ ...p, branch: e.target.value }))}
                    className="bg-white border-2 border-black text-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-black">Role</Label>
                <Select 
                  value={editForm.role} 
                  onValueChange={(val) => setEditForm(p => ({ ...p, role: val as Role }))}
                  disabled={editingUser.email === 'vinaysiddha19@gmail.com'}
                >
                  <SelectTrigger className="bg-white border-2 border-black text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black text-black">
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editForm.role === 'panel' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-black">Panel Tech Domain</Label>
                  <Select 
                    value={editForm.domain} 
                    onValueChange={(val) => setEditForm(p => ({ ...p, domain: val }))}
                  >
                    <SelectTrigger className="bg-white border-2 border-black text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black text-black">
                      {DOMAIN_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="border-2 border-black bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000]">
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading} className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2">
                  {editLoading ? (
                    <>
                      <IosLoader size="xs" color="text-black" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dedicated Delete User Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        description="This will permanently delete the user's account, login access, and associated profile data."
        itemName={userToDelete?.displayName || undefined}
        itemDetails={userToDelete?.email}
        isLoading={deleteLoading}
      />
    </div>
  );
}
