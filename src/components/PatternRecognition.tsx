import { useState, useEffect } from 'react';
import { Code } from 'lucide-react';

interface PatternRecognitionProps {
  attackState: 'idle' | 'detecting' | 'analyzing' | 'predicting' | 'defending' | 'tracing' | 'mitigated';
  activeOwasp?: string | null;
}

export default function PatternRecognition({ attackState, activeOwasp }: PatternRecognitionProps) {
  const [displayedText, setDisplayedText] = useState('');

  const targetText = (() => {
    switch(attackState) {
      case 'idle': return '> SYSTEM SECURE\n> NO ACTIVE THREAT SIGNATURES DETECTED\n> LISTENING ON PORT 443...';
      case 'detecting': return `> INTRUSION DETECTED\n> MATCHING OWASP SIGNATURE: ${activeOwasp || 'UNKNOWN'}\n> ANALYZING PACKET PAYLOAD...\n> EXTRACTING SIGNATURE...`;
      case 'analyzing': return `> DECOMPILING PAYLOAD FOR ${activeOwasp || 'ATTACK'}...\n> \\x31\\xc0\\x50\\x68\\x2f\\x2f\\x73\\x68\\x68\\x2f\\x62\\x69\\x6e\\x89\\xe3\\x50\n> MALICIOUS SEQUENCE IDENTIFIED\n> TARGET: svchost.exe`;
      case 'predicting': return `> MAPPING ATTACK TRAJECTORY...\n> EXPLOIT VECTOR ALIGNED WITH ${activeOwasp || 'OWASP GUIDELINES'}\n> PREDICTED NEXT STEP: PRIVILEGE ESCALATION (NT AUTHORITY\\SYSTEM)`;
      case 'defending': return '> DEPLOYING COUNTERMEASURES...\n> INITIATING MEMORY HOT-PATCH AT 0x080483A4\n> IMPLEMENTING DYNAMIC VLAN MICRO-SEGMENTATION\n> ISOLATING COMPROMISED NODE...';
      case 'tracing': return '> TRACING ORIGIN...\n> BYPASSING TOR EXIT NODE [185.22.44.11]\n> CORRELATING TIMING ATTACKS...\n> REVERSE PROXY HOP DETECTED. UNMASKING...';
      case 'mitigated': return `> THREAT NEUTRALIZED.\n> ${activeOwasp || 'ATTACK'} SIGNATURE HASH ADDED TO GLOBAL INTEL.\n> SYSTEM RETURNED TO NOMINAL STATE.`;
      default: return '> SYSTEM SECURE';
    }
  })();

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    let currentText = '';
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (i < targetText.length) {
        currentText += targetText.charAt(i);
        setDisplayedText(currentText);
        i++;
        // Randomize typing speed for realism (10ms - 40ms)
        const delay = Math.random() * 30 + 10;
        timeoutId = setTimeout(typeChar, delay);
      }
    };

    typeChar();

    return () => clearTimeout(timeoutId);
  }, [targetText]);

  let textColor = 'text-[#00e5ff]';
  if (attackState === 'detecting' || attackState === 'analyzing') textColor = 'text-[#ff4444]';
  if (attackState === 'predicting') textColor = 'text-[#ffbb33]';
  if (attackState === 'mitigated') textColor = 'text-[#00C851]';

  return (
    <div className="rounded-sm bg-[#09090b] border border-[#27272a] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col h-32 shrink-0">
      <div className="p-2 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] flex items-center gap-2">
          <Code className="w-3 h-3" />
          Pattern Recognition Engine
        </h3>
        {attackState !== 'idle' && attackState !== 'mitigated' && (
          <span className="text-[9px] font-mono text-[#ff4444] animate-pulse">ANALYZING...</span>
        )}
      </div>
      <div className="p-3 flex-1 overflow-y-auto relative bg-[#050505]">
        <pre className={`text-[10px] font-mono whitespace-pre-wrap leading-relaxed ${textColor}`}>
          {displayedText}
          <span className="animate-pulse inline-block w-1.5 h-3 bg-current align-middle ml-1"></span>
        </pre>
      </div>
    </div>
  );
}
