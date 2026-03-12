import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, FileText, Gavel, Scale, TrendingUp, User, Mic, Mail, BookOpen, Clock, CheckCircle2, Save, Download, RefreshCcw } from 'lucide-react';
import { Evidence } from '../types';

interface SidebarProps {
  currentOffer: number;
  hrMood: string;
  isFinalOffer: boolean;
  onAccept: () => void;
  onReject: () => void;
  evidenceList: Evidence[];
  onCollectEvidence: (id: string) => void;
  onSelectEvidence: (id: string) => void;
  selectedEvidenceId: string | null;
  onSave: () => void;
  onLoad: () => void;
  onRestart: () => void;
  hasSavedGame: boolean;
}

export function Sidebar({ 
  currentOffer, 
  hrMood, 
  isFinalOffer, 
  onAccept, 
  onReject,
  evidenceList,
  onCollectEvidence,
  onSelectEvidence,
  selectedEvidenceId,
  onSave,
  onLoad,
  onRestart,
  hasSavedGame
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'evidence'>('status');
  const targetCompensation = 60000;
  const progress = Math.min((currentOffer / targetCompensation) * 100, 100);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'mic': return <Mic className="w-4 h-4" />;
      case 'mail': return <Mail className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white shrink-0">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Scale className="text-emerald-600" />
          N+1 谈判模拟器
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          模拟被违法辞退后的谈判过程。利用法律知识，争取最大化合法权益。
        </p>
      </div>

      <div className="flex border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'status' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          谈判状态
          {activeTab === 'status' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-1 ${
            activeTab === 'evidence' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          收集证据
          {evidenceList.some(e => e.status === 'available') && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
          {activeTab === 'evidence' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'status' ? (
            <motion.div
              key="status"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Player Stats */}
              <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-slate-400" />
                  你的档案
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">职位</span>
                    <span className="font-medium text-slate-800">高级前端开发</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">月薪</span>
                    <span className="font-medium text-slate-800">10,000 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">司龄</span>
                    <span className="font-medium text-slate-800">3 年</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between">
                    <span className="text-slate-500">法定赔偿金 (2N)</span>
                    <span className="font-bold text-emerald-600">60,000 元</span>
                  </div>
                </div>
              </section>

              {/* Negotiation Status */}
              <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  谈判状态
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">当前报价</span>
                    <span className="font-bold text-indigo-600">￥{currentOffer.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-indigo-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>￥0</span>
                    <span>目标: ￥60,000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-t border-slate-100">
                  <span className="text-slate-500">HR 情绪</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    hrMood === '慌乱' || hrMood === '妥协' ? 'bg-emerald-100 text-emerald-700' :
                    hrMood === '愤怒' || hrMood === '强硬' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {hrMood || '未知'}
                  </span>
                </div>

                {isFinalOffer && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      HR已给出最终报价，继续施压可能导致谈判破裂。
                    </p>
                  </div>
                )}

                {currentOffer > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                      onClick={onReject}
                      className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      拒绝报价
                    </button>
                    <button 
                      onClick={onAccept}
                      className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      接受并签字
                    </button>
                  </div>
                )}
              </section>

              {/* Legal Tips */}
              <section className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                  <Gavel className="w-4 h-4" />
                  法律小贴士
                </h3>
                <ul className="space-y-3 text-xs text-emerald-700 leading-relaxed">
                  <li className="flex gap-2">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                    <span><strong>N</strong>：工作年限。满一年算1个月工资，不满半年算0.5个月，满半年不满一年算1个月。</span>
                  </li>
                  <li className="flex gap-2">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                    <span><strong>N+1</strong>：合法解除（如客观情况发生重大变化）且未提前30天通知，需支付N+1。</span>
                  </li>
                  <li className="flex gap-2">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                    <span><strong>2N</strong>：公司违法解除劳动合同（如无故辞退），需支付双倍经济补偿金，即2N。</span>
                  </li>
                  <li className="flex gap-2">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                    <span><strong>注意</strong>：绩效不达标不能直接辞退，需经过培训或调岗仍不胜任才可解除（需支付N+1）。</span>
                  </li>
                </ul>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="evidence"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-500 mb-2">
                收集证据并在聊天中出示，可以对 HR 施加压力，提高赔偿金。
              </p>
              
              {evidenceList.map((evidence) => (
                <div 
                  key={evidence.id} 
                  className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                    evidence.status === 'presented' ? 'border-slate-200 opacity-60' :
                    selectedEvidenceId === evidence.id ? 'border-emerald-500 ring-1 ring-emerald-500' :
                    'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        evidence.impact === 'high' ? 'bg-red-100 text-red-600' :
                        evidence.impact === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getIcon(evidence.icon)}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800">{evidence.name}</h4>
                    </div>
                    {evidence.status === 'presented' && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> 已出示
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {evidence.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      威慑力: {
                        evidence.impact === 'high' ? <span className="text-red-500">高</span> :
                        evidence.impact === 'medium' ? <span className="text-amber-500">中</span> :
                        <span className="text-blue-500">低</span>
                      }
                    </span>
                    
                    {evidence.status === 'available' ? (
                      <button
                        onClick={() => onCollectEvidence(evidence.id)}
                        className="text-xs font-medium px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {evidence.actionText}
                      </button>
                    ) : evidence.status === 'collected' ? (
                      <button
                        onClick={() => onSelectEvidence(evidence.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          selectedEvidenceId === evidence.id 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {selectedEvidenceId === evidence.id ? '已选择' : '选择出示'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Controls Footer */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={onSave}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="保存进度"
          >
            <Save className="w-4 h-4" />
            <span className="text-[10px] font-medium">保存</span>
          </button>
          <button 
            onClick={onLoad}
            disabled={!hasSavedGame}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors ${
              hasSavedGame 
                ? 'text-slate-600 hover:bg-slate-100' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title="读取进度"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-medium">读取</span>
          </button>
          <button 
            onClick={onRestart}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="重新开始"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-[10px] font-medium">重开</span>
          </button>
        </div>
      </div>
    </div>
  );
}
