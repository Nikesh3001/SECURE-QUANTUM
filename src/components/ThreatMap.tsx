
import { useState, useEffect, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

interface ThreatMapProps {
  attackState: 'idle' | 'detecting' | 'analyzing' | 'predicting' | 'defending' | 'tracing' | 'mitigated';
  maliciousIP: string;
  attackerInfo?: {
    locString: string;
    coordinates: { lat: number; lng: number };
  } | null;
  trueOrigin?: {
    locString: string;
    coordinates: { lat: number; lng: number };
    ip: string;
  } | null;
}

const LOCAL_SOC = { lat: 38.90, lng: -77.03, name: 'LOCAL EDGE [US-EAST]' }; // Washington DC

const OWASP_CATEGORIES = [
  "A01: Broken Access Control",
  "A02: Cryptographic Failures",
  "A03: Injection",
  "A04: Insecure Design",
  "A05: Security Misconfiguration",
  "A06: Vulnerable Components",
  "A07: Auth Failures",
  "A08: Data Integrity Failures",
  "A09: Logging Failures",
  "A10: SSRF"
];

const RANDOM_ORIGINS = [
  { lat: 51.5, lng: -0.1 }, // London
  { lat: 35.6, lng: 139.6 }, // Tokyo
  { lat: 1.3, lng: 103.8 }, // Singapore
  { lat: 19.0, lng: 72.8 }, // Mumbai
  { lat: -33.9, lng: 18.4 }, // Cape Town
  { lat: 48.8, lng: 2.3 }, // Paris
  { lat: 55.7, lng: 37.6 }, // Moscow
  { lat: -34.6, lng: -58.3 }, // Buenos Aires
  { lat: 37.7, lng: -122.4 }, // SF
];

type ArcData = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
};

