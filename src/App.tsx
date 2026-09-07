import { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert,
  Activity, 
  Database,
  Terminal,
  Shield,
  Zap,
  Download,
  Network,
  Brain,
  Volume2,
  VolumeX,
  Crosshair,
  Lock,
  Filter
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ThreatMap from './components/ThreatMap';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import AgentCore, { AgentLog } from './components/AgentCore';
import ForensicsTimeline from './components/ForensicsTimeline';
import PatternRecognition from './components/PatternRecognition';
import PredictiveProfile from './components/PredictiveProfile';
import GlobalThreatFeed from './components/GlobalThreatFeed';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useBreachMode } from './hooks/useBreachMode';

// --- Mock Data & Helpers ---
const generateIP = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
const SERVICES = ['HTTPS', 'HTTP', 'DNS', 'SSH', 'FTP', 'SMTP'];
const STATUSES = ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'MEDIUM'];

type LogEntry = {
  id: string;
  time: string;
  ip: string;
  service: string;
  risk: number;
  status: string;
  isMalicious?: boolean;
};

type AttackerInfo = {
  ip: string;
  locString: string;
  asn: string;
  coordinates: { lat: number, lng: number };
};

const ATTACKER_PROFILES = [
  { locString: "St. Petersburg, RU (Simulated)", asn: "AS49453 Global Proxy Network", coords: { lat: 59.93, lng: 30.31 } },
  { locString: "Beijing, CN (Simulated)", asn: "AS4134 Chinanet", coords: { lat: 39.90, lng: 116.40 } },
  { locString: "São Paulo, BR (Simulated)", asn: "AS28573 Claro S.A.", coords: { lat: -23.55, lng: -46.63 } },
  { locString: "Frankfurt, DE (Simulated)", asn: "AS3320 DTAG", coords: { lat: 50.11, lng: 8.68 } },
  { locString: "Lagos, NG (Simulated)", asn: "AS37076 MTN", coords: { lat: 6.52, lng: 3.37 } },
  { locString: "Sydney, AU (Simulated)", asn: "AS1221 Telstra", coords: { lat: -33.86, lng: 151.20 } }
];

const ATTACK_VECTORS = [
  { name: 'Broken Access Control', value: 25 },
  { name: 'Cryptographic Failures', value: 20 },
  { name: 'Injection (SQL/NoSQL)', value: 20 },
  { name: 'Insecure Design', value: 15 },
  { name: 'Security Misconfig', value: 10 },
  { name: 'SSRF', value: 10 }
];
const VECTOR_COLORS = ['#00F5FF', '#F27D26', '#FF4E4E', '#8E8E9A', '#00C851', '#ffbb33'];

const getNowString = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0').substring(0,2)}`;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

