import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CascadeStep } from '../../types';

interface RippleTimelineProps {
  steps: CascadeStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectStep: (stepIndex: number) => void;
  onReset: () => void;
  playbackSpeed: number;
  onToggleSpeed: () => void;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export const RippleTimeline: React.FC<RippleTimelineProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  onTogglePlay,
  onSelectStep,
  onReset,
  playbackSpeed,
  onToggleSpeed,
  isCompact = false,
  onToggleCompact
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      onSelectStep(currentStepIndex - 1);
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      onSelectStep(currentStepIndex + 1);
    }
  };

  const milestoneLabels = [
    'Baseline',
    '1. Initial Failure',
    '2. Redistribution',
    '3. Secondary Stress',
    '4. Critical Access',
    '5. Summary'
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl text-xs select-none">
      {/* Top Bar: Timeline Title, Badges & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 font-mono text-xs font-bold border border-slate-700 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>T+{currentStep.timeOffsetMinutes} MIN</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {currentStep.title}
            </h3>
            
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-block ${
              currentStep.networkStressLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-600' :
              currentStep.networkStressLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-600' :
              currentStep.networkStressLevel === 'ELEVATED' ? 'bg-blue-950 text-blue-300 border-blue-600' :
              'bg-emerald-950 text-emerald-300 border-emerald-600'
            }`}>
              {currentStep.networkStressLevel}
            </span>
          </div>
        </div>

        {/* Playback Controls & Expand/Collapse Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleSpeed}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-300 border border-slate-700 transition"
            title="Toggle Playback Speed"
          >
            {playbackSpeed}x SPEED
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 transition"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset Cascade Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onToggleCompact && (
            <button
              onClick={onToggleCompact}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition ml-1"
              title={isCompact ? 'Expand Timeline Details' : 'Minimize Timeline'}
            >
              {isCompact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Line & Step Markers */}
      <div className="mt-3 relative">
        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          {milestoneLabels.map((label, idx) => {
            const isActive = currentStepIndex === idx;
            const isPast = currentStepIndex > idx;
            return (
              <button
                key={idx}
                onClick={() => onSelectStep(idx)}
                className={`flex flex-col items-center group transition text-center ${
                  isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  isActive 
                    ? 'bg-cyan-400 border-white ring-2 ring-cyan-500 shadow-md shadow-cyan-400/50' 
                    : isPast 
                    ? 'bg-cyan-600 border-slate-700' 
                    : 'bg-slate-800 border-slate-700'
                }`} />
                <span className={`text-[10px] font-mono mt-1 hidden md:inline ${
                  isActive ? 'text-white font-bold' : isPast ? 'text-cyan-300' : 'text-slate-500'
                }`}>
                  {label}
                </span>
                <span className={`text-[9px] font-mono mt-0.5 md:hidden ${
                  isActive ? 'text-white font-bold' : 'text-slate-500'
                }`}>
                  {idx}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EXPANDED DETAILS BODY (Hidden when isCompact is true) */}
      {!isCompact && (
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          {/* STEP 5: Final Summary Block */}
          {currentStepIndex === 5 && currentStep.summaryBlock && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CASCADING FAILURE SUMMARY</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Scenario-Based Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/80">
                  <div className="text-[10px] font-mono uppercase font-bold text-rose-400">INITIAL DISRUPTION:</div>
                  <p className="text-[11px] text-slate-200 mt-1 leading-snug font-medium">
                    {currentStep.summaryBlock.initialFailure}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/80">
                  <div className="text-[10px] font-mono uppercase font-bold text-amber-400">CASCADE EFFECT:</div>
                  <p className="text-[11px] text-slate-200 mt-1 leading-snug font-medium">
                    {currentStep.summaryBlock.cascadeEffect}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/80">
                  <div className="text-[10px] font-mono uppercase font-bold text-purple-400">CRITICAL IMPACT:</div>
                  <p className="text-[11px] text-slate-200 mt-1 leading-snug font-medium">
                    {currentStep.summaryBlock.criticalImpact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Critical Hospital Access Breakdown */}
          {currentStepIndex === 4 && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-bold text-purple-300">St. John’s Hospital Access Routes:</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-medium">
                  ❌ Severed: Silk Board Underpass
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-medium">
                  ⚠️ Severe Queue: ORR Agara & Madiwala
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-medium">
                  ✅ Viable Bypass: Electronic City Elevated Expressway
                </span>
              </div>
            </div>
          )}

          {/* Steps 0 - 3: Narrative summary */}
          {currentStepIndex < 4 && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs min-w-0">
                <p className="text-slate-200 leading-relaxed font-medium">
                  {currentStep.summary}
                </p>
                {currentStep.triggerEvent && (
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="text-cyan-400 font-semibold">Cascade Mechanism:</span> {currentStep.triggerEvent}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
