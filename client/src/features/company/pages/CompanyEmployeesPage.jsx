import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Search,
  Building,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Input, Textarea } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

export const CompanyEmployeesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // HR Form State
  const [hrForm, setHrForm] = useState({
    salary: 120000,
    currency: 'USD',
    department: 'Engineering',
    designation: 'Software Engineer',
    reportingManager: 'Engineering Director',
    shift: 'General Shift (9 AM - 6 PM)',
    officeLocation: 'Headquarters',
    employmentType: 'Full-Time',
    probationPeriod: '90 Days',
    employeeStatus: 'Onboarding',
  });

  // Fetch Company Employees
  const { data, isLoading } = useQuery({
    queryKey: ['company-employees'],
    queryFn: () => companyApi.getEmployees(),
  });

  const employees = data?.data?.employees ?? [];

  // Update HR Fields Mutation
  const updateHRMutation = useMutation({
    mutationFn: ({ id, payload }) => companyApi.updateEmployeeHRFields(id, payload),
    onSuccess: () => {
      toast.success('HR fields updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-employees'] });
      setSelectedEmployee(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update HR fields.');
    },
  });

  const handleOpenDrawer = (emp) => {
    setSelectedEmployee(emp);
    setHrForm({
      salary: emp.salary || 120000,
      currency: emp.currency || 'USD',
      department: emp.department || 'Engineering',
      designation: emp.designation || 'Software Engineer',
      reportingManager: emp.reportingManager || 'Engineering Director',
      shift: emp.shift || 'General Shift (9 AM - 6 PM)',
      officeLocation: emp.officeLocation || 'Headquarters',
      employmentType: emp.employmentType || 'Full-Time',
      probationPeriod: emp.probationPeriod || '90 Days',
      employeeStatus: emp.employeeStatus || 'Onboarding',
    });
  };

  const handleSaveHRFields = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    updateHRMutation.mutate({
      id: selectedEmployee._id,
      payload: hrForm,
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    const name = (emp.fullName || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const id = (emp.employeeId || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const desig = (emp.designation || '').toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch = name.includes(term) || email.includes(term) || id.includes(term) || dept.includes(term) || desig.includes(term);
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Enterprise HRMS Directory..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Users className="w-7 h-7" />
            </div>
            Enterprise HRMS Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated candidate ATS onboarding, employee directory, and candidate audit trail mapping.
          </p>
        </div>

        <Badge variant="purple" size="md" className="px-3.5 py-1.5 text-xs font-extrabold shadow-sm">
          <Sparkles className="w-4 h-4 mr-1 text-brand-400" /> {employees.length} Onboarded Employees
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96 relative">
          <Input
            placeholder="Search by Employee ID, Name, Role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['ALL', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                departmentFilter === dept
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List / Grid */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No HRMS Employee Records Found"
          description="Candidates selected and onboarded from the ATS pipeline will automatically populate here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp, idx) => (
            <motion.div
              key={emp._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-2xl transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {emp.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                      {emp.designation} • {emp.department}
                    </p>
                  </div>
                  <Badge variant={emp.employeeStatus === 'Active' ? 'success' : 'purple'} size="sm">
                    {emp.employeeStatus}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Employee ID:</span>
                    <span className="font-mono font-bold text-brand-500">{emp.employeeId}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Work Email:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{emp.companyEmailPlaceholder || emp.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Joining Date:</span>
                    <span className="font-bold text-emerald-500">{new Date(emp.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* ATS Resume Imported Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Imported from ATS Resume
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Salary: ${emp.salary?.toLocaleString() || '120,000'} /yr</span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDrawer(emp)}>
                  Manage Profile <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* HR Profile & Permanent Candidate Audit Drawer */}
      <Drawer
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        title={`HRMS Profile: ${selectedEmployee?.fullName || 'Employee'}`}
      >
        {selectedEmployee && (
          <div className="space-y-6 text-slate-100">
            {/* Header info badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white">{selectedEmployee.fullName}</h3>
                <p className="text-xs text-slate-400">{selectedEmployee.email} • {selectedEmployee.phone || 'No phone'}</p>
              </div>
              <Badge variant="purple" size="md">
                {selectedEmployee.employeeId}
              </Badge>
            </div>

            {/* PERMANENT CANDIDATE HISTORY AUDIT MAPPING BOX */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-brand-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Permanent Candidate Audit Mapping
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Candidate ID</span>
                  <span className="text-slate-300 font-bold truncate block">{String(selectedEmployee.candidateId?._id || selectedEmployee.candidateId).slice(0, 16)}...</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Application ID</span>
                  <span className="text-slate-300 font-bold truncate block">{String(selectedEmployee.applicationId).slice(0, 16)}...</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Interview Room ID</span>
                  <span className="text-slate-300 font-bold truncate block">{selectedEmployee.interviewId ? String(selectedEmployee.interviewId).slice(0, 16) : 'Completed'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Offer Letter ID</span>
                  <span className="text-slate-300 font-bold truncate block">{selectedEmployee.offerId ? String(selectedEmployee.offerId).slice(0, 16) : 'Generated'}</span>
                </div>
              </div>
            </div>

            {/* AUTO-IMPORTED ATS RESUME DATA SECTION */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Candidate Profile & Resume Data
                </h4>
                <Badge variant="emerald" size="sm" className="font-bold">
                  <Sparkles className="w-3 h-3 mr-1" /> Imported from ATS Resume
                </Badge>
              </div>

              {/* Summary */}
              {selectedEmployee.professionalSummary && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Professional Summary <Badge variant="emerald" size="sm" className="text-[9px]">Imported from ATS Resume</Badge>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">{selectedEmployee.professionalSummary}</p>
                </div>
              )}

              {/* Skills */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  Skills & Qualifications <Badge variant="emerald" size="sm" className="text-[9px]">Imported from ATS Resume</Badge>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedEmployee.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB']).map((sk, i) => (
                    <Badge key={i} variant="purple" size="sm">{sk}</Badge>
                  ))}
                </div>
              </div>

              {/* Experience */}
              {selectedEmployee.experience && selectedEmployee.experience.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Work Experience <Badge variant="emerald" size="sm" className="text-[9px]">Imported from ATS Resume</Badge>
                  </span>
                  <div className="space-y-2">
                    {selectedEmployee.experience.map((exp, i) => (
                      <div key={i} className="text-xs text-slate-300 border-l-2 border-brand-500 pl-2.5 space-y-0.5">
                        <p className="font-bold text-white">{exp.title} • <span className="text-brand-400">{exp.company}</span></p>
                        <p className="text-[11px] text-slate-400">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume PDF Download Link */}
              {selectedEmployee.resumeUrl && (
                <a
                  href={selectedEmployee.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-brand-500/30 flex items-center justify-between text-xs font-bold text-brand-400 hover:underline"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" /> Candidate Resume PDF
                  </span>
                  <Badge variant="emerald" size="sm">Imported from ATS Resume</Badge>
                </a>
              )}
            </div>

            {/* HR EDITABLE FIELDS FORM */}
            <form onSubmit={handleSaveHRFields} className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-400" /> HR Management Fields (Editable)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Annual Salary ({hrForm.currency})</label>
                  <input
                    type="number"
                    value={hrForm.salary}
                    onChange={(e) => setHrForm({ ...hrForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={hrForm.department}
                    onChange={(e) => setHrForm({ ...hrForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={hrForm.designation}
                    onChange={(e) => setHrForm({ ...hrForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={hrForm.reportingManager}
                    onChange={(e) => setHrForm({ ...hrForm, reportingManager: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Work Shift</label>
                  <input
                    type="text"
                    value={hrForm.shift}
                    onChange={(e) => setHrForm({ ...hrForm, shift: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Office Location</label>
                  <input
                    type="text"
                    value={hrForm.officeLocation}
                    onChange={(e) => setHrForm({ ...hrForm, officeLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Employment Type</label>
                  <select
                    value={hrForm.employmentType}
                    onChange={(e) => setHrForm({ ...hrForm, employmentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Probation Period</label>
                  <input
                    type="text"
                    value={hrForm.probationPeriod}
                    onChange={(e) => setHrForm({ ...hrForm, probationPeriod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setSelectedEmployee(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={updateHRMutation.isPending}>
                  Save HR Fields
                </Button>
              </div>
            </form>
          </div>
        )}
      </Drawer>
    </div>
  );
};
