import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState } from '../../../components/common';
import api from '../../../api/axios';

export const CompanyCalendarPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch Calendar Events from live MongoDB API
  const { data: calendarResponse, isLoading } = useQuery({
    queryKey: ['company-calendar-events'],
    queryFn: async () => {
      const res = await api.get('/company/calendar');
      return res.data;
    },
  });

  const events = calendarResponse?.data?.events || [];

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Corporate Hiring Calendar..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-brand-500" /> Recruiter Hiring Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage scheduled candidate video interviews, team meetings, and offer expiration deadlines.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            {['day', 'week', 'month'].map((vm) => (
              <button
                key={vm}
                onClick={() => setViewMode(vm)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  viewMode === vm ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {vm} View
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNext} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid / Event List */}
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No Calendar Events Scheduled"
          description="No interviews or offer expiration deadlines found on your recruiter calendar."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-brand-500/40 transition-all shadow-xl"
            >
              <div className="flex justify-between items-start">
                <Badge variant={ev.type === 'interview' ? 'purple' : 'emerald'} size="sm">
                  {ev.type === 'interview' ? 'Candidate Interview' : 'Offer Deadline'}
                </Badge>
                <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-400" /> {ev.time}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{ev.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{ev.jobTitle} • {ev.candidateName}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {new Date(ev.date).toLocaleDateString()}
                </span>
                {ev.roomUrl && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(ev.roomUrl)}
                  >
                    <Video className="w-3.5 h-3.5 mr-1" /> Join Room
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
