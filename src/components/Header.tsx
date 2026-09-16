import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Hospital, 
  Wrench, 
  GitCompare, 
  Search, 
  PlayCircle,
  FileText,
  Network,
  Maximize2,
  Minimize2,
  Sparkles,
  MapPin,
  Database
} from 'lucide-react';
import { ActiveAppMode } from '../types';
import { checkAiStatus } from '../services/aiService';

interface HeaderProps {
  activeMode: ActiveAppMode;
  onModeChange: (mode: ActiveAppMode) => void;
  onOpenRiskProfile: () => void;
  onOpenDataProvenance?: () => void;
  onStartDemo: () => void;
  isDemoActive: boolean;
  networkStressLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  rippleScore: number;
  isFocusMap: boolean;
  onToggleFocusMap: () => void;
  isAnalysisDrawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onModeChange,
  onOpenRiskProfile,
  onOpenDataProvenance,
  onStartDemo,
  isDemoActive,
  networkStressLevel,
  rippleScore,
  isFocusMap,
  onToggleFocusMap,
  isAnalysisDrawerOpen
}) => {
  const [aiStatus, setAiStatus] = useState<{ isConfigured: boolean; model: string }>({
    isConfigured: true,
    model: 'gemini-3.8-flash'
  });

  useEffect(() => {
    checkAiStatus().then(status => {
      setAiStatus({
        isConfigured: Boolean(status?.configured),
        model: status?.model || 'gemini-3.8-flash'
      });
    }).catch(() => {
      setAiStatus({
        isConfigured: false,
        model: 'Deterministic Model'
      });
    });
  }, []);

  const getStressBadge = () => {
    switch (networkStressLevel) {
      case 'CRITICAL':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-600/60 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>CRITICAL CASCADE ({rippleScore})</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-600/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>HIGH STRAIN ({rippleScore})</span>
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/90 text-blue-300 border border-blue-600/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>ELEVATED ({rippleScore})</span>
          </span>
        );
      default:
        return (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NETWORK STABLE ({rippleScore})</span>
          </span>
        );
    }
  };

  const navItems: { mode: ActiveAppMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'CASCADE_SIMULATION', label: 'Cascade Simulator', icon: <Activity className="w-4 h-4" /> },
    { mode: 'MULTI_CORRIDOR_ANALYSIS', label: 'Multi-Corridor', icon: <Network className="w-4 h-4" /> },
    { mode: 'HOSPITAL_ACCESS', label: 'Hospital Access', icon: <Hospital className="w-4 h-4" /> },
    { mode: 'INTERVENTION_PLANNER', label: 'Interventions', icon: <Wrench className="w-4 h-4" /> },
    { mode: 'BEFORE_AFTER_COMPARISON', label: 'Before vs After', icon: <GitCompare className="w-4 h-4" /> },
    { mode: 'PROACTIVE_STRESS_TEST', label: 'Stress-Test', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none backdrop-blur-md">
      {/* Brand & Study Area Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              CASCADE SHIELD
            </h1>
            <button
              onClick={onOpenRiskProfile}
              className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold transition"
              title="Click to view Bengaluru study area hazard dossier"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Silk Board & HSR (Bengaluru)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide truncate hidden sm:block">
            See the ripple before the next failure happens
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs (Dismissible / Toggleable) */}
      <nav className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto max-w-[50vw]">
        {navItems.map(item => {
          const isActive = activeMode === item.mode && isAnalysisDrawerOpen && !isFocusMap;
          return (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700 ring-1 ring-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={`${item.label} (Click to open or close drawer)`}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 lg:hidden" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-2">
        {/* Safe AI Engine Status Badge */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
          title={`AI Explanation Engine grounded via backend: ${aiStatus.isConfigured ? 'Connected (' + aiStatus.model + ')' : 'Deterministic Fallback Mode'}`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">AI Engine:</span>
          <span className="flex items-center gap-1 font-bold text-cyan-400">
            <span className={`w-1.5 h-1.5 rounded-full ${aiStatus.isConfigured ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            {aiStatus.isConfigured ? 'Connected' : 'Fallback'}
          </span>
        </div>

        {getStressBadge()}

        {/* FOCUS MAP MODE TOGGLE BUTTON */}
        <button
          id="toggle-focus-map-btn"
          onClick={onToggleFocusMap}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-sm border ${
            isFocusMap
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-cyan-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title={isFocusMap ? 'Exit Focus Map (Show panels)' : 'Focus Map (Maximize map workspace)'}
        >
          {isFocusMap ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="font-bold">Exit Focus Map</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus Map</span>
            </>
          )}
        </button>

        {/* Risk Profile Dossier Modal Trigger */}
        <button
          onClick={onOpenRiskProfile}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          title="Inspect Bengaluru Hazard & Vulnerability Dossier"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Risk Profile</span>
        </button>

        {/* Data Provenance & Assumptions Modal Trigger */}
        {onOpenDataProvenance && (
          <button
            id="open-data-provenance-btn"
            onClick={onOpenDataProvenance}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Inspect Data Provenance (GIS, Assumptions, Simulation Truth, Gemini)"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Provenance</span>
          </button>
        )}

        {/* Guided Demo Story */}
        <button
          onClick={onStartDemo}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-sm ${
            isDemoActive
              ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400'
          }`}
          title="Launch Guided 14-Step Hackathon Walkthrough"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isDemoActive ? 'Demo Active' : 'Guided Demo'}</span>
        </button>
      </div>
    </header>
  );
};
