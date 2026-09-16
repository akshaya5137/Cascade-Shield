import React from 'react';
import { 
  AlertOctagon, 
  HelpCircle, 
  Route, 
  Clock, 
  AlertTriangle, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { RippleImpactDetails } from '../../types';

interface RippleImpactScoreCardProps {
  details: RippleImpactDetails;
}

export const RippleImpactScoreCard: React.FC<RippleImpactScoreCardProps> = ({ details }) => {
  const getBadgeStyle = () => {
    switch (details.category) {
      case 'SEVERE':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-600/60',
          text: 'text-rose-300',
          glow: 'shadow-rose-950/50',
          indicator: 'bg-rose-500'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-600/60',
          text: 'text-amber-300',
          glow: 'shadow-amber-950/50',
          indicator: 'bg-amber-500'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-950/80',
          border: 'border-yellow-600/60',
          text: 'text-yellow-300',
          glow: 'shadow-yellow-950/50',
          indicator: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-600/60',
          text: 'text-emerald-300',
          glow: 'shadow-emerald-950/50',
          indicator: 'bg-emerald-500'
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Score Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Ripple Impact Score
            </h4>
            <div className="group relative cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-800 text-[11px] text-slate-300 rounded-lg shadow-xl border border-slate-700 z-50">
                Transparent multi-factor index combining network route pressure, secondary bottlenecks, critical trauma latency, and isolated population zones.
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Objective cascading vulnerability measurement
          </p>
        </div>

        {/* Category Pill */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border flex items-center gap-1.5 shadow-md ${badge.bg} ${badge.border} ${badge.text}`}>
          <span className={`w-2 h-2 rounded-full ${badge.indicator} animate-pulse`} />
          {details.category} RIPPLE IMPACT
        </div>
      </div>

      {/* Main Score Display & 4 Core Metric Factor Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mb-4">
        {/* Big Score Dial Tile */}
        <div className="md:col-span-2 flex items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div>
            <div className="text-4xl font-extrabold tracking-tight font-mono text-white flex items-baseline justify-center gap-1">
              <span>{details.score}</span>
              <span className="text-base text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Calculated Network Ripple Severity
            </div>
          </div>
        </div>

        {/* Factor Breakdown Grid */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
              <Route className="w-3 h-3 text-cyan-400" />
              <span>Affected Routes</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
              {details.affectedRoutesCount} <span className="text-xs text-slate-400 font-normal">/ {details.totalNetworkRoutesCount} links</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Secondary Bottlenecks</span>
            </div>
            <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
              {details.secondaryBottlenecksCount} <span className="text-xs text-slate-400 font-normal">junctions</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>Trauma Delay</span>
            </div>
            <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
              +{details.hospitalAccessLatencyIncreaseMinutes}m <span className="text-xs text-slate-400 font-normal">(+{details.averageTravelBurdenIncreasePercent}%)</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Zones In Breach</span>
            </div>
            <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
              {details.zonesExceedingEmergencyThreshold} <span className="text-xs text-slate-400 font-normal">/ {details.totalZonesCount} zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHY WAS THIS SCORE PRODUCED? (Explainable and Transparent) */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Why this score was produced (Transparent Causal Chain):</span>
        </h5>
        <ul className="space-y-1.5">
          {details.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
