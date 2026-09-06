import { useState, useEffect } from 'react';
import {
  Globe,
  HardDriveDownload,
  Filter,
  Binary,
  Cpu,
  Zap,
  Crosshair,
  Activity,
  MessageSquareWarning,
  LayoutDashboard,
  RefreshCcw
} from 'lucide-react';

interface NodeProps {
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  isQuantum?: boolean;
}

const Node = ({ icon: Icon, title, isActive, isQuantum = false }: NodeProps) => (
  <div className={`relative z-10 flex flex-col items-center justify-center p-4 w-48 rounded-lg bg-[#0F0F12] border transition-all duration-500 ${
    isActive 
      ? isQuantum 
        ? 'border-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.4)] bg-[#00F5FF]/10' 
        : 'border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.3)] bg-[#00FF88]/10'
      : 'border-[#1E1E24]'
  }`}>
    <Icon className={`w-6 h-6 mb-2 transition-colors duration-500 ${
      isActive 
        ? isQuantum ? 'text-[#00F5FF]' : 'text-[#00FF88]'
        : 'text-[#4E4E5A]'
    }`} />
    <span className={`text-[10px] font-bold uppercase tracking-widest text-center transition-colors duration-500 ${
      isActive ? 'text-white' : 'text-[#8E8E9A]'
    }`}>
      {title}
    </span>
  </div>
);

export default function ArchitectureDiagram() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Cycles through 0 to 11 to animate the flow
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 12);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getLineClass = (active: boolean) => 
    `w-px h-6 transition-colors duration-500 ${active ? 'bg-[#00FF88] shadow-[0_0_10px_#00FF88]' : 'bg-[#1E1E24]'}`;

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#0A0A0C] p-8 flex flex-col items-center">
      
      <div className="mb-8 text-center">
        <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Quantum IDS Pipeline</h2>
        <p className="text-[10px] text-[#00F5FF] font-mono mt-2 tracking-widest animate-pulse">LIVE TELEMETRY FLOW ACTIVE</p>
      </div>

      <div className="flex flex-col items-center w-full max-w-3xl pb-16">
        {/* 0. Network Data */}
        <Node icon={Globe} title="Network / Log Data" isActive={activeIndex === 0} />
        <div className={getLineClass(activeIndex >= 0 && activeIndex < 1)} />

        {/* 1. Data Ingestion */}
        <Node icon={HardDriveDownload} title="Data Ingestion" isActive={activeIndex === 1} />
        <div className={getLineClass(activeIndex >= 1 && activeIndex < 2)} />

        {/* 2. Preprocessing */}
        <Node icon={Filter} title="Preprocessing" isActive={activeIndex === 2} />
        <div className={getLineClass(activeIndex >= 2 && activeIndex < 3)} />

        {/* 3. Feature Engineering */}
        <Node icon={Binary} title="Feature Engineering" isActive={activeIndex === 3} />
        <div className={getLineClass(activeIndex >= 3 && activeIndex < 4)} />

        {/* SPLIT */}
        <div className={`w-[256px] h-6 border-t border-l border-r rounded-t-lg border-b-0 transition-colors duration-500 ${
          activeIndex >= 3 && activeIndex < 4 ? 'border-[#00FF88] shadow-[0_0_10px_#00FF88_inset]' : 'border-[#1E1E24]'
        }`} />

        <div className="flex gap-16 -mt-px relative z-10">
          {/* 4. Classical Engine */}
          <Node icon={Cpu} title="Classical ML Engine" isActive={activeIndex === 4 || activeIndex === 5} />
          
          {/* 4. Quantum Engine */}
          <Node icon={Zap} title="Quantum / QML Engine" isActive={activeIndex === 4 || activeIndex === 5} isQuantum={true} />
        </div>

        {/* MERGE */}
        <div className={`w-[256px] h-6 border-b border-l border-r rounded-b-lg border-t-0 -mt-px transition-colors duration-500 ${
          activeIndex >= 5 && activeIndex < 6 ? 'border-[#00FF88] shadow-[0_0_10px_#00FF88]' : 'border-[#1E1E24]'
        }`} />
        <div className={getLineClass(activeIndex >= 5 && activeIndex < 6)} />

        {/* 6. Detection Engine */}
        <Node icon={Crosshair} title="Detection Engine" isActive={activeIndex === 6} />
        <div className={getLineClass(activeIndex >= 6 && activeIndex < 7)} />

        {/* 7. Risk Scoring */}
        <Node icon={Activity} title="Risk Scoring" isActive={activeIndex === 7} />
        <div className={getLineClass(activeIndex >= 7 && activeIndex < 8)} />

        {/* 8. Explainable Alert */}
        <Node icon={MessageSquareWarning} title="Explainable Alert" isActive={activeIndex === 8} />
        <div className={getLineClass(activeIndex >= 8 && activeIndex < 9)} />

        {/* 9. Security Dashboard */}
        <Node icon={LayoutDashboard} title="Security Dashboard" isActive={activeIndex === 9} />
        <div className={getLineClass(activeIndex >= 9 && activeIndex < 10)} />

        {/* 10. Feedback & Learning */}
        <Node icon={RefreshCcw} title="Feedback & Learning" isActive={activeIndex === 10} />
      </div>
    </div>
  );
}
