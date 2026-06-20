'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function UserManagementPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Role State
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, user: any | null}>({isOpen: false, user: null});

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, [getToken]);

  async function loadUsers() {
    setLoading(true);
    try {
      const token = await getToken();
      // Assuming GET /admin/users returns a combined list of users
      const data = await fetchAPI('/admin/users', { token });
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateClick = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || 'USER');
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      await fetchAPI(`/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ role: newRole })
      });
      setIsUpdateDialogOpen(false);
      toast.success("User role updated successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: any) => {
    setConfirmDialog({ isOpen: true, user });
  };

  const executeDeleteUser = async () => {
    if (!confirmDialog.user) return;
    const user = confirmDialog.user;

    try {
      const token = await getToken();
      await fetchAPI(`/admin/users/${user.id}`, {
        method: 'DELETE',
        token,
      });
      toast.success("User deleted successfully");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'OFFICER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800'; // CITIZEN
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = user.full_name?.toLowerCase().includes(searchLower);
    const emailMatch = user.email?.toLowerCase().includes(searchLower);
    const matchesSearch = nameMatch || emailMatch;

    // Normalize user role
    const actualRole = user.role || 'CITIZEN';
    const normalizedUserRole = actualRole === 'USER' ? 'CITIZEN' : actualRole;
    const matchesRole = roleFilter === 'ALL' || normalizedUserRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CITIZEN">Citizen</SelectItem>
            <SelectItem value="OFFICER">Officer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="role-select" className="text-sm font-medium">Role</label>
              <select
                id="role-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                aria-label="User Role"
              >
                <option value="USER">CITIZEN</option>
                <option value="OFFICER">OFFICER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateRole} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Role"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            )}
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium font-mono text-xs text-muted-foreground">{user.id.split('-')[0]}...</TableCell>
                <TableCell>{user.full_name || 'Unknown'}</TableCell>
                <TableCell>{user.email || 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)} variant="outline">
                    {user.role || 'CITIZEN'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateClick(user)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Update Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={executeDeleteUser}
        title="Confirm User Deletion"
        description={`Are you sure you want to delete user ${confirmDialog.user?.full_name}? This action cannot be undone.`}
        confirmText="Delete User"
        isDestructive={true}
      />
    </div>
  );
}
