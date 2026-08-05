import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, Copy, Check, RefreshCw, FileText, Mail, Award, Users } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const RecruiterChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Recruiter! I am your Enterprise AI Hiring Assistant powered by Gemini 1.5 Pro. Ask me anything about candidate rankings, resume comparisons, ATS breakdowns, or draft offer letters and interview questions.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const quickPrompts = [
    'Which candidate is best for Senior WebRTC Engineer?',
    'Compare Arth Prajapati vs Rahul Sharma',
    'Summarize Arth Prajapati resume & ATS score',
    'Draft an Executive Offer Letter for Senior Developer',
    'Draft technical interview questions for React & Node.js',
    'Show candidates with low ATS score and missing keywords',
  ];

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('best candidate') || qLower.includes('top candidate')) {
        aiReply = `Based on AI Candidate Analytics, Arth Prajapati is the #1 Ranked Candidate (96% Overall Match) for the Senior Software Engineer role.\n\nKey Strengths:\n• ATS Resume Score: 98/100\n• Coding Test Score: 95/100 (JavaScript & Data Structures)\n• AI Video Screening: 95% (Strong verbal communication & system design skills)\n• 4+ years React, Node.js, and WebRTC production experience.`;
      } else if (qLower.includes('compare')) {
        aiReply = `AI Comparison Summary (Arth Prajapati vs Rahul Sharma):\n\n1. Arth Prajapati (96% Match):\n   - Experience: 4+ Years Full Stack\n   - ATS Score: 98/100 | Coding Test: 95/100\n   - Strengths: Production WebRTC, System Architecture\n\n2. Rahul Sharma (92% Match):\n   - Experience: 3.5 Years Frontend\n   - ATS Score: 94/100 | Coding Test: 88/100\n   - Strengths: Tailwind, Redux, React Native\n\nRecommendation: Arth Prajapati is recommended for Senior System roles, while Rahul is ideal for Frontend Specialist roles.`;
      } else if (qLower.includes('offer letter')) {
        aiReply = `Executive Offer Letter Draft:\n\nDear [Candidate Name],\n\nWe are thrilled to offer you the position of Senior Full Stack Engineer at TechFlow Systems! Your technical expertise and interview performance significantly impressed our leadership team.\n\n• Annual Compensation: $145,000 USD\n• Equity Grant: 0.25% Stock Options\n• Start Date: September 1, 2026\n• Benefits: Health, Dental, 401(k) matching, and Remote Stipend.\n\nPlease sign and return this offer by August 15, 2026.\n\nWarm regards,\nTechFlow Hiring Committee`;
      } else if (qLower.includes('interview questions')) {
        aiReply = `AI Generated Technical & System Design Questions:\n\n1. Technical: "How do you handle referential equality, useMemo, and re-rendering optimization in React 18 fiber reconciler?"\n2. Backend: "Walk me through how you prevent event loop starvation under high concurrency in Node.js."\n3. Database: "Explain the ESR (Equality, Sort, Range) rule for compound MongoDB index optimization."\n4. Behavioral: "Describe a production outage you hotfixed under pressure. What was the post-mortem impact?"`;
      } else {
        aiReply = `I analyzed your request regarding "${query}". Based on candidate profile data and Gemini LLM evaluations, our top candidates exceed 90% skill alignment. Would you like me to draft an interview invite or generate a side-by-side comparison report?`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col h-[640px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Gemini Recruiter Copilot Assistant</h3>
            <p className="text-[10px] text-slate-400">Natural language hiring queries & document generation</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> AI Active
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-purple-950 border border-purple-800 text-purple-400'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[85%] space-y-1 relative group ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap font-sans'
                }`}
              >
                <div className="flex justify-between items-center gap-2 border-b border-slate-800/40 pb-1 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                    {m.sender === 'user' ? 'Recruiter' : 'Gemini AI Assistant'}
                  </span>
                  <span className="text-[9px] opacity-40 font-mono">{m.timestamp}</span>
                </div>

                <p className="leading-relaxed">{m.text}</p>

                {m.sender === 'ai' && (
                  <button
                    onClick={() => handleCopyText(m.id, m.text)}
                    className="absolute top-2 right-2 p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                    title="Copy AI response"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Gemini AI is analyzing candidates...
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0 select-none">
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(promptText)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:border-brand-500 hover:text-brand-400 whitespace-nowrap transition-colors"
          >
            + {promptText}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center shrink-0">
        <input
          type="text"
          placeholder="Ask AI recruiter assistant (e.g. 'Draft offer letter for Arth', 'Compare candidates')..."
          className="w-full pl-4 pr-12 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={() => handleSendMessage()}
          className="absolute right-2 p-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
