import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Briefcase, X, FileText, CheckCircle2, Swords, Scale, Heart, Coffee, MessageSquare, AlertTriangle } from 'lucide-react';
import { Evidence, Message } from '../types';
import { SuggestedReply } from '../services/ai';

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isEnded: boolean;
  selectedEvidence: Evidence | null;
  onClearEvidence: () => void;
  suggestedReplies?: SuggestedReply[];
  hrMood: string;
  evidenceList: Evidence[];
  onSelectEvidence: (id: string) => void;
  isUltimatum: boolean;
  onAccept: () => void;
  onReject: () => void;
  currentOffer: number;
}

const getMoodConfig = (mood: string) => {
  if (!mood) return { color: 'text-indigo-600', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-200', glow: '', animation: {}, tagAnimation: {} };
  
  if (mood.includes('强硬') || mood.includes('愤怒') || mood.includes('高傲') || mood.includes('冷酷') || mood.includes('威胁') || mood.includes('破防')) {
    return {
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      borderColor: 'border-rose-200',
      glow: 'shadow-[0_0_20px_rgba(225,29,72,0.6)]',
      animation: { 
        x: [0, -5, 5, -5, 5, 0], 
        scale: [1, 1.1, 1],
        transition: { duration: 0.5, ease: "easeInOut" } 
      },
      tagAnimation: {
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 }
      }
    };
  }
  if (mood.includes('慌乱') || mood.includes('紧张') || mood.includes('动摇') || mood.includes('害怕') || mood.includes('心虚') || mood.includes('急躁')) {
    return {
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200',
      glow: 'shadow-[0_0_20px_rgba(217,119,6,0.6)]',
      animation: { 
        x: [0, -8, 8, -8, 8, -4, 4, 0], 
        y: [0, -2, 2, -2, 2, 0],
        backgroundColor: ['#fef3c7', '#fde68a', '#fef3c7'],
        transition: { duration: 0.6 } 
      },
      tagAnimation: {
        x: [0, -5, 5, -5, 5, 0],
        backgroundColor: ['#fef3c7', '#fde68a', '#fef3c7'],
        transition: { duration: 0.5 }
      }
    };
  }
  if (mood.includes('妥协') || mood.includes('无奈') || mood.includes('软化') || mood.includes('平静') || mood.includes('同情') || mood.includes('安抚')) {
    return {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200',
      glow: 'shadow-[0_0_15px_rgba(5,150,105,0.4)]',
      animation: { y: [0, -5, 0], transition: { duration: 0.5 } },
      tagAnimation: { scale: [1, 1.1, 1], transition: { duration: 0.5 } }
    };
  }
  
  return {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    glow: '',
    animation: {},
    tagAnimation: {}
  };
};

export function Chat({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isEnded, 
  selectedEvidence, 
  onClearEvidence, 
  suggestedReplies, 
  hrMood, 
  evidenceList, 
  onSelectEvidence,
  isUltimatum,
  onAccept,
  onReject,
  currentOffer
}: ChatProps) {
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

  const moodConfig = getMoodConfig(hrMood);
  const collectedEvidences = evidenceList.filter(e => e.status === 'collected');

  const getStyleConfig = (style: string) => {
    switch (style) {
      case 'tough': return { icon: <Swords size={14} />, color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' };
      case 'legal': return { icon: <Scale size={14} />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' };
      case 'emotional': return { icon: <Heart size={14} />, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' };
      case 'weakness': return { icon: <Coffee size={14} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' };
      default: return { icon: <MessageSquare size={14} />, color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            key={`avatar-${hrMood}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1, ...moodConfig.animation }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${moodConfig.bgColor} ${moodConfig.color} ${moodConfig.glow}`}
          >
            <Briefcase size={20} />
          </motion.div>
          <div>
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              王总监 (HR)
              <AnimatePresence mode="wait">
                <motion.span 
                  key={hrMood}
                  initial={{ opacity: 0, scale: 0.5, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, ...moodConfig.tagAnimation }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${moodConfig.bgColor} ${moodConfig.color} ${moodConfig.borderColor}`}
                >
                  {hrMood || '未知'}
                </motion.span>
              </AnimatePresence>
            </h2>
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
      {isUltimatum && !isEnded ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-rose-50 border-t border-rose-200 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xl">
            <AlertTriangle size={24} />
            <span>HR 已下达最后通牒！</span>
          </div>
          <p className="text-rose-600 text-sm max-w-md">
            谈判已至破裂边缘，HR 拒绝继续沟通。你只能选择接受当前报价，或者直接拒绝并申请劳动仲裁。
          </p>
          <div className="flex gap-4 w-full max-w-md mt-2">
            <button 
              onClick={onReject} 
              className="flex-1 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-medium hover:bg-rose-50 transition-colors"
            >
              拒绝并仲裁
            </button>
            <button 
              onClick={onAccept} 
              className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
            >
              接受报价 (￥{currentOffer.toLocaleString()})
            </button>
          </div>
        </motion.div>
      ) : (
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
        <AnimatePresence>
          {collectedEvidences.length > 0 && !isLoading && !isEnded && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-wrap gap-2 mb-1 items-center"
            >
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
                <FileText size={14} /> 可用证据:
              </span>
              {collectedEvidences.map((evidence) => (
                <button
                  key={evidence.id}
                  onClick={() => onSelectEvidence(evidence.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 border ${
                    selectedEvidence?.id === evidence.id 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {selectedEvidence?.id === evidence.id && <CheckCircle2 size={12} />}
                  {evidence.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {suggestedReplies && suggestedReplies.length > 0 && !isLoading && !isEnded && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-col gap-2 mb-2"
            >
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MessageSquare size={14} /> 谈判策略建议:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedReplies.map((reply, idx) => {
                  const config = getStyleConfig(reply.style);
                  return (
                    <button
                      key={idx}
                      onClick={() => setInput(reply.text)}
                      className={`text-xs border px-3 py-2 rounded-lg transition-colors text-left flex flex-col gap-1 ${config.color}`}
                    >
                      <span className="font-semibold flex items-center gap-1 opacity-80">
                        {config.icon} {reply.label}
                      </span>
                      <span className="line-clamp-2">{reply.text}</span>
                    </button>
                  );
                })}
              </div>
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
      )}
    </div>
  );
}
