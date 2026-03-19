import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Evidence } from '../types';
import { Gavel, ShieldAlert, Scale } from 'lucide-react';

interface ArbitrationPhaseProps {
  evidenceList: Evidence[];
  onComplete: (result: { type: 'arbitration_win' | 'arbitration_loss', amount: number }) => void;
}

export function ArbitrationPhase({ evidenceList, onComplete }: ArbitrationPhaseProps) {
  const [logs, setLogs] = useState<{ text: string; type: 'info' | 'lawyer' | 'judge' | 'result' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let isMounted = true;
    
    const runArbitration = async () => {
      const submitted = evidenceList.filter(e => e.status === 'collected' || e.status === 'presented');
      
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const addLog = (text: string, type: 'info' | 'lawyer' | 'judge' | 'result') => {
        if (isMounted) {
          setLogs(prev => [...prev, { text, type }]);
        }
      };

      await sleep(1000);
      addLog('你向劳动争议仲裁委员会提交了仲裁申请...', 'info');
      
      await sleep(1500);
      if (submitted.length === 0) {
        addLog('你没有任何实质性证据。', 'info');
        await sleep(1500);
        addLog('公司律师：申请人没有任何证据证明公司违法解除劳动合同。', 'lawyer');
        await sleep(1500);
        addLog('仲裁员：因申请人举证不能，驳回全部仲裁请求。', 'judge');
        await sleep(2000);
        if (isMounted) onComplete({ type: 'arbitration_loss', amount: 0 });
        return;
      }

      addLog(`你提交了 ${submitted.length} 份证据。`, 'info');
      await sleep(1500);
      addLog('公司律师开始质证...', 'info');
      await sleep(1500);

      let finalValid: Evidence[] = [];

      for (const ev of submitted) {
        if (ev.id === 'attendance_1') {
          addLog(`公司律师：关于【${ev.name}】，该加班未经过公司审批系统，属于员工自愿滞留公司，不应支付加班费。`, 'lawyer');
          await sleep(2000);
          addLog(`仲裁员：考勤记录虽存在，但无审批记录，证据效力较弱。`, 'judge');
          // Invalidated
        } else if (ev.id === 'audio_1') {
          addLog(`公司律师：关于【${ev.name}】，该录音未经我方同意，属于偷录，侵犯隐私，不具备合法性！`, 'lawyer');
          await sleep(2000);
          addLog(`仲裁员：劳动争议案件中，只要未侵害他人合法权益，偷录的视听资料可作为证据使用。证据有效。`, 'judge');
          finalValid.push(ev);
        } else if (ev.id === 'email_1') {
          addLog(`公司律师：关于【${ev.name}】，这只是阶段性绩效，不能代表其最终胜任工作。`, 'lawyer');
          await sleep(2000);
          addLog(`仲裁员：该邮件由公司官方邮箱发出，能初步证明申请人绩效合格。证据有效。`, 'judge');
          finalValid.push(ev);
        } else {
          addLog(`公司律师对【${ev.name}】的真实性不予认可，但未能提供反证。`, 'lawyer');
          await sleep(2000);
          addLog(`仲裁员：证据有效。`, 'judge');
          finalValid.push(ev);
        }
        await sleep(1500);
      }

      addLog('质证环节结束，仲裁庭正在合议...', 'info');
      await sleep(2000);

      if (finalValid.some(e => e.impact === 'high')) {
        addLog('仲裁员：公司构成违法解除劳动合同，裁决支付赔偿金（2N）。', 'result');
        await sleep(2000);
        if (isMounted) onComplete({ type: 'arbitration_win', amount: 60000 });
      } else if (finalValid.some(e => e.impact === 'medium')) {
        addLog('仲裁员：公司解除劳动合同程序存在瑕疵，裁决支付经济补偿金及代通知金（N+1）。', 'result');
        await sleep(2000);
        if (isMounted) onComplete({ type: 'arbitration_win', amount: 40000 });
      } else if (finalValid.length > 0) {
        addLog('仲裁员：支持申请人部分诉求，裁决支付经济补偿金（N）。', 'result');
        await sleep(2000);
        if (isMounted) onComplete({ type: 'arbitration_win', amount: 30000 });
      } else {
        addLog('仲裁员：申请人证据不足，驳回仲裁请求。', 'result');
        await sleep(2000);
        if (isMounted) onComplete({ type: 'arbitration_loss', amount: 0 });
      }
    };

    runArbitration();
    
    return () => {
      isMounted = false;
    };
  }, [evidenceList, onComplete]);

  return (
    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <Gavel className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">劳动争议仲裁庭</h2>
            <p className="text-sm text-slate-500">庭审进行中...</p>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100 scroll-smooth">
          {logs.map((log, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                log.type === 'lawyer' ? 'bg-rose-50 border-rose-200 text-rose-800 ml-8' :
                log.type === 'judge' ? 'bg-indigo-50 border-indigo-200 text-indigo-800 mr-8' :
                log.type === 'result' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold text-center mx-8' :
                'bg-white border-slate-200 text-slate-600 text-center text-sm mx-12'
              }`}
            >
              {log.type === 'lawyer' && <div className="text-xs font-bold text-rose-600 mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> 公司律师</div>}
              {log.type === 'judge' && <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1"><Scale className="w-3 h-3"/> 仲裁员</div>}
              {log.text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
