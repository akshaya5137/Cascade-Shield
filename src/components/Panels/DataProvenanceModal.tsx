import React from 'react';
import { 
  X, 
  Database, 
  Layers, 
  Cpu, 
  Sparkles, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  FileText,
  ExternalLink
} from 'lucide-react';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Data Provenance & System Architecture</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Audit Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparent disclosure of GIS baselines, scenario assumptions, deterministic simulation models, and AI synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 4 Distinct Layers */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Layer 1: Real / Open GIS Data */}
          <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Real / Open GIS Baseline Data</span>
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                OpenStreetMap / GIS
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Spatial network geometry and coordinates are derived from <b>OpenStreetMap (OSM)</b> for Bengaluru’s Central Silk Board and HSR Layout study area.
            </p>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Arterial Network:</span> Central Silk Board Underpass, Outer Ring Road (Agara Corridor), Hosur Road Surface, Electronic City Expressway viaduct.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Emergency Anchor:</span> St. John’s Medical College Hospital Emergency Resuscitation Gate (12.9348°N, 77.6200°E).
              </div>
            </div>
          </div>

          {/* Layer 2: Scenario Assumptions */}
          <div className="bg-slate-950/80 border border-amber-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Scenario Assumptions & Inputs</span>
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                Scenario Assumption
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Calibrated baseline parameters representing a peak morning rush-hour monsoon flood event.
            </p>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Hazard Trigger:</span> 110mm cloudburst causing Raja Kaluve stormwater overflow and 1.1m underpass ponding.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Traffic Demands:</span> Baseline volumes (3,100 vph at Silk Board) and link design capacities.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Prototype Health Values:</span> 12-minute trauma golden hour benchmark, 24 trauma bays, 850 inpatient beds.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Catchment Population:</span> ~184,500 residents across HSR Layout, Koramangala, BTM, and Bommanahalli.
              </div>
            </div>
          </div>

          {/* Layer 3: Deterministic Simulation Output */}
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Deterministic Simulation Engine</span>
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                Deterministic Engine (Truth)
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              All quantitative metrics are calculated via mathematical graph algorithms without stochastic hallucination or LLM arithmetic.
            </p>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Congestion Delay Model:</span> Federal Highway Administration Bureau of Public Roads (BPR) Volume-Delay functions.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Redistribution Graph:</span> Diverted traffic apportionment onto alternative corridors based on spare capacity.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Ripple Impact Score:</span> Deterministic composite index (0–100) weighting severed links, bottlenecks, and trauma delays.
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-slate-200">Bottlenecks:</span> Junctions where converging diverted volumes exceed capacity (V/C &gt; 1.0).
              </div>
            </div>
          </div>

          {/* Layer 4: Gemini AI Decision-Support Layer */}
          <div className="bg-slate-950/80 border border-purple-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>4. AI Decision-Support Synthesis</span>
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                Gemini 3.8 Flash (Server-Side)
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Google Gemini generates natural language strategic appraisals explaining the computed physical mechanisms, trade-offs, and operational priorities.
            </p>
            <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <b className="text-purple-300">Strict Non-Hallucination Guardrail:</b> Gemini never calculates simulation metrics or invents numbers. Every metric cited in an explanation is directly injected from the deterministic simulation state. If the API key is absent or unreachable, the system automatically falls back to deterministic engineering briefs without loss of functionality.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            CASCADE SHIELD • Bengaluru Central Silk Board Resilience Study
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
