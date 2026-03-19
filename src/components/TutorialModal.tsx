import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, FileSearch, MessageSquare, AlertTriangle, X } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">谈判生存指南</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">终极目标：2N 赔偿金</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    公司试图以极低的代价裁员。你的目标是利用一切手段，争取到合法的 <strong>2N 赔偿金</strong>（N 为在公司工作的年限，2N 即双倍经济补偿金）。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <FileSearch size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">收集与出示证据</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    在左侧的“办公桌”中寻找有利证据（如加班记录、绩效邮件）。在聊天中<strong>选中证据并发送</strong>，可以大幅提升你的谈判筹码，迫使 HR 提高报价。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">灵活的谈判策略</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    你可以选择不同的回复策略（强硬施压、情感诉求、法律依据、策略示弱）。观察 <strong>HR 的情绪变化</strong>，在适当的时候施压或给台阶，才能利益最大化。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">注意 HR 耐心度</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    如果一味强硬或反复纠缠，HR 的耐心度会下降。当耐心度降至极低时，HR 会下达<strong>最后通牒</strong>并拒绝沟通，你将面临被动局面。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                我知道了，开始谈判
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
