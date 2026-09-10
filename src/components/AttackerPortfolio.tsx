import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Crosshair, Activity, History, UserX, ArrowLeft, Terminal } from 'lucide-react';

const PAST_PROFILES = [
  { ip: '***.***.14.92', threatActor: 'Lazarus Group (APT38)', vector: 'Zero-Day Exploit', confidence: '98%', status: 'Eradicated', overview: 'North Korean state-sponsored hacking syndicate responsible for the Sony Pictures breach and the global WannaCry ransomware epidemic.' },
  { ip: '***.***.210.5', threatActor: 'Lapsus$', vector: 'Social Engineering', confidence: '92%', status: 'Blocked', overview: 'International extortion group known for breaching major tech companies via sophisticated SIM-swapping, MFA fatigue, and bribing insiders.' },
  { ip: '***.***.88.11', threatActor: 'Sandworm Team', vector: 'Supply Chain Compromise', confidence: '89%', status: 'Monitored', overview: 'Elite Russian GRU cyberwarfare unit responsible for the devastating NotPetya malware and attacks on the Ukrainian power grid.' },
  { ip: '***.***.112.44', threatActor: 'Equation Group', vector: 'Cryptographic Failures', confidence: '95%', status: 'Isolated', overview: 'Highly sophisticated threat actor utilizing advanced zero-day exploits and complex firmware implants, widely believed to be tied to the NSA.' },
  { ip: '***.***.55.10', threatActor: 'DarkSide', vector: 'Ransomware Payload', confidence: '87%', status: 'Terminated', overview: 'Ransomware-as-a-Service (RaaS) group notorious for the Colonial Pipeline cyberattack which disrupted fuel supplies across the US East Coast.' },
  { ip: '***.***.19.200', threatActor: 'Scattered Spider', vector: 'Credential Stuffing', confidence: '91%', status: 'Blocked', overview: 'Financially motivated threat group specializing in aggressive social engineering and help-desk vishing to compromise major casino resorts.' },
  { ip: '***.***.77.31', threatActor: 'Fancy Bear (APT28)', vector: 'Spear-Phishing', confidence: '99%', status: 'Blackholed', overview: 'Russian military intelligence cyber group involved in high-profile political interference campaigns, including the 2016 DNC email leaks.' },
  { ip: '***.***.205.99', threatActor: 'Magecart', vector: 'Insecure Design', confidence: '84%', status: 'Isolated', overview: 'Umbrella term for various syndicates specializing in injecting digital credit card skimmers into e-commerce checkout pages.' },
  { ip: '***.***.100.10', threatActor: 'Anonymous', vector: 'DDoS / Injection', confidence: '93%', status: 'Monitored', overview: 'Decentralized international hacktivist collective known for coordinating massive Distributed Denial of Service (DDoS) operations and public data leaks.' },
  { ip: '***.***.64.2', threatActor: 'FIN7', vector: 'Broken Access Control', confidence: '96%', status: 'Eradicated', overview: 'Prolific financially motivated cybercrime group targeting the retail, restaurant, and hospitality sectors using tailored spear-phishing.' },
  { ip: '***.***.33.17', threatActor: 'REvil (Sodinokibi)', vector: 'Security Misconfig', confidence: '88%', status: 'Blocked', overview: 'Major ransomware cartel responsible for the massive Kaseya VSA supply chain attack, extorting millions from managed service providers.' },
  { ip: '***.***.21.8', threatActor: 'LockBit', vector: 'Ransomware Payload', confidence: '81%', status: 'Terminated', overview: 'One of the most active Ransomware-as-a-Service operators globally, utilizing fast encryption tools and a double-extortion blog.' },
  { ip: '***.***.144.52', threatActor: 'Gothic Panda (APT3)', vector: 'Data Exfiltration', confidence: '94%', status: 'Isolated', overview: 'Chinese state-sponsored espionage group focused on exfiltrating intellectual property and aerospace secrets via persistent network backdoors.' },
  { ip: '***.***.9.112', threatActor: 'Syrian Electronic Army', vector: 'Social Engineering', confidence: '99%', status: 'Blackholed', overview: 'Hacktivist group that executed high-profile takeovers of Western media organizations\' Twitter accounts and websites via phishing.' },
  { ip: '***.***.178.4', threatActor: 'Kevin Mitnick (Condor)', vector: 'Social Engineering', confidence: '90%', status: 'Eradicated', overview: 'Iconic 1990s hacker who famously compromised Pacific Bell, Motorola, and Sun Microsystems using pioneering social engineering techniques.' }
];