let audioCtx: AudioContext | null = null;
const playAlertTone = () => {
  if (!window.AudioContext && !(window as any).webkitAudioContext) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- Dynamic States ---
  const [packetCount, setPacketCount] = useState(1204592);
  const [currentPps, setCurrentPps] = useState(4281);
  const [trafficLogs, setTrafficLogs] = useState<LogEntry[]>([]);
  const [anomalies, setAnomalies] = useState(3);
  const [globalRisk, setGlobalRisk] = useState(12);
  
  // Attack Simulation State
  const [attackState, setAttackState] = useState<'idle' | 'detecting' | 'analyzing' | 'predicting' | 'defending' | 'tracing' | 'mitigated'>('idle');
  const [maliciousIP, setMaliciousIP] = useState('');
  const [attackerInfo, setAttackerInfo] = useState<AttackerInfo | null>(null);
  const [trueOriginInfo, setTrueOriginInfo] = useState<AttackerInfo | null>(null);
  const [activeOwasp, setActiveOwasp] = useState<string | null>(null);
  
  // Agent State
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const isAudioEnabledRef = useRef(isAudioEnabled);
  const [bottomTab, setBottomTab] = useState<'flow' | 'profile'>('flow');
  const [trafficFilter, setTrafficFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

  // Trigger breach mode CSS filter when actively under attack
  useBreachMode(attackState !== 'idle' && attackState !== 'mitigated');

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  // Chart Data
  const [chartData, setChartData] = useState([
    { batch: 'T-60', rf: 85, qsvm: 87 },
    { batch: 'T-50', rf: 86, qsvm: 90 },
    { batch: 'T-40', rf: 84, qsvm: 92 },
    { batch: 'T-30', rf: 87, qsvm: 94 },
    { batch: 'T-20', rf: 85, qsvm: 95 },
    { batch: 'T-10', rf: 86, qsvm: 96 },
    { batch: 'NOW', rf: 85, qsvm: 96 },
  ]);

  const [latencyData, setLatencyData] = useState(
    Array.from({ length: 20 }, (_, i) => ({ time: i, rtt: 12 + Math.random() * 5 }))
  );
  const [coherenceTime, setCoherenceTime] = useState(150.4);

  // --- Traffic Generation Effect ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Update PPS randomly
      const ppsFluctuation = Math.floor(Math.random() * 500) - 250;
      setCurrentPps(prev => Math.max(1000, prev + ppsFluctuation));
      setPacketCount(prev => prev + Math.floor(currentPps / 2)); // simulate per-tick addition

      // Update Latency
      setLatencyData(prev => {
        const next = [...prev.slice(1)];
        let baseRtt = 12 + Math.random() * 5;
        if (attackState !== 'idle' && attackState !== 'mitigated') {
          baseRtt += Math.random() * 200 + 50; // Spike during attack
        }
        next.push({ time: Date.now(), rtt: Math.floor(baseRtt) });
        return next;
      });

      // Generate new log
      const isAttackActive = attackState === 'detecting' || attackState === 'analyzing';
      
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        time: getNowString(),
        ip: isAttackActive && Math.random() > 0.3 ? maliciousIP : generateIP(),
        service: isAttackActive && Math.random() > 0.3 ? 'TCP/UNKNOWN' : SERVICES[Math.floor(Math.random() * SERVICES.length)],
        risk: isAttackActive && Math.random() > 0.3 ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 5,
        status: isAttackActive && Math.random() > 0.3 ? 'CRITICAL' : STATUSES[Math.floor(Math.random() * STATUSES.length)],
        isMalicious: isAttackActive
      };

      setTrafficLogs(prev => [newLog, ...prev].slice(0, 7)); // Keep last 7

      if (attackState === 'idle' || attackState === 'mitigated') {
        setCoherenceTime(150 + Math.random() * 2); // stable
        setGlobalRisk(prev => {
          if (prev > 15) return prev - 2;
          return Math.floor(Math.random() * 5) + 10; // baseline 10-15
        });
        
        // Dynamically move the chart up and down to simulate live telemetry
        setChartData(prev => {
          const newRf = 80 + Math.floor(Math.random() * 8); // fluctuates 80-87
          const newQsvm = 85 + Math.floor(Math.random() * 8); // fluctuates 85-92
          
          return [
            ...prev.slice(1),
            { batch: 'NOW', rf: newRf, qsvm: newQsvm }
          ];
        });
      } else {
        setCoherenceTime(40 + Math.random() * 50); // oscillating during intensive computation
        setGlobalRisk(prev => Math.min(98, prev + 15)); // spike risk
      }

    }, 800);

    return () => clearInterval(interval);
  }, [currentPps, attackState, maliciousIP]);

  // --- Autonomous Agent Sequence ---
  const triggerAutonomousDefenseRef = useRef<(() => void) | undefined>(undefined);

  const triggerAutonomousDefense = async () => {
    if (attackState !== 'idle' && attackState !== 'mitigated') return;
    
    const profile = ATTACKER_PROFILES[Math.floor(Math.random() * ATTACKER_PROFILES.length)];
    // Choose a distinct profile for the true origin that isn't the proxy
    const trueProfiles = ATTACKER_PROFILES.filter(p => p.asn !== profile.asn);
    const trueProfile = trueProfiles[Math.floor(Math.random() * trueProfiles.length)];
    const vector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)].name;
    
    const proxyIP = generateIP();
    const originalIP = generateIP();
    
    setMaliciousIP(proxyIP);
    setActiveOwasp(vector);
    setAttackerInfo({
      ip: proxyIP,
      locString: profile.locString,
      asn: profile.asn,
      coordinates: profile.coords
    });
    setTrueOriginInfo(null);
    setAttackState('detecting');
    setAgentLogs([]);
    
    const addLog = (type: AgentLog['type'], text: string) => {
      setAgentLogs(prev => [...prev, { id: Date.now() + Math.random(), type, text }]);
    };

    // Stage 1: Detect
    if (isAudioEnabledRef.current) {
      playAlertTone();
    }
    addLog('observe', `Anomaly signature detected: Potential ${vector} attack payload from ${proxyIP}.`);
    setChartData(prev => [...prev.slice(1), { batch: 'NOW', rf: 45, qsvm: 98 }]);
    
    await sleep(2000);
    setAttackState('analyzing');
    addLog('think', `Analyzing execution path: Payload matching signature for OWASP category ${vector}.`);
    
    await sleep(2000);
    setAttackState('predicting');
    addLog('predict', `Predicting next trajectory based on ${vector}: 1. Privilege Escalation (85% prob) 2. Lateral Movement to AD (12% prob).`);
    
    await sleep(2500);
    setAttackState('defending');
    addLog('action', 'Deploying localized memory hot-patch and micro-segmenting the affected node.');
    
    await sleep(2500);
    addLog('success', 'Node isolated. Execution halted. Mitigating primary payload.');

    await sleep(1500);
    setAttackState('tracing');
    addLog('trace', `Attacker connection routed via VPN/Tor Proxy (${profile.asn}). Initiating timing correlation and traffic unmasking...`);
    
    await sleep(3000);
    setTrueOriginInfo({
      ip: originalIP,
      locString: trueProfile.locString,
      asn: trueProfile.asn,
      coordinates: trueProfile.coords
    });
    addLog('trace', `Bypassing proxy relays... True origin IP identified: ${originalIP} (${trueProfile.locString}).`);
    
    await sleep(2000);
    addLog('action', `Executing perimeter firewall block on original IP ${originalIP} and submitting to global threat intel.`);
    
    await sleep(2000);
    setAttackState('mitigated');
    addLog('success', 'Original threat actor neutralized. Network returned to stable state.');
    setAnomalies(prev => prev + 1);
    
    setChartData(prev => [...prev.slice(1), { batch: 'NOW', rf: 85, qsvm: 96 }]);

    await sleep(2000);
    const reportText = `🚨 INCIDENT POST-MORTEM REPORT 🚨

VULNERABILITY IDENTIFIED: 
OWASP ${vector} Incident

ATTACK VECTOR: 
Targeted payload via proxy (${proxyIP}).

AUTONOMOUS MITIGATION SEQUENCE:
1. Agent predicted Escalation (85% probability) based on exploit pattern.
2. Dynamic VLAN micro-segmentation deployed to block lateral movement.
3. Temporal correlation attack successfully bypassed attacker's VPN/Tor proxy.
4. True Origin Unmasked: ${originalIP} (${trueProfile.locString}).

STATUS: Perimeter secured. Original IP blacklisted.`;
    addLog('report', reportText);
  };

  useEffect(() => {
    triggerAutonomousDefenseRef.current = triggerAutonomousDefense;
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (attackState === 'idle' || attackState === 'mitigated') {
      const delay = Math.floor(Math.random() * 300000) + 300000; // Random delay between 5m and 10m
      timeout = setTimeout(() => {
        if (triggerAutonomousDefenseRef.current) {
          triggerAutonomousDefenseRef.current();
        }
      }, delay);
    }
    return () => clearTimeout(timeout);
  }, [attackState]);

  const downloadIncidentReport = () => {
    const incidentId = `INC-${Math.floor(Math.random() * 1000000)}`;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69);
    doc.text("INCIDENT POST-MORTEM REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Incident ID: ${incidentId}`, 14, 33);
    
    // Content 1
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("1. Threat Analysis", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Threat Type', 'Zero-Day APT'],
        ['Source IP', attackerInfo?.ip || maliciousIP || "185.15.22.104"],
        ['Target Protocol', 'TCP/UNKNOWN'],
        ['Risk Score', '98/100'],
        ['Model Confidence', '98.7%'],
        ['Status', attackState === 'mitigated' ? 'MITIGATED' : 'ACTIVE THREAT']
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    const finalY1 = (doc as any).lastAutoTable.finalY || 50;
    
    // Content 2
    doc.setFontSize(14);
    doc.text("2. Quantum Telemetry & Geo-Intelligence", 14, finalY1 + 15);
    
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['Attribute', 'Value']],
      body: [
        ['Location', attackerInfo?.locString || "St. Petersburg, RU (Simulated)"],
        ['ASN', attackerInfo?.asn || "AS49453 Global Proxy Network"],
        ['Classifier', 'Qiskit Aer SVM'],
        ['Kernel', 'Quantum Feature Map (ZZFeatureMap)'],
        ['Anomaly Sigma', '4.2']
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    const finalY2 = (doc as any).lastAutoTable.finalY || finalY1 + 20;
    
    // Content 3
    doc.setFontSize(14);
    doc.text("3. Autonomous Mitigation Sequence", 14, finalY2 + 15);
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    const mitigationText = [
      "1. Agent predicted Escalation (85% probability) based on exploit pattern.",
      "2. Dynamic VLAN micro-segmentation deployed to block lateral movement.",
      "3. Temporal correlation attack successfully bypassed attacker's VPN/Tor proxy.",
      `4. True Origin Unmasked: ${trueOrigin?.ip || '77.88.99.11'} (${trueOrigin?.locString || 'Unknown'})`,
      "STATUS: Perimeter secured. Original IP blacklisted."
    ];
    
    doc.text(mitigationText, 14, finalY2 + 22, { lineHeightFactor: 1.5 });
    
    doc.save(`incident_report_${incidentId}.pdf`);
  };

  const downloadLogsCSV = () => {
    const headers = ['Timestamp', 'Trace ID', 'Source IP', 'Protocol', 'Risk Score', 'Classification'];
    const csvRows = trafficLogs.map(log => 
      [log.time, `TX-${log.id}`, log.ip, log.service, log.risk, log.status].join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#e4e4e7] font-sans overflow-hidden select-none" style={{ backgroundColor: '#050505' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#27272a] flex flex-col bg-[#09090b] shadow-[4px_0_24px_rgba(0,0,0,0.8)] z-10">
        <div className="p-4 border-b border-[#27272a] bg-[#09090b]">
          <h1 className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_2px_rgba(0,229,255,0.8)]">Project: Q-IDS 5.0</h1>
          <p className="text-[10px] text-[#52525b] mt-1 font-mono">Autonomous Defense Sub-Routine</p>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#52525b] mb-2 font-bold">Active Modules</p>
            <ul className="space-y-2">
              <li className="flex items-center text-[11px] gap-2 text-[#00e5ff]"><span className="w-1 h-1 rounded-full bg-[#00e5ff] animate-pulse drop-shadow-[0_0_2px_rgba(0,229,255,1)]"></span> Predictive Engine</li>
              <li className="flex items-center text-[11px] gap-2 text-[#e4e4e7]"><span className="w-1 h-1 rounded-full bg-[#3f3f46]"></span> IP De-Anonymization</li>
              <li className="flex items-center text-[11px] gap-2 text-[#e4e4e7]"><span className="w-1 h-1 rounded-full bg-[#3f3f46]"></span> Temporal Correlation</li>
            </ul>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#52525b] mb-2 font-bold">SOC Controls</p>
            <div className="space-y-2">
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold tracking-widest text-[#09090b] bg-[#e4e4e7] rounded-sm uppercase">
                <Brain className="w-3 h-3 text-[#09090b]" />
                Defense Core Active
              </div>
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[9px] font-bold tracking-widest border rounded-sm transition-colors uppercase ${
                  isAudioEnabled 
                    ? 'border-[#00e5ff]/50 text-[#00e5ff] hover:bg-[#00e5ff]/10' 
                    : 'border-[#3f3f46] text-[#71717a] hover:bg-[#18181b]'
                }`}
              >
                {isAudioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                {isAudioEnabled ? 'Audio Alerts: ON' : 'Audio Alerts: OFF'}
              </button>
            </div>
          </div>
          <div>
             <p className="text-[9px] uppercase tracking-wider text-[#52525b] mb-2 font-bold">Navigation</p>
             <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-[11px] rounded-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#18181b] text-[#00e5ff] border-l-2 border-[#00e5ff]' : 'text-[#a1a1aa] hover:bg-[#18181b]'}`}
                >
                  <Activity className="w-3 h-3" />
                  <span className="uppercase tracking-widest font-bold">Live Overview</span>
                </button>
                <button 
                  onClick={() => setActiveTab('architecture')}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-[11px] rounded-sm transition-all ${activeTab === 'architecture' ? 'bg-[#18181b] text-[#00e5ff] border-l-2 border-[#00e5ff]' : 'text-[#a1a1aa] hover:bg-[#18181b]'}`}
                >
                  <Network className="w-3 h-3" />
                  <span className="uppercase tracking-widest font-bold">System Architecture</span>
                </button>
             </div>
          </div>
        </nav>
        <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[#71717a] uppercase">System Status</span>
            {attackState === 'idle' || attackState === 'mitigated' ? (
              <span className="text-[#00C851] flex items-center gap-1 font-bold"><span className="w-1.5 h-1.5 bg-[#00C851] rounded-full"></span>SECURE</span>
            ) : (
              <span className="text-[#ff4444] flex items-center gap-1 animate-pulse font-bold"><span className="w-1.5 h-1.5 bg-[#ff4444] rounded-full"></span>BREACH ATTEMPT</span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Red overlay during attack */}
        {(attackState === 'detecting' || attackState === 'analyzing') && (
          <div className="absolute inset-0 border-4 border-[#FF4E4E] pointer-events-none opacity-50 z-50 animate-pulse"></div>
        )}

        <header className="h-12 border-b border-[#1E1E24] flex items-center justify-between px-6 bg-[#0F0F12] shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4E4E5A] uppercase tracking-tighter">Active ML Model</span>
              <span className="text-[11px] font-mono">Qiskit Aer SVM (Quantum Kernel)</span>
            </div>
            <div className="h-6 w-px bg-[#1E1E24]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4E4E5A] uppercase tracking-tighter">Live Packet Flow</span>
              <span className="text-[11px] font-mono text-[#00F5FF]">{currentPps.toLocaleString()} pps</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className={`px-3 py-1 border rounded-sm text-[10px] flex items-center gap-2 ${attackState !== 'idle' && attackState !== 'mitigated' ? 'bg-[#ff4444]/10 border-[#ff4444] text-[#ff4444]' : 'bg-[#18181b] border-[#27272a] text-[#71717a]'}`}>
              <span className={`w-2 h-2 rounded-full ${attackState !== 'idle' && attackState !== 'mitigated' ? 'bg-[#ff4444] animate-ping' : 'bg-[#00C851] animate-pulse'}`}></span> 
              {attackState !== 'idle' && attackState !== 'mitigated' ? 'THREAT DETECTED' : 'AI MONITORING ACTIVE'}
            </div>
          </div>
        </header>

        {activeTab === 'architecture' ? (
          <ArchitectureDiagram />
        ) : (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <GlobalThreatFeed />
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className={`p-4 rounded-sm border transition-colors flex items-center justify-between ${globalRisk > 75 ? 'bg-[#ff4444]/10 border-[#ff4444]' : 'bg-[#09090b] border-[#27272a] shadow-[0_4px_12px_rgba(0,0,0,0.5)]'}`}>
              <div className="flex flex-col justify-between h-full">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] mb-2">Global Risk Score</p>
                <div className="flex items-center gap-2 mt-auto">
                  <ShieldAlert className={`w-4 h-4 ${globalRisk > 75 ? 'text-[#ff4444] animate-bounce' : 'text-[#00C851]'}`} />
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${globalRisk > 75 ? 'text-[#ff4444]' : 'text-[#00C851]'}`}>
                    {globalRisk > 75 ? 'CRITICAL' : 'NOMINAL'}
                  </span>
                </div>
              </div>
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path className="text-[#27272a]" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`transition-all duration-1000 ease-out ${globalRisk > 75 ? 'text-[#ff4444]' : globalRisk > 40 ? 'text-[#ffbb33]' : 'text-[#00C851]'}`} strokeWidth="3" strokeDasharray={`${globalRisk}, 100`} stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[12px] font-mono font-bold ${globalRisk > 75 ? 'text-[#ff4444]' : 'text-white'}`}>{globalRisk}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Packets Analyzed</p>
                  <h3 className="text-3xl font-mono font-bold text-white mt-2">{packetCount.toLocaleString()}</h3>
                </div>
                <Database className="w-5 h-5 text-[#00e5ff]" />
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Network Latency</p>
                  <h3 className={`text-3xl font-mono font-bold mt-2 ${latencyData[latencyData.length - 1]?.rtt > 100 ? 'text-[#ff4444]' : 'text-white'}`}>
                    {latencyData[latencyData.length - 1]?.rtt}<span className="text-[11px] text-[#52525b] font-normal">ms</span>
                  </h3>
                </div>
                <Activity className="w-5 h-5 text-[#71717a]" />
              </div>
              <div className="h-10 mt-2 -mx-2 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyData}>
                    <Line 
                      type="monotone" 
                      dataKey="rtt" 
                      stroke={latencyData[latencyData.length - 1]?.rtt > 100 ? '#ff4444' : '#71717a'} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Anomalies Mitigated</p>
                  <h3 className="text-3xl font-mono font-bold text-[#00C851] mt-2">{anomalies}</h3>
                </div>
                <Shield className="w-5 h-5 text-[#00C851]" />
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a]">AI Prediction Adv.</p>
                  <h3 className="text-lg font-mono font-bold text-[#ffbb33] mt-2 leading-tight">+22.4%<br/>Accuracy</h3>
                </div>
                <Zap className="w-5 h-5 text-[#ffbb33]" />
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a]">QKD Tunnel</p>
                  <h3 className={`text-xl md:text-2xl font-mono font-bold mt-2 ${attackState !== 'idle' && attackState !== 'mitigated' ? 'text-[#00e5ff]' : 'text-white'}`}>
                    {coherenceTime.toFixed(1)}<span className="text-[11px] text-[#52525b] font-normal">µs</span>
                  </h3>
                  <p className={`text-[9px] uppercase tracking-widest font-bold mt-1 ${attackState !== 'idle' && attackState !== 'mitigated' ? 'text-[#ffbb33] animate-pulse' : 'text-[#00C851]'}`}>
                    {attackState !== 'idle' && attackState !== 'mitigated' ? 'SYNCING...' : 'ENCRYPTED'}
                  </p>
                </div>
                <Lock className={`w-5 h-5 ${attackState !== 'idle' && attackState !== 'mitigated' ? 'text-[#ffbb33] animate-pulse' : 'text-[#00C851]'}`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
            {/* Left Column: Chart & Map */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Threat Map Section (Replaces Entropy Projection) */}
              <div className="flex-1 rounded-sm overflow-hidden relative border border-[#27272a] shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-[#09090b]">
                <ThreatMap 
                  attackState={attackState} 
                  maliciousIP={maliciousIP} 
                  attackerInfo={attackerInfo} 
                  trueOrigin={trueOriginInfo}
                />
              </div>

              {/* Pattern Recognition Section */}
              <PatternRecognition attackState={attackState} activeOwasp={activeOwasp} />

              {/* Lower Section: Attack Vectors Pie Chart */}
              <div className="flex-[0.8] flex gap-4 min-h-[220px]">
                {/* Attack Vectors Pie Chart */}
                <div className="flex-1 p-4 rounded-sm bg-[#09090b] border border-[#27272a] flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#71717a] mb-2">Recent Vectors</h3>
                  <div className="flex-1 w-full text-[10px] font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ATTACK_VECTORS}
                          cx="50%"
                          cy="45%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {ATTACK_VECTORS.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={VECTOR_COLORS[index % VECTOR_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '2px', fontSize: '10px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                        />
                        <Legend verticalAlign="bottom" height={20} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '9px', paddingTop: '10px', color: '#a1a1aa' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <ForensicsTimeline attackState={attackState} />
            </div>

            {/* Autonomous Cognitive Core */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <AgentCore 
                logs={agentLogs} 
                isActive={attackState !== 'idle' && attackState !== 'mitigated'} 
                onDownloadReport={downloadIncidentReport}
              />
            </div>
          </div>

          {/* Bottom Tabs Section */}
          <div className="rounded-sm bg-[#09090b] border border-[#27272a] overflow-hidden flex-1 flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="p-3 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] sticky top-0">
              <div className="flex gap-4">
                <button 
                  onClick={() => setBottomTab('flow')}
                  className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 pb-1 border-b-2 transition-colors ${bottomTab === 'flow' ? 'text-[#a1a1aa] border-[#00e5ff]' : 'text-[#52525b] border-transparent hover:text-[#71717a]'}`}
                >
                  <Terminal className="w-3 h-3" />
                  Live Network Flow Analyzer
                </button>
                <button 
                  onClick={() => setBottomTab('profile')}
                  className={`text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 pb-1 border-b-2 transition-colors ${bottomTab === 'profile' ? 'text-[#a1a1aa] border-[#00C851]' : 'text-[#52525b] border-transparent hover:text-[#71717a]'}`}
                >
                  <Crosshair className="w-3 h-3" />
                  Predictive Attacker Profile
                </button>
              </div>
              
              {bottomTab === 'flow' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#27272a] rounded-sm p-1 border border-[#3f3f46]">
                    <Filter className="w-3 h-3 text-[#a1a1aa]" />
                    <button 
                      onClick={() => setTrafficFilter('ALL')}
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm transition-colors ${trafficFilter === 'ALL' ? 'bg-[#3f3f46] text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setTrafficFilter('CRITICAL')}
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm transition-colors ${trafficFilter === 'CRITICAL' ? 'bg-[#ff4444]/20 text-[#ff4444] border border-[#ff4444]/30' : 'text-[#a1a1aa] hover:text-[#ff4444]'}`}
                    >
                      Critical
                    </button>
                  </div>
                  <button 
                    onClick={downloadLogsCSV}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#27272a] border border-[#3f3f46] text-[#e4e4e7] text-[9px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#3f3f46] transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {bottomTab === 'flow' ? (
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#27272a] text-[10px] text-[#71717a] uppercase tracking-widest font-bold bg-[#18181b] sticky top-0 z-10">
                        <th className="px-4 py-2 font-medium w-32">Timestamp</th>
                        <th className="px-4 py-2 font-medium w-24">Trace ID</th>
                        <th className="px-4 py-2 font-medium">Source Node</th>
                        <th className="px-4 py-2 font-medium w-24">Protocol</th>
                        <th className="px-4 py-2 font-medium w-24">Risk Score</th>
                        <th className="px-4 py-2 font-medium w-24">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-mono">
                      {trafficLogs.filter(log => trafficFilter === 'ALL' || log.status === 'CRITICAL').map((log) => (
                        <tr key={log.id} className={`border-b border-[#27272a] transition-colors ${log.isMalicious && log.risk > 75 ? 'bg-[#ff4444]/10' : 'hover:bg-[#18181b]'}`}>
                          <td className={`px-4 py-2 ${log.isMalicious ? 'text-[#ff4444]' : 'text-[#a1a1aa]'}`}>{log.time}</td>
                          <td className="px-4 py-2 text-[#71717a]">TX-{log.id}</td>
                          <td className={`px-4 py-2 ${log.isMalicious ? 'text-white font-bold' : 'text-[#a1a1aa]'}`}>{log.ip}</td>
                          <td className="px-4 py-2 text-[#00e5ff]">{log.service}</td>
                          <td className={`px-4 py-2 ${log.isMalicious && log.risk > 75 ? 'text-[#ff4444] font-bold' : 'text-white'}`}>{log.risk}</td>
                          <td className={`px-4 py-2 uppercase tracking-wider text-[9px] font-bold ${
                            log.status === 'CRITICAL' ? 'text-[#ff4444]' : 
                            log.status === 'MEDIUM' ? 'text-[#ffbb33]' : 'text-[#00C851]'
                          }`}>
                            {log.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <PredictiveProfile attackState={attackState} activeOwasp={activeOwasp} />
              )}
            </div>
          </div>
          
        </div>
        )}
      </main>
    </div>
  );
}

