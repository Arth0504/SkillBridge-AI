import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, ShieldCheck, User, Sparkles } from 'lucide-react';
import { Modal, Button, Badge } from '../../../components/common';
import { interviewRoomApi } from '../../../api/interviewRoomApi';
import toast from 'react-hot-toast';

export const ScheduleInterviewModal = ({ isOpen, onClose, application }) => {
  const navigate = useNavigate();
  const candName = application?.candidate?.fullName || application?.candidateSnapshot?.fullName || 'Candidate';
  const candRole = application?.jobId?.title || application?.candidate?.headline || 'Role';

  const [interviewType, setInterviewType] = useState('Technical');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(45);

  const scheduleMutation = useMutation({
    mutationFn: interviewRoomApi.scheduleRoom,
    onSuccess: (data) => {
      toast.success('Private interview room created & candidate invited!');
      onClose();
      const roomId = data?.data?.roomId;
      if (roomId) {
        navigate(`/interview/room/${roomId}`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to schedule private interview.');
    },
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!application?._id) return;

    scheduleMutation.mutate({
      applicationId: application._id,
      scheduledDate,
      durationMinutes: Number(durationMinutes),
      interviewType,
    });
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Private Video Interview" size="md">
      <form onSubmit={handleSchedule} className="space-y-6">
        {/* Candidate Info Header */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{candName}</h4>
            <p className="text-xs text-slate-400 font-medium">{candRole}</p>
          </div>
          <Badge variant="purple" size="sm" className="ml-auto">
            {interviewType} Interview
          </Badge>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="Technical">Technical Live Coding & System Design</option>
              <option value="HR">HR & Cultural Fit Screening</option>
              <option value="Final">Final Executive Hiring Round</option>
              <option value="Screening">Initial Video Screening</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" /> Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" /> Duration (Minutes)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Access Guarantee Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-white block">Secure Private UUID Interview Room</strong>
            <span>Generates an encrypted room link accessible only to candidate and authorized recruiter.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={scheduleMutation.isPending}
          >
            <Video className="w-4 h-4 mr-1.5" /> Create Room & Launch
          </Button>
        </div>
      </form>
    </Modal>
  );
};
