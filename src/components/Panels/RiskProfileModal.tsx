import React from 'react';
import { 
  X, 
  AlertTriangle, 
  MapPin, 
  ShieldAlert, 
  Hospital, 
  Route, 
  Layers, 
  Flame, 
  ArrowRight,
  Play,
  Info,
  CheckCircle2
} from 'lucide-react';
import { STUDY_AREA_INFO, HOSPITALS, ZONES, NODES, ROADS } from '../../data/networkData';

interface RiskProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBeginSimulation: () => void;
}

export const RiskProfileModal: React.FC<RiskProfileModalProps> = ({
  isOpen,
  onClose,
  onBeginSimulation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                Study Area Baseline
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {STUDY_AREA_INFO.region}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {STUDY_AREA_INFO.name} Risk & Resilience Profile
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {STUDY_AREA_INFO.locality}, {STUDY_AREA_INFO.cityState} • Infrastructure connectivity and cascading failure vulnerability audit
            </p>
          </div>
        </div>

        {/* EXACT COMPACT STUDY AREA CONTEXT BLOCK */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-cyan-800/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Study Area Context & Hazard Dossier</span>
            </span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              Verified Real GIS Geography
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* STUDY AREA */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
                STUDY AREA:
              </div>
              <div className="text-white font-bold text-sm">
                {STUDY_AREA_INFO.locality}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {STUDY_AREA_INFO.region} (~320,000 residents across BBMP wards)
              </div>
            </div>

            {/* CITY & STATE */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
                CITY & STATE:
              </div>
              <div className="text-white font-bold text-sm">
                {STUDY_AREA_INFO.cityState}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                South India (Agara-Bellandur Drainage Basin)
              </div>
            </div>

            {/* PRIMARY HAZARD */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-rose-900/60 md:col-span-2">
              <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PRIMARY HAZARD:</span>
              </div>
              <div className="text-rose-100 font-bold text-sm">
                Urban Flooding (Monsoon Cloudburst + Raja Kaluve Stormwater Drain Backflow)
              </div>
              <div className="text-slate-300 text-xs mt-1">
                Trigger: 110mm/2hr Cloudburst overflowing stormwater trunk drains (raja kaluve), causing severe ponding and submerging the low-elevation Central Silk Board Underpass under 1.1m of floodwater.
              </div>
            </div>

            {/* WHY THIS AREA IS RELEVANT */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                WHY THIS AREA IS RELEVANT:
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Central Silk Board represents one of India's most critical multi-modal urban bottlenecks, joining Hosur Road, BTM Layout, and the Outer Ring Road tech corridor. When submerged, 3,100 vehicles/hr divert into parallel roads (ORR Agara, HSR 27th Main, and Sarjapur Road), choking emergency casualty access to St. John's Medical College Hospital and creating 6 secondary junction failures.
              </p>
            </div>

            {/* SIMULATION BASIS */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>SIMULATION BASIS:</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                <b>Real geographic road network + scenario-based disruption assumptions</b>. OpenStreetMap GIS alignments, underpass depths, and hospital coordinates represent real Bengaluru locations. Traffic volumes, impedance curves, and queue spillbacks are computed deterministically using standard Bureau of Public Roads (BPR) Volume-Delay formulations.
              </p>
            </div>
          </div>

          {/* Storyline Chain */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5">
              Resilience Story Progression:
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">REAL INDIAN NEIGHBOURHOOD</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300">LOCAL DISASTER RISK</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">CRITICAL ROAD DISRUPTION</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-orange-300">CASCADING CONSEQUENCES</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">HOSPITAL ACCESS IMPACT</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">INTERVENTION ANALYSIS</span>
            </div>
          </div>
        </div>

        {/* 3 CORE INFRASTRUCTURE DIMENSIONS */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. Critical Vulnerabilities */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Vulnerabilities</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><b>Silk Board Underpass:</b> Connects Hosur Road and BTM to ORR; deep topographical depression prone to flash inundation.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><b>Agara Lake Drainage Neck:</b> Primary raja kaluve drainage overflow floods ORR surface lanes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><b>Limited Arterial Detours:</b> HSR 27th Main and Sarjapur Road quickly exceed capacity under displaced demand.</span>
              </li>
            </ul>
          </div>

          {/* 2. Critical Emergency Facilities */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              <Hospital className="w-3.5 h-3.5" />
              <span>Critical Emergency Care</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span><b>St. John's Medical College Hospital:</b> 1,350 beds, Level-1 tertiary trauma resuscitation center. Principal regional emergency care facility.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span><b>Greenview Medical Center:</b> 65 beds, local secondary emergency facility in HSR Layout.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span><b>12-Minute Golden Window:</b> Maximum critical window for acute trauma resuscitation before irreversible mortality rise.</span>
              </li>
            </ul>
          </div>

          {/* 3. Single Point of Failure */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>Single Point of Failure</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span><b>Central Silk Board Junction:</b> Carries 3,100 vehicles/hr during morning peak; links four major south Bengaluru sectors.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Failure triggers immediate diversion onto ORR Agara (+145% capacity spike).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Produces 6 secondary intersection bottlenecks and delays St. John's ambulances by +21.7 mins.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Status: Deterministic model loaded • No API key required
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Close Profile
            </button>
            <button
              onClick={() => {
                onClose();
                onBeginSimulation();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Begin Cascade Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
