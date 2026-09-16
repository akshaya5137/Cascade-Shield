import React, { useState } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  Hospital, 
  Wrench, 
  FileText 
} from 'lucide-react';
import { STUDY_AREA_INFO } from '../../data/networkData';

interface StudyAreaContextBarProps {
  onOpenRiskProfile: () => void;
  onNavigateToHospitalAccess?: () => void;
  onNavigateToInterventions?: () => void;
}

export const StudyAreaContextBar: React.FC<StudyAreaContextBarProps> = ({ 
  onOpenRiskProfile,
  onNavigateToHospitalAccess,
  onNavigateToInterventions 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const storySteps = [
    { label: 'Real Indian Neighbourhood', detail: 'Central Silk Board & HSR, Bengaluru' },
    { label: 'Local Disaster Risk', detail: '110mm Cloudburst + Raja Kaluve Overflow' },
    { label: 'Critical Road Disruption', detail: 'Silk Board Underpass Submerged (1.1m)' },
    { label: 'Cascading Network Consequences', detail: 'ORR Agara & HSR 27th Main Saturation' },
    { label: 'Hospital Access Impact', detail: 'St. John’s Trauma Delay 6.8m → 28.5m' },
    { label: 'Intervention Analysis', detail: 'Stormwater Sump & Elevated Viaduct Lane' }
  ];

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 text-xs select-none shadow-sm z-20 shrink-0">
      {/* Top Compact Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {/* Label Badge */}
          <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider">
            Study Area Context
          </span>

          {/* 1. Study Area */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 font-mono text-[10px] font-bold">STUDY AREA:</span>
            <span className="text-slate-100 font-semibold truncate">
              {STUDY_AREA_INFO.locality}
            </span>
          </div>

          {/* 2. City & State */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-slate-400 font-mono text-[10px] font-bold">CITY & STATE:</span>
            <span className="text-slate-100 font-semibold truncate">
              {STUDY_AREA_INFO.cityState}
            </span>
          </div>

          {/* 3. Primary Hazard */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-rose-900/60 text-slate-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-slate-400 font-mono text-[10px] font-bold">PRIMARY HAZARD:</span>
            <span className="text-rose-200 font-semibold truncate">
              Urban Flooding (Monsoon Cloudburst & Drain Overflow)
            </span>
          </div>

          {/* 4. Simulation Basis Pill */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-900/50 text-slate-300">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-mono text-[10px] font-bold">SIMULATION BASIS:</span>
            <span className="text-slate-200 truncate">
              Real GIS Network + Scenario-Based Assumptions
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
              isExpanded 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800' 
                : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExpanded ? 'Collapse Context Section' : 'Study Area & Story Context'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenRiskProfile}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Dossier</span>
          </button>
        </div>
      </div>

      {/* Structured "Study Area Context" Detailed Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 animate-fade-in space-y-3">
          {/* Main 5-Field Structured Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Field 1: STUDY AREA */}
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>STUDY AREA:</span>
                </div>
                <div className="text-slate-100 font-bold text-xs">
                  {STUDY_AREA_INFO.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {STUDY_AREA_INFO.region} (~320k residents)
                </div>
              </div>
            </div>

            {/* Field 2: CITY & STATE */}
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  CITY & STATE:
                </div>
                <div className="text-slate-100 font-bold text-xs">
                  {STUDY_AREA_INFO.cityState}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  South India (Agara-Bellandur Lake Catchment Basin)
                </div>
              </div>
            </div>

            {/* Field 3: PRIMARY HAZARD */}
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-rose-900/60 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>PRIMARY HAZARD:</span>
                </div>
                <div className="text-rose-100 font-bold text-xs">
                  Urban Flooding
                </div>
                <div className="text-[11px] text-rose-300/80 mt-0.5">
                  110mm/2hr Cloudburst & Stormwater Drain Backflow
                </div>
              </div>
            </div>

            {/* Field 4: WHY THIS AREA IS RELEVANT */}
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 md:col-span-2 lg:col-span-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
                WHY THIS AREA IS RELEVANT:
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Central Silk Board and Outer Ring Road form Bengaluru’s primary tech corridor nexus. Flooding submerges the low underpass, isolating HSR Layout and BTM, and choking emergency trauma access to St. John’s Hospital.
              </p>
            </div>

            {/* Field 5: SIMULATION BASIS */}
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 md:col-span-2 lg:col-span-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>SIMULATION BASIS:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Real geographic road network (OpenStreetMap GIS) + scenario-based disruption assumptions (deterministic BPR Volume-Delay functions).
              </p>
            </div>
          </div>

          {/* Narrative Chain */}
          <div className="bg-slate-950/95 p-3 rounded-xl border border-cyan-900/50">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
              CASCADE SHIELD Hackathon Problem Storyline:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
              {storySteps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <span className="text-[9px] font-mono text-cyan-400/80 font-bold mb-0.5">
                    STEP {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-slate-100 leading-tight">
                    {step.label}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 leading-snug">
                    {step.detail}
                  </span>
                  {idx < storySteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-cyan-500/60">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
