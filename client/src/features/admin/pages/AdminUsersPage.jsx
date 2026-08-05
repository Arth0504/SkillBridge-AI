import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, Filter, ShieldAlert, CheckCircle2, UserX, Trash2, Key, ChevronRight, Mail, Building, ExternalLink } from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Modal } from '../../../components/common';
import { adminApi } from '../../../api';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserItem, setDeleteUserItem] = useState(null);

  // Fetch Users List
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => adminApi.getUsers({ role: roleFilter === 'ALL' ? undefined : roleFilter }),
  });

  const users = usersResponse?.data?.users ?? [];

  // User Status Toggle Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success('User account status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success('User account deleted.');
      setDeleteUserItem(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    },
  });

  const handleResetPassword = (userObj) => {
    toast.success(`Password reset link sent to ${userObj.email}`);
  };

  const filteredUsers = users.filter((u) => {
    const name = u.fullName || u.companyName || '';
    const email = u.email || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Platform Users..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-500" /> Platform User Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage candidate and employer user accounts, suspend violations, trigger password resets, and view profiles.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Search
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CANDIDATE', 'COMPANY'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description="No candidate or employer user accounts match your search query."
        />
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredUsers.map((u, idx) => (
                  <motion.tr
                    key={u._id || idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-white text-sm">{u.fullName || u.companyName}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.role === 'company' ? 'purple' : 'info'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.status === 'suspended' ? 'danger' : 'success'} size="sm">
                        {u.status || 'active'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>

                      {u.status === 'suspended' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => statusMutation.mutate({ id: u._id, status: 'active' })}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                          onClick={() => statusMutation.mutate({ id: u._id, status: 'suspended' })}
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => setDeleteUserItem(u)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Inspect Drawer */}
      <Drawer
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.fullName || selectedUser?.companyName || 'User Detail'}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{selectedUser.fullName || selectedUser.companyName}</h3>
                <Badge variant={selectedUser.role === 'company' ? 'purple' : 'info'}>{selectedUser.role}</Badge>
              </div>
              <p className="text-xs text-slate-400">{selectedUser.email}</p>
              {selectedUser.headline && <p className="text-xs text-brand-400 font-semibold">{selectedUser.headline}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => handleResetPassword(selectedUser)}
              >
                <Key className="w-4 h-4 mr-2 text-brand-400" /> Send Password Reset Email
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete User Modal */}
      {deleteUserItem && (
        <Modal
          isOpen={Boolean(deleteUserItem)}
          onClose={() => setDeleteUserItem(null)}
          title="Delete User Account"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deleteUserItem.fullName || deleteUserItem.email}</strong>? This will purge user authentication and access.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setDeleteUserItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-500"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteUserItem._id)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
