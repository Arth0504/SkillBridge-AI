import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building, CheckCircle2, XCircle, ShieldAlert, Search, ExternalLink, Mail, Phone, ChevronRight } from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Modal, Textarea } from '../../../components/common';
import { adminApi } from '../../../api';
import toast from 'react-hot-toast';

export const AdminCompaniesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('PENDING');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectModalCompany, setRejectModalCompany] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Companies
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: ['admin-companies', tab],
    queryFn: () => adminApi.getCompanies({ status: tab }),
  });

  const companies = companiesResponse?.data?.companies || [
    {
      _id: 'c1',
      companyName: 'DeepScale Systems',
      email: 'hr@deepscale.ai',
      website: 'https://deepscale.ai',
      industry: 'MLOps & Distributed Compute',
      companySize: '100-500 employees',
      location: 'San Francisco, CA',
      verificationStatus: 'pending',
      recruiterContactName: 'Marcus Vance',
      createdAt: '2026-07-22T10:00:00Z',
    },
    {
      _id: 'c2',
      companyName: 'TechCorp AI Solutions',
      email: 'recruiting@techcorp.ai',
      website: 'https://techcorp.ai',
      industry: 'Enterprise Software',
      companySize: '500+ employees',
      location: 'Austin, TX',
      verificationStatus: 'verified',
      recruiterContactName: 'Elena Rostova',
      createdAt: '2026-07-10T10:00:00Z',
    },
  ];

  // Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.verifyCompany(id, payload),
    onSuccess: () => {
      toast.success('Company verification status updated!');
      setSelectedCompany(null);
      setRejectModalCompany(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Verification update failed.');
    },
  });

  const handleApprove = (companyId) => {
    verifyMutation.mutate({ id: companyId, payload: { status: 'verified' } });
  };

  const handleRejectConfirm = () => {
    if (!rejectModalCompany) return;
    verifyMutation.mutate({
      id: rejectModalCompany._id,
      payload: { status: 'rejected', reason: rejectReason },
    });
  };

  const filteredCompanies = companies.filter((c) => {
    const name = c.companyName || '';
    const email = c.email || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === 'ALL'
        ? true
        : tab === 'PENDING'
        ? c.verificationStatus === 'pending'
        : tab === 'VERIFIED'
        ? c.verificationStatus === 'verified'
        : c.verificationStatus === 'rejected';
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Employer Verification Requests..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-brand-500" /> Employer Company Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review employer registration requests, verify corporate domain details, approve verified badges, or reject spam accounts.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Search
            placeholder="Search company or work email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No Companies Found"
          description="No employer accounts match your current verification filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((comp, idx) => (
            <motion.div
              key={comp._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{comp.companyName}</h3>
                  <Badge variant={comp.verificationStatus === 'verified' ? 'success' : comp.verificationStatus === 'pending' ? 'warning' : 'danger'}>
                    {comp.verificationStatus || 'pending'}
                  </Badge>
                </div>
                <p className="text-xs text-brand-400 font-semibold">{comp.industry || 'Technology'}</p>
                <p className="text-[11px] text-slate-400">
                  {comp.email} • {comp.location || 'Remote'} • Recruiter Contact: <strong>{comp.recruiterContactName || 'HR Lead'}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setSelectedCompany(comp)}>
                  Inspect Info <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                {comp.verificationStatus !== 'verified' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500"
                    isLoading={verifyMutation.isPending}
                    onClick={() => handleApprove(comp._id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Employer
                  </Button>
                )}

                {comp.verificationStatus !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => setRejectModalCompany(comp)}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Company Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        title={selectedCompany?.companyName || 'Company Detail'}
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-white">{selectedCompany.companyName}</h3>
              <p className="text-xs text-brand-400">{selectedCompany.industry}</p>
              <p className="text-xs text-slate-400">{selectedCompany.email}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white">Recruiter Contact</h4>
              <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl">
                {selectedCompany.recruiterContactName || 'Primary Recruiter Contact'}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reject Modal */}
      {rejectModalCompany && (
        <Modal
          isOpen={Boolean(rejectModalCompany)}
          onClose={() => setRejectModalCompany(null)}
          title={`Reject Verification: ${rejectModalCompany.companyName}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Provide a reason for rejecting this employer's verification application.
            </p>
            <Textarea
              label="Rejection Reason Note"
              rows={3}
              placeholder="e.g. Unverified corporate domain, insufficient business details..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setRejectModalCompany(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-500"
                isLoading={verifyMutation.isPending}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
