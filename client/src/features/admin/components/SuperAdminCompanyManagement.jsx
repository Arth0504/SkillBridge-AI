import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle2, XCircle, Ban, Briefcase, BarChart3 } from 'lucide-react';
import { Badge } from '../../../components/common';
import toast from 'react-hot-toast';

export const SuperAdminCompanyManagement = () => {
  const [companies, setCompanies] = useState([
    {
      id: 'comp-1',
      name: 'TechFlow Systems',
      industry: 'Cloud Infrastructure & SaaS',
      status: 'verified',
      jobsPosted: 12,
      hiringRate: '88%',
      website: 'https://techflow.io',
    },
    {
      id: 'comp-2',
      name: 'Cognitive AI Labs',
      industry: 'Artificial Intelligence',
      status: 'pending_verification',
      jobsPosted: 4,
      hiringRate: '75%',
      website: 'https://cognitive.ai',
    },
    {
      id: 'comp-3',
      name: 'Unverified Startup Inc',
      industry: 'FinTech',
      status: 'pending_verification',
      jobsPosted: 1,
      hiringRate: '0%',
      website: 'https://unverified.com',
    },
  ]);

  const handleApprove = (id, name) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'verified' } : c))
    );
    toast.success(`Approved & Verified company ${name}!`);
  };

  const handleReject = (id, name) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
    );
    toast.error(`Rejected company registration for ${name}.`);
  };

  const handleSuspend = (id, name) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'suspended' } : c))
    );
    toast.warning(`Suspended company ${name}.`);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company Management & Verifications</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
          {companies.length} Companies
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-2.5">Company Details</th>
              <th className="p-2.5">Industry</th>
              <th className="p-2.5">Verification Status</th>
              <th className="p-2.5">Jobs & Hiring Rate</th>
              <th className="p-2.5 text-right">Verification Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                <td className="p-2.5">
                  <span className="font-bold text-white block">{c.name}</span>
                  <a href={c.website} target="_blank" rel="noreferrer" className="text-[11px] text-brand-400 hover:underline">
                    {c.website}
                  </a>
                </td>
                <td className="p-2.5 text-slate-300">{c.industry}</td>
                <td className="p-2.5">
                  <Badge variant={c.status === 'verified' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}>
                    {c.status}
                  </Badge>
                </td>
                <td className="p-2.5 text-[11px] font-mono">
                  <span className="text-slate-200 block">{c.jobsPosted} Active Jobs</span>
                  <span className="text-emerald-400 font-bold">{c.hiringRate} Hiring Success</span>
                </td>
                <td className="p-2.5 text-right space-x-1.5">
                  {c.status === 'pending_verification' && (
                    <>
                      <button
                        onClick={() => handleApprove(c.id, c.name)}
                        className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(c.id, c.name)}
                        className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-[10px]"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {c.status === 'verified' && (
                    <button
                      onClick={() => handleSuspend(c.id, c.name)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-950 text-amber-300 font-bold text-[10px]"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
