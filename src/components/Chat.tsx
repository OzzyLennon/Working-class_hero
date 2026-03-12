import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Briefcase, X, FileText } from 'lucide-react';
import { Evidence } from '../types';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  internalThoughts?: string;
  attachedEvidence?: Evidence;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isEnded: boolean;
  selectedEvidence: Evidence | null;
  onClearEvidence: () => void;
  suggestedReplies?: string[];
}

export function Chat({ messages, onSendMessage, isLoading, isEnded, selectedEvidence, onClearEvidence, suggestedReplies }: ChatProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isEnded) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">王总监 (HR)</h2>
            <p className="text-xs text-slate-500">正在与您协商离职事宜</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Briefcase size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {msg.attachedEvidence && (
                  <div className="mb-2 p-2 bg-emerald-700/30 rounded-lg flex items-start gap-2 text-sm border border-emerald-500/30">
                    <FileText size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">出示证据：{msg.attachedEvidence.name}</span>
                      <span className="text-emerald-100 text-xs opacity-90">{msg.attachedEvidence.description}</span>
                    </div>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              
              {msg.internalThoughts && (
                <div className="mt-2 text-xs text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-500">HR内心OS:</span> {msg.internalThoughts}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
              <Briefcase size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
        <AnimatePresence>
          {suggestedReplies && suggestedReplies.length > 0 && !isLoading && !isEnded && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-wrap gap-2 mb-1"
            >
              {suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(reply)}
                  className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors text-left"
                >
                  {reply}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedEvidence && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-sm"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                <span>准备出示：<span className="font-semibold">{selectedEvidence.name}</span></span>
              </div>
              <button 
                onClick={onClearEvidence}
                className="p-1 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isEnded}
            placeholder={isEnded ? "谈判已结束" : "输入你的回复，或点击上方参考回复..."}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isEnded}
            className="absolute right-2 p-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
