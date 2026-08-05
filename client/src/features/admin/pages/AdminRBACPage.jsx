import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, CheckCircle2, XCircle, Info, Save } from 'lucide-react';
import { Button, Badge } from '../../../components/common';
import toast from 'react-hot-toast';

export const AdminRBACPage = () => {
  const [matrix, setMatrix] = useState([
    { permission: 'Platform Control Plane Access', admin: true, company: false, candidate: false },
    { permission: 'Manage Users & Moderation', admin: true, company: false, candidate: false },
    { permission: 'Employer Verification Approval', admin: true, company: false, candidate: false },
    { permission: 'Post & Manage Job Roles', admin: true, company: true, candidate: false },
    { permission: 'Review Candidate Applications', admin: true, company: true, candidate: false },
    { permission: 'Schedule Recruiter Interviews', admin: true, company: true, candidate: false },
    { permission: 'Run AI Resume ATS Analyzer', admin: true, company: true, candidate: true },
    { permission: 'Practice AI Mock Interviews', admin: true, company: false, candidate: true },
    { permission: 'Take AI Technical Coding Tests', admin: true, company: false, candidate: true },
    { permission: 'Submit Job Applications', admin: false, company: false, candidate: true },
  ]);

  const handleToggle = (index, role) => {
    const updated = [...matrix];
    updated[index][role] = !updated[index][role];
    setMatrix(updated);
  };

  const handleSaveRBAC = () => {
    toast.success('RBAC Permission Matrix updated successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-brand-500" /> Role-Based Access Control (RBAC) Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System permissions and role authorization matrix mapping Super Admin, Employer Recruiter, and Candidate privileges.
          </p>
        </div>

        <Button variant="primary" onClick={handleSaveRBAC}>
          <Save className="w-4 h-4 mr-2" /> Save Permission Matrix
        </Button>
      </div>

      {/* RBAC Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase">
                <th className="py-4 px-6">System Operation / Permission</th>
                <th className="py-4 px-6 text-center">Super Admin</th>
                <th className="py-4 px-6 text-center">Employer Company</th>
                <th className="py-4 px-6 text-center">Candidate User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {matrix.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 font-bold text-white">{row.permission}</td>

                  {/* Admin Check */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={row.admin}
                      onChange={() => handleToggle(idx, 'admin')}
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                    />
                  </td>

                  {/* Company Check */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={row.company}
                      onChange={() => handleToggle(idx, 'company')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </td>

                  {/* Candidate Check */}
                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={row.candidate}
                      onChange={() => handleToggle(idx, 'candidate')}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
