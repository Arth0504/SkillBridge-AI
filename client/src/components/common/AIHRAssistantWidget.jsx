import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export const AIHRAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Recruiter! I am your AI HR Assistant. Ask me anything about your candidate pipeline (e.g. "Top React candidates", "Candidates with 5+ years", "Who passed coding?")',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/company/applications/ai-assistant/query', { query: userMsg });
      const { answer, candidates } = res.data.data;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: answer,
          candidates: candidates || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an issue querying your candidate database.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white/20 flex items-center gap-2 group"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-extrabold hidden md:inline">AI HR Assistant</span>
      </button>

      {/* Slide-over Drawer Chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] rounded-3xl bg-slate-950 border-2 border-brand-500/40 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AI HR Assistant <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  </h3>
                  <p className="text-[10px] text-slate-400">Live MongoDB Pipeline Intelligence</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Render Candidates preview chips if returned */}
                  {m.candidates && m.candidates.length > 0 && (
                    <div className="mt-2 space-y-1 w-full">
                      {m.candidates.slice(0, 3).map((c, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <User className="w-3 h-3 text-brand-400" /> {c.name}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {c.email || c.status || `${c.experienceYears || 3} Yrs`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-xs text-brand-400 italic flex items-center gap-2">
                  <Bot className="w-4 h-4 animate-spin" /> Querying candidate database...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI HR Assistant..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
