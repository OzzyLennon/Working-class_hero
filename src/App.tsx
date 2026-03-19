import React, { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import { TutorialModal } from './components/TutorialModal';
import { ArbitrationPhase } from './components/ArbitrationPhase';
import { negotiateWithHR, NegotiationResponse, SuggestedReply } from './services/ai';
import { motion, AnimatePresence } from 'motion/react';
import { Evidence, Message } from './types';

const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: 'audio_1',
    name: 'HR违法辞退录音',
    description: '证明HR口头承认没有合法理由辞退，且未提前30天通知。',
    impact: 'high',
    status: 'available',
    actionText: '偷偷开启手机录音',
    icon: 'mic'
  },
  {
    id: 'email_1',
    name: '年度绩效合格通知',
    description: '证明你近期绩效达标，公司不能以“不胜任”为由辞退。',
    impact: 'medium',
    status: 'available',
    actionText: '翻找历史邮件',
    icon: 'mail'
  },
  {
    id: 'law_1',
    name: '《劳动合同法》第87条',
    description: '明确规定用人单位违法解除劳动合同，需支付2N赔偿金。',
    impact: 'medium',
    status: 'available',
    actionText: '搜索劳动法条文',
    icon: 'book'
  },
  {
    id: 'attendance_1',
    name: '长期无偿加班记录',
    description: '证明你为公司付出了大量额外时间，可作为要求加班费的筹码。',
    impact: 'low',
    status: 'available',
    actionText: '导出打卡记录',
    icon: 'clock'
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [hrMood, setHrMood] = useState('高傲');
  const [hrPatience, setHrPatience] = useState(100);
  const [isFinalOffer, setIsFinalOffer] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [gamePhase, setGamePhase] = useState<'negotiation' | 'arbitration' | 'ended'>('negotiation');
  const [endResult, setEndResult] = useState<{ type: 'accept' | 'reject' | 'breakdown' | 'arbitration_win' | 'arbitration_loss', amount?: number } | null>(null);

  const [evidenceList, setEvidenceList] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<SuggestedReply[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const saved = localStorage.getItem('n_plus_1_save_data');
    if (saved) {
      setHasSavedGame(true);
    }
    
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }
  }, []);

  // Initial greeting from HR
  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);
      try {
        const response = await negotiateWithHR([], "（玩家走进会议室，坐下）");
        handleHRResponse(response);
      } catch (error: any) {
        console.error("Failed to initialize game:", error);
        const errorStr = error instanceof Error ? error.message : JSON.stringify(error);
        const isQuotaExceeded = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota');
        
        setMessages([{
          id: 'error',
          role: 'model',
          text: isQuotaExceeded 
            ? '系统提示：API 配额已耗尽 (429 RESOURCE_EXHAUSTED)。请检查您的 API 密钥账单状态，或稍后再试。'
            : '系统错误，无法连接到HR。请刷新页面重试。'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    initGame();
  }, []);

  const handleSaveGame = (isAutoSave: boolean = false) => {
    const gameState = {
      messages,
      currentOffer,
      hrMood,
      hrPatience,
      isFinalOffer,
      isEnded,
      gamePhase,
      endResult,
      evidenceList,
      suggestedReplies
    };
    localStorage.setItem('n_plus_1_save_data', JSON.stringify(gameState));
    setHasSavedGame(true);
    if (!isAutoSave) {
      alert('游戏进度已保存！');
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (messages.length === 0 || isEnded) return;

    // Auto-save on key negotiation nodes (when state changes)
    handleSaveGame(true);

    // Periodic auto-save every 30 seconds
    const autoSaveTimer = setInterval(() => {
      handleSaveGame(true);
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentOffer, hrMood, hrPatience, isFinalOffer, isEnded, endResult, evidenceList, suggestedReplies]);

  const handleLoadGame = () => {
    const saved = localStorage.getItem('n_plus_1_save_data');
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        setMessages(gameState.messages || []);
        setCurrentOffer(gameState.currentOffer || 0);
        setHrMood(gameState.hrMood || '高傲');
        setHrPatience(gameState.hrPatience ?? 100);
        setIsFinalOffer(gameState.isFinalOffer || false);
        setIsEnded(gameState.isEnded || false);
        setGamePhase(gameState.gamePhase || 'negotiation');
        setEndResult(gameState.endResult || null);
        setEvidenceList(gameState.evidenceList || INITIAL_EVIDENCE);
        setSuggestedReplies(gameState.suggestedReplies || []);
        setSelectedEvidenceId(null);
        alert('游戏进度已读取！');
      } catch (e) {
        console.error('Failed to load game', e);
        alert('读取存档失败，存档文件可能已损坏。');
      }
    }
  };

  const handleRestartGame = () => {
    if (window.confirm('确定要重新开始吗？当前未保存的进度将会丢失。')) {
      window.location.reload();
    }
  };

  const handleHRResponse = (response: NegotiationResponse) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      text: response.dialogue,
      internalThoughts: response.internalThoughts,
    };
    
    setMessages(prev => [...prev, newMsg]);
    setCurrentOffer(response.currentOffer);
    setHrMood(response.hrMood);
    setHrPatience(response.hrPatience ?? 100);
    setIsFinalOffer(response.isFinalOffer);
    setSuggestedReplies(response.suggestedReplies || []);

    if (response.isFinalOffer && response.currentOffer === 0) {
      // If HR gives final offer of 0, it's a breakdown
      // Wait, let's let the player decide to reject or accept 0.
    }
  };

  const handleSendMessage = async (text: string) => {
    let finalMessageText = text;
    const selectedEvidence = evidenceList.find(e => e.id === selectedEvidenceId);
    
    if (selectedEvidence) {
      finalMessageText = `${text}\n\n[系统提示：玩家出示了证据 - ${selectedEvidence.name} (${selectedEvidence.description})。该证据威慑力：${selectedEvidence.impact === 'high' ? '高' : selectedEvidence.impact === 'medium' ? '中' : '低'}]`;
      
      // Mark evidence as presented
      setEvidenceList(prev => prev.map(e => 
        e.id === selectedEvidenceId ? { ...e, status: 'presented' } : e
      ));
      setSelectedEvidenceId(null);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      attachedEvidence: selectedEvidence || undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedReplies([]); // Clear suggested replies while loading

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.role === 'model' ? JSON.stringify({ dialogue: m.text, internalThoughts: m.internalThoughts, currentOffer, isFinalOffer, hrMood, hrPatience }) : m.text }]
      }));

      const response = await negotiateWithHR(history, finalMessageText);
      handleHRResponse(response);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const errorStr = error instanceof Error ? error.message : JSON.stringify(error);
      const isQuotaExceeded = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota');

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: isQuotaExceeded
          ? '系统提示：API 配额已耗尽 (429 RESOURCE_EXHAUSTED)。请检查您的 API 密钥账单状态，或稍后再试。'
          : '（HR接了个电话，暂时离开了会议室，请稍后再试）'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    setIsEnded(true);
    setEndResult({ type: 'accept', amount: currentOffer });
  };

  const handleReject = () => {
    setGamePhase('arbitration');
  };

  const handleArbitrationComplete = (result: { type: 'arbitration_win' | 'arbitration_loss', amount: number }) => {
    setEndResult({ type: result.type as any, amount: result.amount });
    setGamePhase('ended');
    setIsEnded(true);
  };

  const handleCollectEvidence = (id: string) => {
    setEvidenceList(prev => prev.map(e => 
      e.id === id ? { ...e, status: 'collected' } : e
    ));
  };

  const handleSelectEvidence = (id: string) => {
    setSelectedEvidenceId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => {
          setIsTutorialOpen(false);
          localStorage.setItem('hasSeenTutorial', 'true');
        }} 
      />
      <div className="hidden md:block h-full">
        <Sidebar 
          currentOffer={currentOffer}
          hrMood={hrMood}
          hrPatience={hrPatience}
          isFinalOffer={isFinalOffer}
          onAccept={handleAccept}
          onReject={handleReject}
          evidenceList={evidenceList}
          onCollectEvidence={handleCollectEvidence}
          onSelectEvidence={handleSelectEvidence}
          selectedEvidenceId={selectedEvidenceId}
          onSave={handleSaveGame}
          onLoad={handleLoadGame}
          onRestart={handleRestartGame}
          hasSavedGame={hasSavedGame}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          messages={messages}
        />
      </div>
      
      <main className="flex-1 p-0 md:p-6 relative flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">当前报价: ￥{currentOffer.toLocaleString()}</span>
            <span className="text-xs text-slate-500">法定 2N: ￥60,000</span>
          </div>
          {currentOffer > 0 && (
            <div className="flex gap-2">
              <button onClick={handleReject} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">拒绝</button>
              <button onClick={handleAccept} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">接受</button>
            </div>
          )}
        </div>

        <Chat 
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isEnded={isEnded}
          selectedEvidence={evidenceList.find(e => e.id === selectedEvidenceId) || null}
          onClearEvidence={() => setSelectedEvidenceId(null)}
          suggestedReplies={suggestedReplies}
          hrMood={hrMood}
          evidenceList={evidenceList}
          onSelectEvidence={handleSelectEvidence}
        />

        <AnimatePresence>
          {gamePhase === 'arbitration' && (
            <ArbitrationPhase 
              evidenceList={evidenceList} 
              onComplete={handleArbitrationComplete} 
            />
          )}
          
          {isEnded && endResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  (endResult.type === 'accept' || endResult.type === 'arbitration_win') && endResult.amount && endResult.amount >= 30000 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : endResult.type === 'accept' || endResult.type === 'arbitration_win'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-600'
                }`}>
                  <span className="text-3xl">
                    {(endResult.type === 'accept' || endResult.type === 'arbitration_win') && endResult.amount && endResult.amount >= 30000 ? '🎉' : 
                     endResult.type === 'accept' ? '🤝' : 
                     endResult.type === 'arbitration_win' ? '⚖️' : '💥'}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {endResult.type === 'accept' ? '达成协议' : 
                   endResult.type === 'arbitration_win' ? '仲裁胜诉' : 
                   endResult.type === 'arbitration_loss' ? '仲裁败诉' : '谈判破裂'}
                </h2>
                
                <div className="text-slate-600 mb-8 space-y-4">
                  {endResult.type === 'accept' ? (
                    <>
                      <p>你接受了HR的报价，签署了离职协议。</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1">最终赔偿金额</p>
                        <p className="text-3xl font-bold text-emerald-600">￥{endResult.amount?.toLocaleString()}</p>
                      </div>
                      {endResult.amount && endResult.amount >= 60000 ? (
                        <p className="text-sm text-emerald-600 font-medium">完美！你拿到了法定的最高赔偿 (2N)！</p>
                      ) : endResult.amount && endResult.amount >= 30000 ? (
                        <p className="text-sm text-emerald-600 font-medium">不错，你争取到了 N+1 甚至更多的赔偿。</p>
                      ) : (
                        <p className="text-sm text-amber-600 font-medium">有点亏，你拿到的赔偿低于 N+1，甚至被白嫖了。</p>
                      )}
                    </>
                  ) : endResult.type === 'arbitration_win' ? (
                    <>
                      <p>经过劳动仲裁，仲裁庭支持了你的诉求！</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1">裁决赔偿金额</p>
                        <p className="text-3xl font-bold text-emerald-600">￥{endResult.amount?.toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-emerald-600 font-medium">正义或许会迟到，但永远不会缺席！</p>
                    </>
                  ) : endResult.type === 'arbitration_loss' ? (
                    <>
                      <p>很遗憾，由于证据不足，仲裁庭驳回了你的请求。</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1">裁决赔偿金额</p>
                        <p className="text-3xl font-bold text-rose-600">￥0</p>
                      </div>
                      <p className="text-sm text-rose-600 font-medium">职场维权需要证据支撑，下次记得提前收集证据！</p>
                    </>
                  ) : (
                    <>
                      <p>你拒绝了HR的最终报价，谈判破裂。</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-1">放弃的报价</p>
                        <p className="text-xl font-bold text-slate-400 line-through">￥{endResult.amount?.toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium">
                        准备好收集证据（录音、打卡记录、工资条），仲裁庭见！
                      </p>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors"
                >
                  重新开始谈判
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
