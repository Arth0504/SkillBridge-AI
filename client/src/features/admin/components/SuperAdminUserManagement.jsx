import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  Trash2,
  Ban,
  CheckCircle2,
  KeyRound,
  History,
  Laptop
} from 'lucide-react';
import { Button, Badge } from '../../../components/common';
import toast from 'react-hot-toast';

export const SuperAdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([
    {
      id: 'usr-1',
      name: 'Arth Prajapati',
      email: 'arth@skillbridge.ai',
      role: 'candidate',
      status: 'active',
      lastLogin: 'Today, 10:45 AM',
      device: 'Windows / Chrome 127',
    },
    {
      id: 'usr-2',
      name: 'TechFlow Recruiter',
      email: 'hiring@techflow.io',
      role: 'company',
      status: 'active',
      lastLogin: 'Yesterday, 04:20 PM',
      device: 'macOS / Safari 17',
    },
    {
      id: 'usr-3',
      name: 'Super Administrator',
      email: 'admin@skillbridge.ai',
      role: 'admin',
      status: 'active',
      lastLogin: 'Just now',
      device: 'Windows / Edge 126',
    },
    {
      id: 'usr-4',
      name: 'John Doe Candidate',
      email: 'john.doe@example.com',
      role: 'candidate',
      status: 'suspended',
      lastLogin: '3 days ago',
      device: 'Linux / Firefox 128',
    },
  ]);

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          toast.success(`User ${u.name} status updated to ${nextStatus.toUpperCase()}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id, name) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(`User ${name} deleted successfully.`);
  };

  const handleResetPassword = (name) => {
    toast.success(`Password reset link sent to ${name}.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin User Directory</h3>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="candidate">Candidates</option>
            <option value="company">Companies</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-2.5">User Credentials</th>
              <th className="p-2.5">Role</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Last Login & Device</th>
              <th className="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                <td className="p-2.5">
                  <span className="font-bold text-white block">{u.name}</span>
                  <span className="text-[11px] text-slate-400">{u.email}</span>
                </td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {u.role}
                  </span>
                </td>
                <td className="p-2.5">
                  <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                    {u.status}
                  </Badge>
                </td>
                <td className="p-2.5 text-[11px]">
                  <span className="text-slate-200 block">{u.lastLogin}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{u.device}</span>
                </td>
                <td className="p-2.5 text-right space-x-1.5">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                  >
                    {u.status === 'active' ? <Ban className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleResetPassword(u.name)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Reset Password"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
