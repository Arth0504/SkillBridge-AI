import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Sparkles, Sun, Moon, AlertOctagon, Save, Mail, Key, Cpu } from 'lucide-react';
import { Button, Input, Badge, Select } from '../../../components/common';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

export const AdminSettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [rateLimit, setRateLimit] = useState('100');

  const handleSaveSettings = () => {
    toast.success('Platform configuration saved successfully.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-500" /> Control Plane Platform Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure general system preferences, maintenance mode status, security controls, and Gemini AI engine parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'general', label: 'General & Maintenance', icon: Settings },
          { id: 'ai', label: 'AI Engine Configuration', icon: Sparkles },
          { id: 'security', label: 'Security Controls', icon: Shield },
          { id: 'theme', label: 'Theme Preferences', icon: theme === 'dark' ? Moon : Sun },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General & Maintenance */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Maintenance Mode Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${maintenanceMode ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Emergency System Maintenance Mode</h3>
                <p className="text-xs text-slate-400">When enabled, non-admin users will see a maintenance notice screen.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMaintenanceMode(!maintenanceMode);
                toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-500" /> Platform Defaults
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Platform Title" defaultValue="SkillBridge AI - Enterprise Talent Tech" />
              <Input label="Support Email" defaultValue="support@skillbridge.ai" />
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button variant="primary" onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" /> Save General Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: AI Configuration */}
      {activeTab === 'ai' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" /> Gemini AI Engine Controls
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Active Gemini Model Version</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (High Throughput / Low Latency)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Technical Reasoning)</option>
              </select>
            </div>

            <Input
              label="Per-Minute API Rate Limit (Requests/min)"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button variant="primary" onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" /> Apply AI Config
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-500" /> Security & Rate Limiting
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Max Failed Login Attempts Before Lockout" defaultValue="5" />
            <Input label="JWT Access Token Expiry (Minutes)" defaultValue="15" />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button variant="primary" onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" /> Save Security Rules
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Theme */}
      {activeTab === 'theme' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-brand-500" />} Theme Preference
          </h3>

          <div className="flex gap-4">
            <Button variant={theme === 'dark' ? 'primary' : 'outline'} onClick={() => theme !== 'dark' && toggleTheme()}>
              <Moon className="w-4 h-4 mr-2" /> Dark SaaS Theme
            </Button>
            <Button variant={theme === 'light' ? 'primary' : 'outline'} onClick={() => theme !== 'light' && toggleTheme()}>
              <Sun className="w-4 h-4 mr-2" /> Light Theme
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
