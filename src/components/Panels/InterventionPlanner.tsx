import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Minus, 
  ArrowRight, 
  TrendingDown, 
  LayoutGrid, 
  Table, 
  Filter, 
  Award, 
  RefreshCw,
  GitCompare,
  Route,
  Target
} from 'lucide-react';
import { InterventionOption, InterventionType } from '../../types';
import { INTERVENTIONS, ROADS } from '../../data/networkData';
import { getRecommendedIntervention } from '../../engine/simulationEngine';
import { fetchInterventionComparison } from '../../services/aiService';

interface InterventionPlannerProps {
  activeInterventionIds: string[];
  onToggleIntervention: (interventionId: string) => void;
  maxBudgetUnits?: number;
  onSetMaxBudgetUnits?: (units: number) => void;
  currentRippleScore: number;
  selectedAssetId?: string | null;
  onSelectAsset?: (assetId: string | null) => void;
  onNavigateToComparison?: () => void;
}

export const InterventionPlanner: React.FC<InterventionPlannerProps> = ({
  activeInterventionIds,
  onToggleIntervention,
  maxBudgetUnits = 3,
  onSetMaxBudgetUnits,
  currentRippleScore,
  selectedAssetId,
  onSelectAsset,
  onNavigateToComparison
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>(selectedAssetId || 'ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'MATRIX'>('CARDS');
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Sync internal filter if selectedAssetId prop changes
  useEffect(() => {
    if (selectedAssetId) {
      setAssetFilter(selectedAssetId);
    }
  }, [selectedAssetId]);

  // Calculate budget used
  const activeInterventions = INTERVENTIONS.filter(int => activeInterventionIds.includes(int.id));
  const totalCostUsed = activeInterventions.reduce((sum, int) => sum + int.costUnits, 0);
  const remainingBudget = Math.max(0, maxBudgetUnits - totalCostUsed);

  // Top Recommendation with transparent explainable reason
  const { recommended, reason } = getRecommendedIntervention(
    remainingBudget,
    activeInterventionIds
  );

  // Load AI strategic comparison from server
  const loadAiComparison = async () => {
    setIsAiLoading(true);
    const fallbackText = activeInterventions.length === 0
      ? `No interventions deployed. Network Ripple Impact Score remains unmitigated at ${currentRippleScore}/100. Deploying targeted dewatering or dynamic bypass gates provides the highest ripple reduction per resource unit.`
      : `Deploying ${activeInterventions.map(i => i.name).join(', ')} uses ${totalCostUsed}/${maxBudgetUnits} resource units. This targets ${activeInterventions.map(i => i.targetRoadIds.join(', ')).join(' & ')} to arrest queue spillover, reducing overall ripple pressure while reserving ${remainingBudget} units for secondary hotspot relief.`;

    const res = await fetchInterventionComparison({
      activeInterventions,
      availableBudget: maxBudgetUnits,
      remainingBudget,
      currentRippleScore,
      fallbackText
    });

    setAiExplanation(res.explanation);
    setIsAiGenerated(res.isAiGenerated);
    setIsAiLoading(false);
  };

  useEffect(() => {
    loadAiComparison();
  }, [activeInterventionIds.length, maxBudgetUnits, currentRippleScore]);

  // Filter interventions by type and asset
  const filteredInterventions = INTERVENTIONS.filter(int => {
    const matchesCategory = selectedCategory === 'ALL' || int.interventionType === selectedCategory;
    const matchesAsset = assetFilter === 'ALL' || int.targetRoadIds.includes(assetFilter);
    return matchesCategory && matchesAsset;
  });

  const getInterventionBadge = (type?: InterventionType) => {
    switch (type) {
      case 'PROTECT_ROUTE':
        return { label: 'Protect Route', color: 'text-rose-400 bg-rose-950/80 border-rose-700' };
      case 'REINFORCE_CORRIDOR':
        return { label: 'Reinforce Corridor', color: 'text-amber-400 bg-amber-950/80 border-amber-700' };
      case 'OPEN_DIVERSION':
        return { label: 'Open Diversion', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-700' };
      case 'INCREASE_CAPACITY':
        return { label: 'Increase Capacity', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700' };
      default:
        return { label: 'Resilience Action', color: 'text-slate-300 bg-slate-800 border-slate-700' };
    }
  };

  const targetedRoad = ROADS.find(r => r.id === assetFilter);

  return (
    <div className="space-y-4">
      {/* Top Banner: Decision-Maker Resource Budget & Active Interventions Status */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Intervention Prioritisation Engine</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Decision Layer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Allocate limited emergency engineering resources to contain the greatest cascading failure
              </p>
            </div>
          </div>

          {/* Budget Limit Assignment & Meter */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800">
            {onSetMaxBudgetUnits && (
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Limit:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(b => (
                    <button
                      key={b}
                      onClick={() => onSetMaxBudgetUnits(b)}
                      className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition ${
                        maxBudgetUnits === b
                          ? 'bg-cyan-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Remaining Units
              </div>
              <div className="font-mono text-sm font-extrabold text-white flex items-center gap-1.5">
                <span className={remainingBudget > 0 ? 'text-cyan-400' : 'text-amber-400'}>
                  {remainingBudget}
                </span>
                <span className="text-slate-500 font-normal">/ {maxBudgetUnits} AVAILABLE</span>
              </div>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: maxBudgetUnits }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-5 rounded transition-all ${
                    idx < totalCostUsed
                      ? 'bg-cyan-500 shadow-sm shadow-cyan-500'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ASSET FOCUS / FILTER SELECTOR (Allows selecting failed/at-risk asset) */}
        <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-slate-200">Target Infrastructure Asset:</span>
            <select
              value={assetFilter}
              onChange={(e) => {
                setAssetFilter(e.target.value);
                onSelectAsset?.(e.target.value === 'ALL' ? null : e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Network Assets (Show 4 Counter-Measures)</option>
              <option value="R_SILK_BOARD_JUNCTION">Central Silk Board Underpass (Critical Sump)</option>
              <option value="R_ELEVATED_EXPRESSWAY">Electronic City Elevated Expressway (Emergency Viaduct)</option>
              <option value="R_ORR_AGARA_CORRIDOR">Outer Ring Road (Agara Corridor / Raja Kaluve)</option>
              <option value="R_HSR_27TH_MAIN">HSR 27th Main (Arterial Redistribution Vector)</option>
            </select>
          </div>

          {onNavigateToComparison && (
            <button
              onClick={onNavigateToComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 text-xs font-bold transition self-start sm:self-auto shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5 text-purple-400" />
              <span>Run & Compare Network State →</span>
            </button>
          )}
        </div>

        {/* If an asset is filtered, show its specific cascade consequences */}
        {targetedRoad && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-xs text-slate-300">
            <span className="font-bold text-cyan-300">Cascade Consequence for {targetedRoad.name}: </span>
            {targetedRoad.id === 'R_SILK_BOARD_JUNCTION' && 'Failure displaces 3,100 vph into residential HSR Layout, chokes 6 secondary junctions, and increases St. John’s Hospital ambulance transit time by +319%.'}
            {targetedRoad.id === 'R_ELEVATED_EXPRESSWAY' && 'Grade-separated high-speed viaduct immune to surface inundation; deploying dedicated emergency lanes guarantees ambulance passage directly into St. John’s Trauma Gate.'}
            {targetedRoad.id === 'R_ORR_AGARA_CORRIDOR' && 'Absorbs +2,150 vph of displaced traffic when Silk Board fails; desilting Agara Raja Kaluve drain mitigates flood backflow and preserves 6-lane capacity.'}
            {targetedRoad.id === 'R_HSR_27TH_MAIN' && 'Residential arterial carrying diverted spillover flow; dynamic signal priority relieves turning queues and clears secondary gridlock at 14th Main.'}
          </div>
        )}

        {/* TOP RECOMMENDED ACTION BANNER (Explainable & Transparent) */}
        {recommended && (
          <div className="mt-3 bg-cyan-950/40 border border-cyan-500/50 rounded-xl p-3.5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-900/80 border border-cyan-500 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-md">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 border border-cyan-700">
                      OPTIMAL RECOMMENDATION
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {recommended.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      -{recommended.impactReductionPercent}% Ripple Score
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">
                    <b className="text-cyan-300">EXPLAINABLE RATIONALE: </b>
                    {reason}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleIntervention(recommended.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deploy ({recommended.costUnits} Unit)</span>
              </button>
            </div>
          </div>
        )}

        {/* AI DECISION-SUPPORT STRATEGIC APPRAISAL CARD */}
        <div className="mt-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                {isAiGenerated ? 'AI Decision-Support Strategic Appraisal' : 'Deterministic Engineering Brief'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                (Grounded in deterministic simulation)
              </span>
            </div>

            <button
              id="refresh-intervention-ai-btn"
              onClick={loadAiComparison}
              disabled={isAiLoading}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition"
              title="Refresh AI Strategy Appraisal"
            >
              <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAiLoading ? 'Analyzing...' : 'Refresh'}</span>
            </button>
          </div>

          <p className="text-slate-200 text-[12px] leading-relaxed">
            {aiExplanation || 'Evaluating intervention trade-offs, residual stress shifts, and hospital corridor protection...'}
          </p>
        </div>

        {/* CONTROLS: Category Filter Tabs & View Toggle */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Strategy Type:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Strategies' },
              { id: 'PROTECT_ROUTE', label: 'Protect Route' },
              { id: 'REINFORCE_CORRIDOR', label: 'Reinforce Corridor' },
              { id: 'OPEN_DIVERSION', label: 'Open Diversion' },
              { id: 'INCREASE_CAPACITY', label: 'Increase Capacity' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === tab.id
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-600/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-end md:self-auto">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition ${
                viewMode === 'CARDS'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition ${
                viewMode === 'MATRIX'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Comparison Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: COMPARISON MATRIX TABLE */}
      {viewMode === 'MATRIX' ? (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Head-to-Head Intervention Comparison Matrix
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Ranked by impact reduction & cost-efficiency
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Intervention</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3">Impact Reduction</th>
                <th className="py-2.5 px-3">Efficiency ROI</th>
                <th className="py-2.5 px-3">Trauma Access</th>
                <th className="py-2.5 px-3">Deploy Speed</th>
                <th className="py-2.5 px-3 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInterventions.map(int => {
                const isSelected = activeInterventionIds.includes(int.id);
                const canAfford = remainingBudget >= int.costUnits;
                const badge = getInterventionBadge(int.interventionType);

                return (
                  <tr key={int.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-100">{int.name}</div>
                      <div className="text-[10px] text-slate-400">{int.targetRoadIds.join(', ')}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {int.costUnits} Unit{int.costUnits > 1 ? 's' : ''}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      -{int.impactReductionPercent}%
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-cyan-300">
                      {(int.impactReductionPercent / Math.max(1, int.costUnits)).toFixed(1)}x
                    </td>
                    <td className="py-2.5 px-3 font-mono text-purple-300">
                      +{int.hospitalAccessBoostPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {int.implementationSpeedMinutes} mins
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onToggleIntervention(int.id)}
                        disabled={!canAfford && !isSelected}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                          isSelected
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : canAfford
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? 'Remove' : canAfford ? 'Deploy' : 'Budget Limit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* VIEW 2: INTERVENTION CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterventions.map(intervention => {
            const isSelected = activeInterventionIds.includes(intervention.id);
            const canAfford = remainingBudget >= intervention.costUnits;
            const badge = getInterventionBadge(intervention.interventionType);

            return (
              <div
                key={intervention.id}
                className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          Cost: <b className="text-white">{intervention.costUnits} Unit{intervention.costUnits > 1 ? 's' : ''}</b>
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-1">
                        {intervention.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">ROI Metric</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {(intervention.impactReductionPercent / Math.max(1, intervention.costUnits)).toFixed(1)}x Score/Cost
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {intervention.description}
                  </p>

                  {/* Targeted Infrastructure Assets */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Route className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Targets: <b className="text-slate-200">{intervention.targetRoadIds.join(', ')}</b></span>
                  </div>

                  {/* Quantitative Benefits Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Ripple Impact</span>
                      <span className="text-xs font-bold text-emerald-400">
                        -{intervention.impactReductionPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Trauma Access</span>
                      <span className="text-xs font-bold text-purple-300">
                        +{intervention.hospitalAccessBoostPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Deploy Time</span>
                      <span className="text-xs font-bold text-slate-300">
                        {intervention.implementationSpeedMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Explainable Why Rationale */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-300">Decision Rationale: </span>
                    {intervention.explainableWhy}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isSelected ? (
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active in Simulation
                      </span>
                    ) : canAfford ? (
                      'Ready to deploy'
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Budget limit reached
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => onToggleIntervention(intervention.id)}
                    disabled={!canAfford && !isSelected}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
                        : canAfford
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Minus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Deploy Intervention</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
