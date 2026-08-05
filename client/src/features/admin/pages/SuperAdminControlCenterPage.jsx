import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Building,
  FileText,
  Sparkles,
  Database,
  Radio,
  Settings,
  RefreshCw,
  Power
} from 'lucide-react';
import { SuperAdminMetricsGrid } from '../components/SuperAdminMetricsGrid';
import { SuperAdminUserManagement } from '../components/SuperAdminUserManagement';
import { SuperAdminCompanyManagement } from '../components/SuperAdminCompanyManagement';
import { SuperAdminSystemLogs } from '../components/SuperAdminSystemLogs';
import { SuperAdminAITelemetry } from '../components/SuperAdminAITelemetry';
import { SuperAdminBackupCenter } from '../components/SuperAdminBackupCenter';
import { SuperAdminLiveFeed } from '../components/SuperAdminLiveFeed';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const SuperAdminControlCenterPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Telemetry Overview', icon: ShieldAlert },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'companies', label: 'Company Verification', icon: Building },
    { id: 'logs', label: 'Audit & System Logs', icon: FileText },
    { id: 'ai', label: 'AI Telemetry', icon: Sparkles },
    { id: 'backup', label: 'Backup & Recovery', icon: Database },
  ];

  const handleRefreshData = () => {
    toast.success('Super Admin telemetry synchronized across cluster!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" /> Enterprise Super Admin Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cluster telemetry, system health, real-time Socket.IO stream, user/company management & disaster recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Re-Sync Telemetry
          </Button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 custom-scrollbar select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Telemetry Overview */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <SuperAdminMetricsGrid />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <SuperAdminAITelemetry />
              <SuperAdminSystemLogs />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <SuperAdminLiveFeed />
              <SuperAdminBackupCenter isMaintenanceMode={isMaintenanceMode} setIsMaintenanceMode={setIsMaintenanceMode} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SuperAdminUserManagement />
        </motion.div>
      )}

      {/* Tab 3: Company Management */}
      {activeTab === 'companies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SuperAdminCompanyManagement />
        </motion.div>
      )}

      {/* Tab 4: Audit & System Logs */}
      {activeTab === 'logs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SuperAdminSystemLogs />
        </motion.div>
      )}

      {/* Tab 5: AI Telemetry */}
      {activeTab === 'ai' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SuperAdminAITelemetry />
        </motion.div>
      )}

      {/* Tab 6: Backup & Recovery */}
      {activeTab === 'backup' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SuperAdminBackupCenter isMaintenanceMode={isMaintenanceMode} setIsMaintenanceMode={setIsMaintenanceMode} />
        </motion.div>
      )}
    </div>
  );
};

export default SuperAdminControlCenterPage;
