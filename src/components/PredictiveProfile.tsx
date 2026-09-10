import { motion } from 'motion/react';
import { ShieldAlert, Crosshair, Cpu, Database, Activity, GitBranch } from 'lucide-react';
import AttackerPortfolio from './AttackerPortfolio';

interface PredictiveProfileProps {
  attackState: string;
  activeOwasp: string | null;
}

const TTP_DATA: Record<string, any> = {
  'Broken Access Control': {
    tactic: 'Privilege Escalation (TA0004)',
    technique: 'Insecure Direct Object Reference (T1116)',
    procedure: 'Modifying API parameters to access administrative endpoints or other users\' data.',
    nextStages: ['Data Exfiltration via C2', 'Complete Account Takeover'],
    mitigation: 'Implement strict RBAC and validate user authorization on every request.'
  },
  'Cryptographic Failures': {
    tactic: 'Credential Access (TA0006)',
    technique: 'Exploit Weak Cryptography (T1552)',
    procedure: 'Intercepting and decrypting sensitive data using outdated cipher suites.',
    nextStages: ['Harvesting Cleartext Credentials', 'Session Hijacking'],
    mitigation: 'Enforce TLS 1.3, use strong algorithms (AES-256), and implement perfect forward secrecy.'
  },
  'Injection (SQL/NoSQL)': {
    tactic: 'Execution (TA0002)',
    technique: 'SQL Injection (T1190)',
    procedure: 'Injecting malicious payloads (e.g., \' OR 1=1 --) into database queries to bypass logic.',
    nextStages: ['Bulk Database Dumping', 'Remote Code Execution (RCE) via xp_cmdshell'],
    mitigation: 'Use parameterized queries, ORM libraries, and input sanitization.'
  },
  'Insecure Design': {
    tactic: 'Initial Access (TA0001)',
    technique: 'Exploit Business Logic (T1190)',
    procedure: 'Chaining application features in unintended ways to bypass security controls.',
    nextStages: ['Administrative Access', 'Financial Fraud'],
    mitigation: 'Implement threat modeling and secure design principles during SDLC.'
  },
  'Security Misconfig': {
    tactic: 'Defense Evasion (TA0005)',
    technique: 'Exploit Misconfiguration (T1068)',
    procedure: 'Accessing default credentials, unprotected cloud storage, or exposed admin panels.',
    nextStages: ['Internal Network Discovery', 'Persistence via Scheduled Tasks'],
    mitigation: 'Harden system configurations, remove default accounts, and minimize attack surface.'
  },
  'SSRF': {
    tactic: 'Discovery (TA0007)',
    technique: 'Server-Side Request Forgery (T1190)',
    procedure: 'Forcing the application server to make HTTP requests to internal, non-routable IPs (e.g., 169.254.169.254).',
    nextStages: ['Cloud Metadata Extraction', 'Internal Port Scanning', 'Lateral Movement'],
    mitigation: 'Use allowlists for external URLs, disable unused URL schemas, and isolate the server.'
  }
};

export default function PredictiveProfile({ attackState, activeOwasp }: PredictiveProfileProps) {
  const isIdle = attackState === 'idle';
  
  // Try to match the activeOwasp to our TTP data. If not found or idle, show a placeholder.
  let profileData = null;
  if (!isIdle && activeOwasp) {
    const key = Object.keys(TTP_DATA).find(k => activeOwasp.includes(k));
    profileData = key ? TTP_DATA[key] : TTP_DATA['Broken Access Control']; // fallback
  }

  return (
    <div className="w-full h-full p-4 text-[#e4e4e7] flex flex-col gap-6 overflow-hidden">
      {profileData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 shrink-0 overflow-y-auto max-h-[50%]"
        >
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#00e5ff] flex items-center gap-2">
              <Crosshair className="w-3 h-3" />
              Targeted Vector: {activeOwasp}
            </h4>
            <span className="text-[9px] font-mono bg-[#ff4444]/20 text-[#ff4444] px-2 py-0.5 rounded-sm border border-[#ff4444]/30">
              HIGH CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-sm shadow-sm">
              <h5 className="text-[9px] uppercase tracking-widest text-[#a1a1aa] mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Tactic</h5>
              <p className="text-[11px] font-mono text-white">{profileData.tactic}</p>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-sm shadow-sm">
              <h5 className="text-[9px] uppercase tracking-widest text-[#a1a1aa] mb-1 flex items-center gap-1"><Database className="w-3 h-3" /> Technique</h5>
              <p className="text-[11px] font-mono text-white">{profileData.technique}</p>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-sm shadow-sm">
              <h5 className="text-[9px] uppercase tracking-widest text-[#a1a1aa] mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Procedure</h5>
              <p className="text-[11px] font-mono text-white">{profileData.procedure}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ffbb33]"></div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#ffbb33] mb-3 flex items-center gap-2">
                <GitBranch className="w-3 h-3" />
                Predicted Next Stages
              </h5>
              <ul className="space-y-2">
                {profileData.nextStages.map((stage: string, idx: number) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="text-[11px] font-mono text-[#e4e4e7] flex items-start gap-2"
                  >
                    <span className="text-[#ffbb33] mt-0.5">▹</span>
                    {stage}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00C851]"></div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#00C851] mb-3 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" />
                Agent Countermeasures
              </h5>
              <p className="text-[11px] font-mono text-[#a1a1aa] leading-relaxed">
                {profileData.mitigation}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Embedded Attacker Portfolio */}
      <AttackerPortfolio />
    </div>
  );
}
