import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, RefreshCw, AlertTriangle, ShieldCheck, Power } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const SuperAdminBackupCenter = ({ isMaintenanceMode, setIsMaintenanceMode }) => {
  const [backups, setBackups] = useState([
    { name: 'skillbridge_db_backup_2026-08-05.json', size: '14.2 MB', timestamp: 'Today, 04:00 AM' },
    { name: 'skillbridge_db_backup_2026-08-04.json', size: '13.8 MB', timestamp: 'Yesterday, 04:00 AM' },
    { name: 'skillbridge_db_backup_2026-08-03.json', size: '13.5 MB', timestamp: 'Aug 03, 04:00 AM' },
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      setIsCreatingBackup(false);
      const newB = {
        name: `skillbridge_db_backup_${new Date().toISOString().split('T')[0]}.json`,
        size: '14.5 MB',
        timestamp: 'Just now',
      };
      setBackups([newB, ...backups]);
      toast.success('Database JSON Snapshot created successfully!');
    }, 800);
  };

  const handleRestoreBackup = (name) => {
    toast.success(`Restored database state from ${name}`);
  };

  const handleToggleMaintenance = () => {
    const nextState = !isMaintenanceMode;
    setIsMaintenanceMode(nextState);
    if (nextState) {
      toast.warning('System Maintenance Mode ENABLED! Non-admin users blocked.');
    } else {
      toast.success('System Maintenance Mode DISABLED! Platform operational.');
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Database Backup & Disaster Recovery</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="xs" onClick={handleCreateBackup} isLoading={isCreatingBackup}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Generate Backup Snapshot
          </Button>

          <button
            onClick={handleToggleMaintenance}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isMaintenanceMode
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" /> Maintenance Mode: {isMaintenanceMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Backup Snapshots Table */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Backup Snapshots ({backups.length}):</span>
        <div className="space-y-2">
          {backups.map((b, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-white block">{b.name}</span>
                <span className="text-[10px] text-slate-400">{b.timestamp} • {b.size}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={() => handleRestoreBackup(b.name)}>
                  Restore Snapshot
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
