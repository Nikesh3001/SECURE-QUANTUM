
import { motion } from 'motion/react';
import { Activity, Brain, Crosshair, Shield, Radar, CheckCircle, Clock } from 'lucide-react';

interface TimelineProps {
  attackState: 'idle' | 'detecting' | 'analyzing' | 'predicting' | 'defending' | 'tracing' | 'mitigated';
}

const STAGES = [
  { id: 'detecting', label: 'Detection', icon: Activity },
  { id: 'analyzing', label: 'Analysis', icon: Brain },
  { id: 'predicting', label: 'Prediction', icon: Crosshair },
  { id: 'defending', label: 'Defense', icon: Shield },
  { id: 'tracing', label: 'Tracing', icon: Radar },
  { id: 'mitigated', label: 'Mitigation', icon: CheckCircle }
];

export default function ForensicsTimeline({ attackState }: TimelineProps) {
  // Determine the current index in the sequence
  const currentIndex = STAGES.findIndex(s => s.id === attackState);
  
  // If idle, nothing is active
  const activeIndex = attackState === 'idle' ? -1 : currentIndex;

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] border border-[#27272a] rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden h-full">
      <div className="p-3 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa] flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Forensics Timeline
        </h3>
        {attackState !== 'idle' && attackState !== 'mitigated' && (
          <span className="w-2 h-2 rounded-full bg-[#ff4444] animate-ping"></span>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto relative">
        {attackState === 'idle' ? (
          <div className="h-full flex flex-col items-center justify-center text-[#52525b] opacity-50 space-y-2">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-[9px] uppercase tracking-widest text-center">Awaiting Incident</p>
          </div>
        ) : (
          <div className="relative h-full flex flex-col justify-between py-2">
            {/* Vertical Line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-[#27272a]"></div>
            
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isPast = index < activeIndex;
              const isCurrent = index === activeIndex;
              const isFuture = index > activeIndex;
              
              let color = '#3f3f46'; // Future (muted)
              let bgColor = '#18181b';
              let borderColor = '#27272a';
              
              if (isPast) {
                color = '#00C851';
                bgColor = '#00C85110';
                borderColor = '#00C851';
              } else if (isCurrent) {
                color = '#00e5ff';
                bgColor = '#00e5ff10';
                borderColor = '#00e5ff';
              }

              return (
                <div key={stage.id} className="relative z-10 flex items-center gap-4">
                  <div 
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-500`}
                    style={{ backgroundColor: bgColor, borderColor: borderColor, color: color }}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  <div className={`flex-1 transition-opacity duration-500 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isCurrent ? color : (isPast ? '#e4e4e7' : '#71717a') }}>
                      {stage.label}
                    </h4>
                    {isCurrent && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-px mt-1"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
