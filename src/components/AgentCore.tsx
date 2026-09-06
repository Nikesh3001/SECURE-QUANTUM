import { useEffect, useRef } from 'react';
import { Brain, Eye, Terminal, CheckCircle, Loader2, FileText, Download, Crosshair, Radar } from 'lucide-react';

export type AgentLog = {
  id: number;
  type: 'observe' | 'think' | 'predict' | 'action' | 'trace' | 'success' | 'report';
  text: string;
};

interface AgentCoreProps {
  logs: AgentLog[];
  isActive: boolean;
  onDownloadReport?: () => void;
}

export default function AgentCore({ logs, isActive, onDownloadReport }: AgentCoreProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden relative shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-3 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 ${isActive ? 'text-[#00e5ff]' : 'text-[#52525b]'}`} />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#e4e4e7]">Autonomous Defense Engine</h3>
        </div>
        {isActive ? (
          <span className="text-[9px] font-mono text-[#00e5ff] flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> ENGAGED
          </span>
        ) : (
          <span className="text-[9px] font-mono text-[#52525b] tracking-widest">MONITORING</span>
        )}
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#52525b] space-y-2">
            <Crosshair className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Threat Prediction Engine Active</p>
            <p className="text-[9px] font-mono text-center max-w-[80%] opacity-70">Awaiting anomalous signatures to initiate autonomous defense and IP de-anonymization...</p>
          </div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mt-0.5 shrink-0">
              {log.type === 'observe' && <Eye className="w-4 h-4 text-[#a1a1aa]" />}
              {log.type === 'think' && <Brain className="w-4 h-4 text-[#00e5ff]" />}
              {log.type === 'predict' && <Crosshair className="w-4 h-4 text-[#ffbb33]" />}
              {log.type === 'action' && <Terminal className="w-4 h-4 text-[#ff4444]" />}
              {log.type === 'trace' && <Radar className="w-4 h-4 text-[#00e5ff]" />}
              {log.type === 'success' && <CheckCircle className="w-4 h-4 text-[#00C851]" />}
              {log.type === 'report' && <FileText className="w-4 h-4 text-[#e4e4e7]" />}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#71717a]">
                {log.type === 'observe' && 'Detection'}
                {log.type === 'think' && 'Pattern Analysis'}
                {log.type === 'predict' && 'Threat Prediction'}
                {log.type === 'action' && 'Autonomous Defense'}
                {log.type === 'trace' && 'IP De-anonymization'}
                {log.type === 'success' && 'Mitigation Complete'}
                {log.type === 'report' && 'Post-Mortem Report'}
              </p>
              <div className={`text-[11px] font-mono leading-relaxed ${
                log.type === 'observe' ? 'text-[#e4e4e7]' :
                log.type === 'think' ? 'text-[#00e5ff]' :
                log.type === 'predict' ? 'text-[#ffbb33]' :
                log.type === 'action' ? 'text-[#ff4444]' :
                log.type === 'trace' ? 'text-[#00e5ff]' :
                log.type === 'report' ? 'text-[#e4e4e7] bg-[#18181b] p-4 rounded-sm border border-[#27272a] mt-2 whitespace-pre-wrap' : 'text-[#00C851]'
              }`}>
                {log.text}
                {log.type === 'report' && onDownloadReport && (
                  <button 
                    onClick={onDownloadReport}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#e4e4e7] text-[#09090b] font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-white transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download Threat Intel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