export default function ThreatMap({ attackState, maliciousIP, attackerInfo, trueOrigin }: ThreatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [backgroundArcs, setBackgroundArcs] = useState<ArcData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const isAttacking = attackState !== 'idle' && attackState !== 'mitigated';
  const isTracing = attackState === 'tracing';

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Autoplay rotation and set initial camera safely
  useEffect(() => {
    if (globeRef.current) {
      try {
        const controls = typeof globeRef.current.controls === 'function' ? globeRef.current.controls() : null;
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1;
          controls.enableZoom = true;
        }
        if (typeof globeRef.current.pointOfView === 'function') {
          globeRef.current.pointOfView({ altitude: 2.8 });
        }
      } catch (e) {
        console.warn('Globe controls initialization deferred:', e);
      }
    }
  }, [dimensions.width, dimensions.height]); // Re-run when dimension is first set

  // Generate random background connections to simulate server requests (OWASP Top 10)
  useEffect(() => {
    const interval = setInterval(() => {
      if (backgroundArcs.length > 15) {
        setBackgroundArcs(prev => prev.slice(1));
      }
      
      const origin = RANDOM_ORIGINS[Math.floor(Math.random() * RANDOM_ORIGINS.length)];
      const owaspConcept = OWASP_CATEGORIES[Math.floor(Math.random() * OWASP_CATEGORIES.length)];
      
      const newArc: ArcData = {
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: LOCAL_SOC.lat,
        endLng: LOCAL_SOC.lng,
        color: '#4E4E5A', // subtle gray for normal traffic
        label: owaspConcept
      };

      setBackgroundArcs(prev => [...prev, newArc]);
    }, 400);

    return () => clearInterval(interval);
  }, [backgroundArcs]);

  // Combine background traffic with active threat trajectories
  const activeArcs = useMemo(() => {
    const arcs = [...backgroundArcs];
    
    if (isAttacking && attackerInfo) {
      arcs.push({
        startLat: attackerInfo.coordinates.lat,
        startLng: attackerInfo.coordinates.lng,
        endLat: LOCAL_SOC.lat,
        endLng: LOCAL_SOC.lng,
        color: '#ff4444',
        label: `PROXY: ${maliciousIP}`
      });
    }

    if (isTracing && trueOrigin && attackerInfo) {
      arcs.push({
        startLat: trueOrigin.coordinates.lat,
        startLng: trueOrigin.coordinates.lng,
        endLat: attackerInfo.coordinates.lat,
        endLng: attackerInfo.coordinates.lng,
        color: '#00e5ff',
        label: `TRUE IP: ${trueOrigin.ip}`
      });
    }

    return arcs;
  }, [backgroundArcs, isAttacking, attackerInfo, isTracing, trueOrigin, maliciousIP]);

  // Define points (markers) on the globe
  const pointsData = useMemo(() => {
    const points = [
      { lat: LOCAL_SOC.lat, lng: LOCAL_SOC.lng, size: 0.1, color: '#00C851', label: 'SOC' }
    ];

    if (isAttacking && attackerInfo) {
      points.push({ lat: attackerInfo.coordinates.lat, lng: attackerInfo.coordinates.lng, size: 0.15, color: '#ff4444', label: 'PROXY' });
    }

    if (isTracing && trueOrigin) {
      points.push({ lat: trueOrigin.coordinates.lat, lng: trueOrigin.coordinates.lng, size: 0.15, color: '#00e5ff', label: 'ORIGIN' });
    }

    return points;
  }, [isAttacking, attackerInfo, isTracing, trueOrigin]);

  const activeElements = useMemo(() => {
    const elements: any[] = [];
    // Arc labels
    activeArcs.slice(-5).forEach(arc => {
      elements.push({
        type: 'arc',
        lat: (arc as ArcData).startLat,
        lng: (arc as ArcData).startLng,
        color: (arc as ArcData).color,
        label: (arc as ArcData).label
      });
    });
    // Point pins
    pointsData.forEach(pt => {
      elements.push({
        type: 'pin',
        lat: pt.lat,
        lng: pt.lng,
        color: pt.color,
        label: pt.label
      });
    });
    return elements;
  }, [activeArcs, pointsData]);

  return (
    <div className="w-full h-full relative bg-[#09090b] rounded-sm border border-[#27272a] overflow-hidden flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">3D Global Threat Trajectory</h3>
        <div className="text-[9px] font-mono text-[#00e5ff] mt-1">OWASP VECTORS & LIVE TELEMETRY</div>
      </div>

      <div ref={containerRef} className="flex-1 w-full h-full cursor-move">
        {dimensions.width > 0 && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            backgroundColor="#09090b"
          arcsData={activeArcs}
          arcStartLat={d => (d as ArcData).startLat}
          arcStartLng={d => (d as ArcData).startLng}
          arcEndLat={d => (d as ArcData).endLat}
          arcEndLng={d => (d as ArcData).endLng}
          arcColor={d => (d as ArcData).color}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={isAttacking ? 1500 : 3000}
          arcStroke={d => (d as ArcData).color === '#ff4444' || (d as ArcData).color === '#00e5ff' ? 1.5 : 0.5}
          
          pointsData={pointsData}
          pointColor="color"
          pointAltitude="size"
          pointRadius={0.5}
          pointsMerge={true}

          ringsData={pointsData.filter(p => p.color === '#ff4444')}
          ringLat={(d: any) => d.lat}
          ringLng={(d: any) => d.lng}
          ringColor={(d: any) => d.color || '#ff4444'}
          ringMaxRadius={5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={700}
          
          htmlElementsData={activeElements}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            if (d.type === 'pin') {
              const isCritical = d.color === '#ff4444';
              el.innerHTML = `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  ${isCritical ? `<div class="absolute w-6 h-6 rounded-full bg-[#ff4444] animate-ping opacity-75"></div>` : ''}
                  <div class="w-2 h-2 rounded-full z-10" style="background-color: ${d.color}; box-shadow: 0 0 10px ${d.color}"></div>
                </div>
              `;
            } else {
              el.innerHTML = `<div class="bg-[#18181b] border ${d.color === '#ff4444' ? 'border-[#ff4444]' : d.color === '#00e5ff' ? 'border-[#00e5ff]' : 'border-[#27272a]'} px-1.5 py-0.5 rounded-sm shadow-lg pointer-events-none">
                <p class="text-[7px] font-mono whitespace-nowrap" style="color: ${d.color}">${d.label}</p>
              </div>`;
            }
            return el;
          }}
          htmlLat={(d: any) => d.lat}
          htmlLng={(d: any) => d.lng}
        />
        )}
      </div>
    </div>
  );
}