export default function AttackerPortfolio() {
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  return (
    <div className="flex-1 flex flex-col relative w-full h-full min-h-[250px]">
      <AnimatePresence mode="wait">
        {selectedProfile ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col bg-[#09090b] z-10 overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center gap-3 border-b border-[#27272a] pb-4 mb-4 shrink-0">
              <button 
                onClick={() => setSelectedProfile(null)}
                className="p-1 hover:bg-[#27272a] rounded transition-colors text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-[14px] font-bold font-mono tracking-wider flex items-center gap-2 text-white">
                  <UserX className="w-4 h-4 text-[#ff4444]" />
                  {selectedProfile.ip}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#00e5ff] mt-1">{selectedProfile.threatActor}</p>
              </div>
              <div className="ml-auto">
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm border ${
                  selectedProfile.status === 'Blocked' ? 'text-[#ffbb33] border-[#ffbb33]/30 bg-[#ffbb33]/10' :
                  selectedProfile.status === 'Isolated' ? 'text-[#00e5ff] border-[#00e5ff]/30 bg-[#00e5ff]/10' :
                  selectedProfile.status === 'Terminated' ? 'text-[#ff4444] border-[#ff4444]/30 bg-[#ff4444]/10' :
                  selectedProfile.status === 'Blackholed' ? 'text-[#a1a1aa] border-[#a1a1aa]/30 bg-[#27272a]' :
                  selectedProfile.status === 'Eradicated' ? 'text-[#00C851] border-[#00C851]/30 bg-[#00C851]/10' :
                  'text-[#e4e4e7] border-[#3f3f46] bg-[#27272a]'
                }`}>
                  {selectedProfile.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
              <div className="bg-[#18181b] p-3 rounded-sm border border-[#27272a]">
                <p className="text-[9px] uppercase tracking-widest text-[#a1a1aa] mb-1">Target Vector</p>
                <p className="text-[11px] font-mono font-bold text-white flex items-center gap-2">
                  <Crosshair className="w-3 h-3 text-[#ffbb33]" />
                  {selectedProfile.vector}
                </p>
              </div>
              <div className="bg-[#18181b] p-3 rounded-sm border border-[#27272a]">
                <p className="text-[9px] uppercase tracking-widest text-[#a1a1aa] mb-1">AI Confidence</p>
                <p className="text-[11px] font-mono font-bold text-[#00C851] flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  {selectedProfile.confidence}
                </p>
              </div>
            </div>

            <div className="bg-[#18181b] p-4 rounded-sm border border-[#27272a] mb-6 shrink-0">
              <h4 className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" />
                Attacker Overview
              </h4>
              <p className="text-[11px] font-mono text-[#a1a1aa] leading-relaxed">
                {selectedProfile.overview}
              </p>
            </div>

            <div className="space-y-4 shrink-0">
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-sm">
                <h4 className="text-[10px] uppercase tracking-widest text-[#71717a] mb-3 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  Forensic Trace Analysis
                </h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="flex gap-3">
                    <span className="text-[#a1a1aa]">00:00:00</span>
                    <span className="text-[#00e5ff]">INIT</span>
                    <span className="text-[#e4e4e7]">Inbound connection established from {selectedProfile.ip}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#a1a1aa]">00:00:04</span>
                    <span className="text-[#ffbb33]">SCAN</span>
                    <span className="text-[#e4e4e7]">Reconnaissance detected on ports 80, 443, 8080</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#a1a1aa]">00:00:12</span>
                    <span className="text-[#ff4444]">EXEC</span>
                    <span className="text-[#e4e4e7]">Payload injection attempt: {selectedProfile.vector}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#a1a1aa]">00:00:15</span>
                    <span className="text-[#00C851]">MITG</span>
                    <span className="text-[#e4e4e7]">Automated mitigation deployed. Status: {selectedProfile.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col absolute inset-0"
          >
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-4 shrink-0">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#71717a] flex items-center gap-2">
                <History className="w-3 h-3" />
                Historical Predictive Profiles
              </h4>
              <span className="text-[9px] font-mono text-[#52525b]">
                {PAST_PROFILES.length} RECORDS FOUND
              </span>
            </div>
            
            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {PAST_PROFILES.map((profile, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProfile(profile)}
                  className="bg-[#18181b] border border-[#27272a] rounded-sm p-3 flex items-center justify-between hover:border-[#3f3f46] hover:bg-[#27272a]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#27272a] group-hover:bg-[#3f3f46] flex items-center justify-center shrink-0 transition-colors">
                      <UserX className="w-4 h-4 text-[#a1a1aa] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-white font-bold">{profile.ip}</span>
                        <span className="text-[9px] uppercase tracking-widest text-[#00e5ff] border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-1.5 py-0.5 rounded-sm">
                          {profile.threatActor}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#a1a1aa] mt-1 flex items-center gap-2">
                        <span>Vector: <span className="text-[#e4e4e7]">{profile.vector}</span></span>
                        <span className="text-[#52525b]">|</span>
                        <span>Confidence: <span className="text-[#ffbb33]">{profile.confidence}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm border ${
                      profile.status === 'Blocked' ? 'text-[#ffbb33] border-[#ffbb33]/30 bg-[#ffbb33]/10' :
                      profile.status === 'Isolated' ? 'text-[#00e5ff] border-[#00e5ff]/30 bg-[#00e5ff]/10' :
                      profile.status === 'Terminated' ? 'text-[#ff4444] border-[#ff4444]/30 bg-[#ff4444]/10' :
                      profile.status === 'Blackholed' ? 'text-[#a1a1aa] border-[#a1a1aa]/30 bg-[#27272a]' :
                      profile.status === 'Eradicated' ? 'text-[#00C851] border-[#00C851]/30 bg-[#00C851]/10' :
                      'text-[#e4e4e7] border-[#3f3f46] bg-[#27272a]'
                    }`}>
                      {profile.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
