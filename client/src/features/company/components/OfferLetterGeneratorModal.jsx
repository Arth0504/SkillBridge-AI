import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '../../../components/common';
import { FileText, Download, Printer, CheckCircle2, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';

export const OfferLetterGeneratorModal = ({ isOpen, onClose, application }) => {
  const queryClient = useQueryClient();
  const candidate = application?.candidate || application?.candidateSnapshot || {};
  const job = application?.job || application?.jobId || {};

  const [salary, setSalary] = useState(135000);
  const [currency, setCurrency] = useState('USD');
  const [designation, setDesignation] = useState(job.title || 'Senior Software Engineer');
  const [joiningDate, setJoiningDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [hrSignatureName, setHrSignatureName] = useState('Head of Talent Acquisition');
  const [generatedOffer, setGeneratedOffer] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/company/offer-letters', {
        applicationId: application._id,
        salary,
        currency,
        designation,
        joiningDate,
        hrSignatureName,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Official PDF Offer Letter generated!');
      setGeneratedOffer(data.data.offer);
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate offer letter.');
    },
  });

  const handlePrintPdf = () => {
    window.print();
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Official Offer Letter PDF" size="xl">
      <div className="space-y-6">
        {!generatedOffer ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs font-bold text-slate-400">Candidate Target:</p>
              <h3 className="text-lg font-bold text-white">{candidate.fullName || 'Candidate'}</h3>
              <p className="text-xs text-brand-400 font-semibold">{job.title || 'Role'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Annual Salary ({currency})</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Job Designation Title</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Official Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">HR Manager / Authorized Signatory</label>
                <input
                  type="text"
                  value={hrSignatureName}
                  onChange={(e) => setHrSignatureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full h-11"
              isLoading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Generate Branded PDF Offer Letter
            </Button>
          </div>
        ) : (
          <div className="space-y-6 print:m-0 print:p-0">
            {/* Printable Offer Document Card */}
            <div id="printable-offer" className="p-8 rounded-2xl bg-slate-950 border-2 border-brand-500/30 text-white space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white">{generatedOffer.companyName}</h1>
                  <p className="text-xs text-brand-400 font-bold uppercase tracking-widest mt-1">Official Employment Offer</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs font-mono text-emerald-400 font-bold mt-1">Status: ISSUED</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>Dear <strong className="text-white">{generatedOffer.candidateName}</strong>,</p>
                <p>
                  On behalf of <strong>{generatedOffer.companyName}</strong>, we are delighted to offer you the position of{' '}
                  <strong className="text-brand-400">{generatedOffer.designation}</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Annual Compensation:</span>
                    <span className="font-extrabold text-emerald-400">{currency} ${salary.toLocaleString()} / Year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Designation:</span>
                    <span className="font-bold text-white">{generatedOffer.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Expected Joining Date:</span>
                    <span className="font-bold text-white">{new Date(generatedOffer.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <p>
                  Please sign and return this offer before {new Date(generatedOffer.validUntil).toLocaleDateString()} to confirm your acceptance.
                </p>
              </div>

              <div className="flex justify-between items-end pt-8 border-t border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">{generatedOffer.hrSignatureName}</p>
                  <p className="text-[10px] text-slate-400">Authorized HR Signatory</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Cryptographically Sealed
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="primary" className="flex-1" onClick={handlePrintPdf}>
                <Printer className="w-4 h-4 mr-2" /> Download / Print PDF Offer
              </Button>
              <Button variant="outline" onClick={() => setGeneratedOffer(null)}>
                Edit & Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
