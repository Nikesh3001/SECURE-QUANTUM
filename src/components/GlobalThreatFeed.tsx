import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, AlertTriangle } from 'lucide-react';

const HEADLINES = [
  "Manchester Airports Data Theft: Extortion group FulcrumSec claims 86 GB data theft.",
  "Chrome Zero-Day Exploited: Google patches type confusion bug (CVE-2026-85046) actively exploited in the wild.",
  "SonicWall SMA1000 Zero-Days: Vulnerabilities (CVE-2026-83549) being actively exploited for unauthenticated RCE.",
  "Langflow RCE Vulnerability: Critical bug allows remote code execution and theft of OpenAI/AWS keys.",
  "Elementor Pro WordPress Flaw: Critical vulnerability (CVE-2026-32475) exploited in active campaigns.",
  "Sality P2P Botnet Disrupted: Law enforcement successfully neutralizes 23-year-old botnet operation.",
  "AI Cyber Battlefield: OpenAI pledges $1 billion to assist critical infrastructure defenders against autonomous threats.",
  "FBI Consent Phishing Warning: Campaigns trick users into authorizing malicious apps for mailbox access."
];

export default function GlobalThreatFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 6000); // rotate every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#18181b] border border-[#27272a] rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center overflow-hidden h-8">
      <div className="bg-[#27272a] px-3 h-full flex items-center gap-2 border-r border-[#3f3f46] z-10 shrink-0">
        <Globe className="w-3.5 h-3.5 text-[#00e5ff]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e4e4e7] whitespace-nowrap">
          Global INTEL
        </span>
      </div>
      <div className="flex-1 px-4 relative h-full flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-mono text-[#a1a1aa] flex items-center gap-2 truncate absolute w-full"
          >
            <AlertTriangle className="w-3 h-3 text-[#ffbb33] shrink-0" />
            <span className="truncate">{HEADLINES[currentIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
