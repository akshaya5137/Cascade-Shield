import React, { useState, useMemo, useEffect } from 'react';
import { 
  Network, 
  AlertTriangle, 
  TrendingUp, 
  Hospital, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  MapPin, 
  RotateCcw, 
  GitCompare, 
  Layers, 
  Sparkles, 
  Zap, 
  Info, 
  ChevronRight, 
  RefreshCw, 
  Eye, 
  Table, 
  CheckSquare, 
  Square, 
  Sliders, 
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  ShieldX,
  Flame,
  Clock,
  Car
} from 'lucide-react';
import { ROADS, MULTI_CORRIDOR_SCENARIOS, ZONES, HOSPITALS, INTERVENTIONS } from '../../data/networkData';
import { calculateDynamicCascade, STATE_DEFINITIONS } from '../../engine/simulationEngine';
import { RoadLink, CorridorScenario, RoadStressMetric, InterventionOption } from '../../types';
import { fetchMultiCorridorExplanation } from '../../services/aiService';

interface MultiCorridorAnalysisViewProps {
  onApplyScenarioToMap: (roadIds: string[]) => void;
  activeDisabledRoadIds?: string[];
  activeInterventions?: InterventionOption[];
  onProtectRoad?: (roadId: string) => void;
  onUnprotectRoad?: (roadId: string) => void;
  onFocusCorridorOnMap?: (roadId: string) => void;
}

const DEFAULT_STATE_DEF = {
  label: 'NORMAL',
  badgeText: 'NORMAL (<80% CAP)',
  color: '#10b981',
  textColor: 'text-emerald-400',
  bgColor: 'bg-emerald-950/80',
  borderColor: 'border-emerald-700',
  dotColor: 'bg-emerald-400',
  description: 'Operating within normal design capacity (V/C < 0.80); free-flowing traffic.'
};

export const MultiCorridorAnalysisView: React.FC<MultiCorridorAnalysisViewProps> = ({
  onApplyScenarioToMap,
  activeDisabledRoadIds = [],
  activeInterventions = [],
  onProtectRoad,
  onUnprotectRoad,
  onFocusCorridorOnMap
}) => {
  // 1. Selection State: Corridors chosen by user for simultaneous failure
  const [selectedRoadIds, setSelectedRoadIds] = useState<string[]>(() => {
    return Array.isArray(activeDisabledRoadIds) && activeDisabledRoadIds.length > 0 
      ? activeDisabledRoadIds 
      : ['R_SILK_BOARD_JUNCTION'];
  });

  // Track the last simulated configuration
  const [simulatedRoadIds, setSimulatedRoadIds] = useState<string[]>(() => {
    return Array.isArray(activeDisabledRoadIds) && activeDisabledRoadIds.length > 0 
      ? activeDisabledRoadIds 
      : ['R_SILK_BOARD_JUNCTION'];
  });

  // UI States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<'ALL' | 'FAILED_STRESSED'>('ALL');

  // AI Decision-Support State
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  // Sync external changes to selection if needed
  useEffect(() => {
    if (activeDisabledRoadIds && activeDisabledRoadIds.length > 0) {
      setSelectedRoadIds(prev => {
        const isSame = prev.length === activeDisabledRoadIds.length && 
          prev.every(id => activeDisabledRoadIds.includes(id));
        return isSame ? prev : activeDisabledRoadIds;
      });
    }
  }, [activeDisabledRoadIds]);

  // Baseline network state (0 failures) for before vs after delta comparison
  const baselineState = useMemo(() => {
    return calculateDynamicCascade([], activeInterventions);
  }, [activeInterventions]);

  // Active simulated state from deterministic engine
  const simulationState = useMemo(() => {
    return calculateDynamicCascade(simulatedRoadIds, activeInterventions);
  }, [simulatedRoadIds, activeInterventions]);

  // Unprotected scenario state (same failures, 0 interventions) for before vs after protection delta
  const unprotectedState = useMemo(() => {
    return calculateDynamicCascade(simulatedRoadIds, []);
  }, [simulatedRoadIds]);

  const unprotectedDisplaced = useMemo(() => {
    return simulatedRoadIds.reduce((sum, id) => {
      const road = ROADS.find(r => r.id === id);
      return sum + (road ? road.normalVolumeVph : 0);
    }, 0);
  }, [simulatedRoadIds]);

  // Stress metric lookup map
  const stressMetricMap = useMemo(() => {
    const map = new Map<string, RoadStressMetric>();
    (simulationState.roadStressMetrics || []).forEach(m => map.set(m.roadId, m));
    return map;
  }, [simulationState]);

  // Derived Key Result Metrics
  const totalDisplacedVolumeVph = useMemo(() => {
    return simulatedRoadIds.reduce((sum, id) => {
      // If the corridor is protected by an active intervention that prevents failure or protects route, it is NOT displaced
      const isDefended = activeInterventions.some(
        int => (int.preventFailure || int.interventionType === 'PROTECT_ROUTE' || int.interventionType === 'REINFORCE_CORRIDOR') && int.targetRoadIds.includes(id)
      );
      if (isDefended) return sum;
      const road = ROADS.find(r => r.id === id);
      return sum + (road ? road.normalVolumeVph : 0);
    }, 0);
  }, [simulatedRoadIds, activeInterventions]);

  const unprotectedPeakVcRatio = useMemo(() => {
    const activeMetrics = (unprotectedState.roadStressMetrics || []).filter(
      m => !simulatedRoadIds.includes(m.roadId)
    );
    if (activeMetrics.length === 0) return 0.72;
    const maxVal = Math.max(...activeMetrics.map(m => m.volumeCapacityRatio));
    return Number.isFinite(maxVal) ? Math.max(0, maxVal) : 0.72;
  }, [unprotectedState, simulatedRoadIds]);

  const peakVcRatio = useMemo(() => {
    // Exclude severed roads
    const severedIds = simulationState.stepData.failedRoadIds || [];
    const activeMetrics = (simulationState.roadStressMetrics || []).filter(
      m => !severedIds.includes(m.roadId)
    );
    if (activeMetrics.length === 0) return 0.72;
    const maxVal = Math.max(...activeMetrics.map(m => m.volumeCapacityRatio));
    return Number.isFinite(maxVal) ? Math.max(0, maxVal) : 0.72;
  }, [simulationState]);

  const protectedRoadNames = useMemo(() => {
    return ROADS.filter(r => activeInterventions.some(int => int.targetRoadIds.includes(r.id))).map(r => r.name);
  }, [activeInterventions]);

  const networkStatus = useMemo(() => {
    if (simulatedRoadIds.length === 0) return { label: 'NETWORK STABLE', color: 'text-emerald-400', bg: 'bg-emerald-950/80', border: 'border-emerald-700' };
    const score = simulationState?.details?.score ?? 0;
    if (score >= 70) return { label: 'NETWORK CRITICAL', color: 'text-rose-400', bg: 'bg-rose-950/80', border: 'border-rose-700' };
    return { label: 'NETWORK STRESSED', color: 'text-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-700' };
  }, [simulatedRoadIds, simulationState]);

  // Check if selection changed since last run
  const isSelectionStale = useMemo(() => {
    if (selectedRoadIds.length !== simulatedRoadIds.length) return true;
    return !selectedRoadIds.every(id => simulatedRoadIds.includes(id));
  }, [selectedRoadIds, simulatedRoadIds]);

  // Fetch AI operational explanation based strictly on calculated results
  const loadAiExplanation = async (targetRoadIds: string[]) => {
    setIsAiLoading(true);
    const targetState = calculateDynamicCascade(targetRoadIds, activeInterventions);
    const failedNames = targetRoadIds.map(id => ROADS.find(r => r.id === id)?.name || id);
    const displacedVol = targetRoadIds.reduce((sum, id) => sum + (ROADS.find(r => r.id === id)?.normalVolumeVph || 0), 0);
    const rippleScore = targetState?.details?.score ?? 0;
    const secondaryBottlenecks = targetState?.details?.secondaryBottlenecksCount ?? 0;
    
    const hospitalSevered = targetRoadIds.some(id => ROADS.find(r => r.id === id)?.isHospitalCorridor);
    const hospitalImpact = hospitalSevered 
      ? `Critical hospital trauma access lifeline severed; emergency ambulance arrival delayed to ${targetState.stepData.hospitalAverageLatencyMinutes}m.`
      : `Secondary detour queues generate traffic spillover onto trauma approaches (+${targetState.details.hospitalAccessLatencyIncreaseMinutes}m delay).`;

    const scenarioTitle = targetRoadIds.length > 1 
      ? `Compound Multi-Corridor Cascade (${targetRoadIds.length} simultaneous failures)`
      : targetRoadIds.length === 1 
        ? `Single Corridor Failure (${failedNames[0]})`
        : 'Healthy Baseline Network Operations';

    const fallbackText = targetRoadIds.length === 0
      ? 'All corridors operating within normal design capacity. No displaced traffic; emergency trauma access to St. John’s Hospital is 6.8 minutes.'
      : `${scenarioTitle} displaces ${displacedVol.toLocaleString()} vph across secondary arterials, producing ${secondaryBottlenecks} secondary intersection bottlenecks with a Ripple Impact Score of ${rippleScore}/100. ${hospitalImpact}`;

    try {
      const res = await fetchMultiCorridorExplanation({
        scenarioName: scenarioTitle,
        failedCorridors: failedNames,
        displacedVolumeVph: displacedVol,
        rippleScore,
        secondaryBottlenecks,
        hospitalImpact,
        fallbackText
      });

      setAiExplanation(res.explanation || fallbackText);
      setIsAiGenerated(Boolean(res.isAiGenerated));
    } catch {
      setAiExplanation(fallbackText);
      setIsAiGenerated(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Initial AI brief on mount
  useEffect(() => {
    loadAiExplanation(simulatedRoadIds);
  }, []);

  // Execution: Run simulation with currently selected corridors
  const handleRunAnalysis = () => {
    if (selectedRoadIds.length === 0) return;
    setIsAnalyzing(true);
    setSimulatedRoadIds(selectedRoadIds);
    onApplyScenarioToMap(selectedRoadIds);

    setTimeout(() => {
      setIsAnalyzing(false);
      loadAiExplanation(selectedRoadIds);
    }, 250);
  };

  // Selection helpers
  const handleToggleRoad = (roadId: string) => {
    setActivePresetId(null);
    setSelectedRoadIds(prev => {
      if (prev.includes(roadId)) {
        return prev.filter(id => id !== roadId);
      } else {
        return [...prev, roadId];
      }
    });
  };

  const handleSelectAll = () => {
    setActivePresetId(null);
    setSelectedRoadIds(ROADS.map(r => r.id));
  };

  const handleClearAll = () => {
    setActivePresetId(null);
    setSelectedRoadIds([]);
    setSimulatedRoadIds([]);
    onApplyScenarioToMap([]);
    loadAiExplanation([]);
  };

  // Preset Scenario Runner
  const handleRunPresetScenario = (scenario: CorridorScenario) => {
    setActivePresetId(scenario.id);
    let targetRoadIds: string[] = [];
    if (scenario.id === 'SCENARIO_COMPOUND_CASCADE') {
      targetRoadIds = ['R_SILK_BOARD_JUNCTION', 'R_ORR_AGARA_CORRIDOR'];
    } else {
      targetRoadIds = [scenario.triggerCorridorId];
    }

    setSelectedRoadIds(targetRoadIds);
    setSimulatedRoadIds(targetRoadIds);
    onApplyScenarioToMap(targetRoadIds);
    loadAiExplanation(targetRoadIds);
  };

  // Automated Redundancy Insights ("Why the cascade worsened")
  const cascadeInsights = useMemo(() => {
    if (simulatedRoadIds.length === 0) {
      return [
        'Network operates with full baseline redundancy; no corridors are severed.',
        'All primary and secondary arterials remain below 70% volume-to-capacity threshold.',
        'St. John’s Hospital casualty access is uninhibited across all 4 catchment wards.'
      ];
    }

    const insights: string[] = [];
    const failedRoads = simulatedRoadIds.map(id => ROADS.find(r => r.id === id)).filter(Boolean) as RoadLink[];
    const failedNames = failedRoads.map(r => r.name.split('(')[0].trim());

    insights.push(`${simulatedRoadIds.length} simultaneous corridor failure(s) (${failedNames.join(' + ')}) severed ${totalDisplacedVolumeVph.toLocaleString()} vph of design capacity.`);

    if (simulatedRoadIds.includes('R_SILK_BOARD_JUNCTION') && simulatedRoadIds.includes('R_ORR_AGARA_CORRIDOR')) {
      insights.push('CRITICAL REDUNDANCY LOSS: Disabling both Central Silk Board and Outer Ring Road simultaneously eliminates Bengaluru’s primary east-west relief corridor, forcing all diverted flow into narrow residential grids (HSR 27th Main and Koramangala 100ft Rd).');
    } else if (simulatedRoadIds.includes('R_SILK_BOARD_JUNCTION')) {
      insights.push('Silk Board underpass submersion displaced 3,100 vph onto Outer Ring Road (Agara) and HSR 27th Main, triggering rapid queue spillback towards secondary junctions.');
    } else if (simulatedRoadIds.includes('R_ORR_AGARA_CORRIDOR')) {
      insights.push('Agara Lake Raja Kaluve breach eliminated the 6-lane tech corridor to Bellandur, forcing detour queues through Jakkasandra and HSR Sector 1.');
    }

    if (simulationState.details.secondaryBottlenecksCount > 0) {
      const bottleneckNodes = (simulationState.stepData.bottleneckNodeIds || []).map(id => id.replace('N_', '').replace(/_/g, ' '));
      insights.push(`Queue spillover created ${simulationState.details.secondaryBottlenecksCount} secondary bottlenecks at converging intersections: ${bottleneckNodes.slice(0, 3).join(', ')}.`);
    }

    if (simulationState.details.zonesExceedingEmergencyThreshold > 0) {
      insights.push(`Trauma latency breached the 12-minute survival window for ${simulationState.details.zonesExceedingEmergencyThreshold} out of 4 residential sectors (~184,500 citizens at risk).`);
    }

    return insights;
  }, [simulatedRoadIds, totalDisplacedVolumeVph, simulationState]);

  return (
    <div id="multi-corridor-analysis-view" className="flex flex-col gap-4 text-xs select-none p-1">
      {/* 1. HEADER & STATUS INDICATORS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shrink-0 mt-0.5">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Multi-Corridor Analysis
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  Simultaneous Failure Testing
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Test simultaneous infrastructure failures, evaluate compound disruption, and identify where network redundancy breaks down.
              </p>
            </div>
          </div>

          {/* Quick Apply to Map CTA */}
          <button
            id="apply-corridors-map-cta"
            onClick={() => onApplyScenarioToMap(simulatedRoadIds)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition shadow-sm shrink-0 self-start md:self-auto"
            title="Update live Leaflet map vectors with current simulation state"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Sync Map View</span>
          </button>
        </div>

        {/* Live Status Indicators Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Network Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold ${networkStatus.bg} ${networkStatus.color} ${networkStatus.border}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{networkStatus.label}</span>
            </div>

            {/* Failures Selected Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-500">Failures Selected:</span>
              <span className="font-bold text-rose-300">{selectedRoadIds.length} / {ROADS.length}</span>
            </div>

            {/* Analysis State */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-500">Analysis:</span>
              <span className={`font-bold ${isAnalyzing ? 'text-cyan-400 animate-pulse' : isSelectionStale ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isAnalyzing ? 'Running Engine...' : isSelectionStale ? 'Ready (Stale)' : 'Simulated'}
              </span>
            </div>
          </div>

          {isSelectionStale && selectedRoadIds.length > 0 && (
            <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Selection updated — click "Run Analysis"</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. SECTION A — SELECT CORRIDORS TO FAIL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-cyan-800">
                1
              </span>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Select Corridors to Fail
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Toggle 1, 2, or multiple corridors to simulate concurrent infrastructure severance.
            </p>
          </div>

          {/* Controls: Select All, Clear All, Run Analysis */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-800 transition"
              title="Select all network corridors"
            >
              Select All
            </button>

            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-800 transition"
              title="Clear all selections and reset to baseline"
            >
              Clear All
            </button>

            <button
              id="run-multi-corridor-analysis-btn"
              onClick={handleRunAnalysis}
              disabled={selectedRoadIds.length === 0 || isAnalyzing}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-md ${
                selectedRoadIds.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50 shadow-cyan-950/50 ring-1 ring-cyan-400'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'fill-current'}`} />
              <span>{isAnalyzing ? 'Analyzing...' : `Run Analysis (${selectedRoadIds.length})`}</span>
            </button>
          </div>
        </div>

        {/* Empty Selection Alert */}
        {selectedRoadIds.length === 0 && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Select at least one corridor to run the analysis, or choose a Compound Scenario preset below.</span>
          </div>
        )}

        {/* Dynamic Road Selection Grid (All 12 ROADS from network data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {ROADS.map(road => {
            const isSelected = selectedRoadIds.includes(road.id);
            const isProtected = activeInterventions.some(int => int.targetRoadIds.includes(road.id));
            const compatibleInt = INTERVENTIONS.find(int => int.targetRoadIds.includes(road.id));
            const metric = stressMetricMap.get(road.id);
            const vcRatio = metric ? metric.volumeCapacityRatio : (road.normalVolumeVph / road.baseCapacityVph);
            const isSimulatedFailed = simulatedRoadIds.includes(road.id);

            return (
              <div
                key={road.id}
                id={`corridor-card-${road.id}`}
                onClick={() => handleToggleRoad(road.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between select-none ${
                  isProtected
                    ? 'bg-emerald-950/40 border-emerald-600 text-slate-200 ring-1 ring-emerald-500 shadow-md shadow-emerald-950/40'
                    : isSelected
                      ? 'bg-rose-950/60 border-rose-600 text-white shadow-md shadow-rose-950/40 ring-1 ring-rose-500'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                        isSelected ? 'bg-rose-600 text-white' : isProtected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : isProtected ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <Square className="w-3.5 h-3.5" />}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold truncate">
                        {road.type}
                      </span>
                    </div>

                    {isProtected ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>PROTECTED</span>
                      </span>
                    ) : (
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : isSimulatedFailed
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : vcRatio >= 1.0
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? 'FAILED' : isSimulatedFailed ? 'SEVERED' : vcRatio >= 1.0 ? 'HIGH STRESS' : 'OPERATIONAL'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1 leading-snug truncate" title={road.name}>
                    {road.name.split('(')[0]}
                  </h4>

                  {road.isHospitalCorridor && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-purple-300 mt-1">
                      <Hospital className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>St. John’s Trauma Lifeline</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <div>
                      <span>Base Flow:</span>
                      <div className="font-semibold text-slate-200">{road.normalVolumeVph.toLocaleString()} vph</div>
                    </div>
                    <div>
                      <span>Capacity:</span>
                      <div className="font-semibold text-slate-200">{road.baseCapacityVph.toLocaleString()} vph</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Modeled V/C:</span>
                  <span className={`font-bold ${isProtected ? 'text-emerald-400' : isSelected ? 'text-rose-400' : vcRatio >= 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isProtected ? `${(vcRatio * 100).toFixed(0)}% (Defended)` : isSelected ? '0 (Severed)' : `${(vcRatio * 100).toFixed(0)}%`}
                  </span>
                </div>

                {/* Quick Protect Toggle */}
                {compatibleInt && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">Defense:</span>
                    {isProtected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnprotectRoad && onUnprotectRoad(road.id);
                        }}
                        className="text-amber-400 hover:underline font-bold flex items-center gap-0.5"
                        title="Remove protection"
                      >
                        <span>Protected ✓ (Undo)</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProtectRoad && onProtectRoad(road.id);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold flex items-center gap-0.5"
                        title={`Deploy ${compatibleInt.name}`}
                      >
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>Protect Corridor</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION B — COMPOUND SCENARIOS (ONE-CLICK PRESETS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-cyan-800">
                2
              </span>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Compound Scenarios (Preset Failures)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Benchmark pre-calibrated multi-failure combinations against city-level resilience thresholds.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hidden sm:inline">
            1-Click Execution
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MULTI_CORRIDOR_SCENARIOS.map(sc => {
            const isCompound = sc.id === 'SCENARIO_COMPOUND_CASCADE';
            const isActive = activePresetId === sc.id;

            return (
              <div
                key={sc.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950 ring-1 ring-cyan-500'
                    : isCompound
                      ? 'bg-gradient-to-b from-slate-950 to-rose-950/20 border-rose-900/60 hover:border-rose-700'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {sc.id.replace('SCENARIO_', '')}
                    </span>
                    {isCompound && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        Compound
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-bold text-amber-400">
                      RIS {sc.estimatedRippleScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-snug">
                    {sc.name.split(':')[1]?.trim() || sc.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sc.tagline}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Displaced:</span>
                      <span className="text-slate-200 font-semibold">{sc.displacedVolumeVph.toLocaleString()} vph</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inundation:</span>
                      <span className="text-cyan-400 font-semibold">{sc.floodDepthMeters}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failures:</span>
                      <span className="text-rose-300 font-semibold">{isCompound ? '2 Corridors' : '1 Corridor'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRunPresetScenario(sc)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-300 border border-slate-700 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span>Run Scenario</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION C — KEY RESULT SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-cyan-800">
                3
              </span>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Key Simulation Results
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deterministic outputs for currently simulated failure vector ({simulatedRoadIds.length} corridor link(s)).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border ${networkStatus.bg} ${networkStatus.color} ${networkStatus.border}`}>
              {networkStatus.label}
            </span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Ripple Impact Score */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>Ripple Impact Score</span>
              <span className="text-[9px] text-slate-500" title="Ripple Impact Score — a prototype comparative metric used by Cascade Shield to summarize network disruption.">RIS [?]</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-1">
              <span className={simulationState.details.score >= 70 ? 'text-rose-400' : simulationState.details.score >= 40 ? 'text-amber-400' : 'text-emerald-400'}>
                {simulationState.details.score}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase font-semibold">
              Category: <span className="text-white">{simulationState.details.category}</span>
            </div>
          </div>

          {/* 2. Failures & Displaced Traffic */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] font-mono">Displaced Traffic</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {totalDisplacedVolumeVph.toLocaleString()}
              <span className="text-xs text-slate-500 ml-1 font-normal">vph</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              From <span className="text-rose-400 font-bold">{simulatedRoadIds.length}</span> severed links
            </div>
          </div>

          {/* 3. Secondary Bottlenecks */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] font-mono">Secondary Bottlenecks</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {simulationState.details.secondaryBottlenecksCount}
              <span className="text-xs text-slate-500 ml-1 font-normal">junctions</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Affected: <span className="text-white font-bold">{simulationState.details.affectedRoutesCount} / {ROADS.length}</span> corridors
            </div>
          </div>

          {/* 4. Hospital Latency & Breaches */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-slate-400 text-[10px] font-mono">St. John’s Trauma Latency</div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">
              {simulationState.stepData.hospitalAverageLatencyMinutes}
              <span className="text-xs text-slate-500 ml-1 font-normal">min</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              <span className="text-rose-400 font-bold">{simulationState.details.zonesExceedingEmergencyThreshold} / 4</span> zones breach 12m
            </div>
          </div>
        </div>

        {/* Secondary KPI Bar: Peak V/C, Redundancy, Population */}
        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Peak Active V/C:</span>
            <span className={`font-bold ${peakVcRatio >= 1.2 ? 'text-rose-400' : peakVcRatio >= 1.0 ? 'text-amber-400' : 'text-emerald-400'}`} title="Volume-to-Capacity ratio. Values above 1.0 indicate demand exceeds modeled capacity.">
              {peakVcRatio.toFixed(2)} ({(peakVcRatio * 100).toFixed(0)}% Saturation)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Active Interventions:</span>
            <span className="text-slate-200 font-bold">
              {activeInterventions.length > 0 ? `${activeInterventions.length} Deployed` : 'None (Unmitigated)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Catchment Population at Risk:</span>
            <span className="text-purple-300 font-bold">
              {simulationState.details.zonesExceedingEmergencyThreshold >= 3 ? '184,500 Citizens' : simulationState.details.zonesExceedingEmergencyThreshold > 0 ? '98,500 Citizens' : '0 (Safe)'}
            </span>
          </div>
        </div>
      </div>

      {/* 4B. ACTIVE PROTECTION COMPARISON CARD (STEP 7 & 8) */}
      {activeInterventions.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-600/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Active Corridor Defense: Unprotected vs. Protected Comparison
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-900 text-emerald-200 border border-emerald-500">
                    PROTECTED
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  {protectedRoadNames.length > 0 
                    ? `${protectedRoadNames.join(', ')} protected under active counter-measures.`
                    : 'Active intervention preventing cascading network collapse.'}
                </p>
              </div>
            </div>

            {onUnprotectRoad && (
              <div className="flex items-center gap-2">
                {activeInterventions.map(int => (
                  <button
                    key={int.id}
                    onClick={() => int.targetRoadIds.forEach(id => onUnprotectRoad(id))}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-mono transition flex items-center gap-1"
                    title={`Deactivate ${int.name}`}
                  >
                    <ShieldX className="w-3 h-3 text-amber-400" />
                    <span>Reset {int.id.replace('INT_', '').replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compact 6-metric comparison grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Ripple Impact Score */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Ripple Impact Score</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedState.details.score}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{simulationState.details.score}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{unprotectedState.details.score - simulationState.details.score} pts mitigated
              </div>
            </div>

            {/* Affected Routes */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Affected Corridors</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedState.details.affectedRoutesCount}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{simulationState.details.affectedRoutesCount}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{Math.max(0, unprotectedState.details.affectedRoutesCount - simulationState.details.affectedRoutesCount)} saved
              </div>
            </div>

            {/* Secondary Bottlenecks */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Secondary Chokepoints</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedState.details.secondaryBottlenecksCount}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{simulationState.details.secondaryBottlenecksCount}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{Math.max(0, unprotectedState.details.secondaryBottlenecksCount - simulationState.details.secondaryBottlenecksCount)} avoided
              </div>
            </div>

            {/* Hospital Trauma Access */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">St. John's Access</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedState.stepData.hospitalAverageLatencyMinutes}m</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{simulationState.stepData.hospitalAverageLatencyMinutes}m</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{(unprotectedState.stepData.hospitalAverageLatencyMinutes - simulationState.stepData.hospitalAverageLatencyMinutes).toFixed(1)}m faster
              </div>
            </div>

            {/* Peak V/C */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Peak Network V/C</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedPeakVcRatio.toFixed(2)}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{peakVcRatio.toFixed(2)}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{(Math.max(0, unprotectedPeakVcRatio - peakVcRatio) * 100).toFixed(0)}% saturation
              </div>
            </div>

            {/* Displaced Traffic */}
            <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-mono block">Displaced Spillover</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-sm font-bold text-rose-400">{unprotectedDisplaced.toLocaleString()}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-base font-black text-emerald-400">{totalDisplacedVolumeVph.toLocaleString()}</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">
                -{Math.max(0, unprotectedDisplaced - totalDisplacedVolumeVph).toLocaleString()} vph diverted
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION D — BEFORE VS AFTER / DELTA MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Network Impact Delta (Baseline vs. Current Scenario)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mathematical delta between normal pre-storm operations (T+0m) and the simulated multi-corridor state.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2.5">Resilience Metric</th>
                <th className="p-2.5">Baseline (T+0m)</th>
                <th className="p-2.5">Simulated Scenario</th>
                <th className="p-2.5">Net Impact (Delta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="p-2.5 font-sans font-semibold text-white">Ripple Impact Score</td>
                <td className="p-2.5 text-slate-400">{baselineState.details.score} / 100</td>
                <td className="p-2.5 text-white font-bold">{simulationState.details.score} / 100</td>
                <td className="p-2.5 font-bold">
                  {simulationState.details.score > baselineState.details.score ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +{simulationState.details.score - baselineState.details.score} points
                    </span>
                  ) : (
                    <span className="text-emerald-400">0 (Stable)</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-semibold text-white">Displaced Traffic Flow</td>
                <td className="p-2.5 text-slate-400">0 vph</td>
                <td className="p-2.5 text-amber-300 font-bold">{totalDisplacedVolumeVph.toLocaleString()} vph</td>
                <td className="p-2.5 font-bold">
                  {totalDisplacedVolumeVph > 0 ? (
                    <span className="text-amber-400">+{totalDisplacedVolumeVph.toLocaleString()} vph</span>
                  ) : (
                    <span className="text-emerald-400">None</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-semibold text-white">Secondary Bottlenecks</td>
                <td className="p-2.5 text-slate-400">0 junctions</td>
                <td className="p-2.5 text-rose-300 font-bold">{simulationState.details.secondaryBottlenecksCount} junctions</td>
                <td className="p-2.5 font-bold">
                  {simulationState.details.secondaryBottlenecksCount > 0 ? (
                    <span className="text-rose-400">+{simulationState.details.secondaryBottlenecksCount} chokepoints</span>
                  ) : (
                    <span className="text-emerald-400">0 (Free Flow)</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-semibold text-white">St. John’s Trauma Latency</td>
                <td className="p-2.5 text-slate-400">6.8 min</td>
                <td className="p-2.5 text-purple-300 font-bold">{simulationState.stepData.hospitalAverageLatencyMinutes} min</td>
                <td className="p-2.5 font-bold">
                  {simulationState.stepData.hospitalAverageLatencyMinutes > 6.8 ? (
                    <span className="text-rose-400">
                      +{(simulationState.stepData.hospitalAverageLatencyMinutes - 6.8).toFixed(1)} min delay
                    </span>
                  ) : (
                    <span className="text-emerald-400">Optimal</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-sans font-semibold text-white">Zones Breaching Golden Hour (12m)</td>
                <td className="p-2.5 text-slate-400">0 / 4 zones</td>
                <td className="p-2.5 text-rose-300 font-bold">{simulationState.details.zonesExceedingEmergencyThreshold} / 4 zones</td>
                <td className="p-2.5 font-bold">
                  {simulationState.details.zonesExceedingEmergencyThreshold > 0 ? (
                    <span className="text-rose-400">+{simulationState.details.zonesExceedingEmergencyThreshold} zones isolated</span>
                  ) : (
                    <span className="text-emerald-400">All Protected</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. SECTION E — MULTI-CORRIDOR COMPARISON TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Table className="w-4 h-4 text-cyan-400" />
              <span>Comprehensive Corridor Redistribution & Stress Table</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Detailed breakdown of baseline capacity, diverted volume additions, volume-capacity saturation, and resultant delay.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTableFilter('ALL')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition ${
                tableFilter === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              All Links ({ROADS.length})
            </button>
            <button
              onClick={() => setTableFilter('FAILED_STRESSED')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition ${
                tableFilter === 'FAILED_STRESSED' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Disrupted & Stressed Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Corridor</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Base Flow</th>
                <th className="p-2.5">Capacity</th>
                <th className="p-2.5">Diverted Flow</th>
                <th className="p-2.5">Effective Cap</th>
                <th className="p-2.5" title="Volume-to-Capacity ratio. Values above 1.0 indicate demand exceeds modeled capacity.">V/C Ratio</th>
                <th className="p-2.5">Delay Increase</th>
                <th className="p-2.5">Operational State</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ROADS
                .filter(road => {
                  if (tableFilter === 'ALL') return true;
                  const isProtected = activeInterventions.some(int => int.targetRoadIds.includes(road.id));
                  const isFailed = simulatedRoadIds.includes(road.id) && !isProtected;
                  const metric = stressMetricMap.get(road.id);
                  const isStressed = metric && (metric.volumeCapacityRatio >= 0.8 || metric.state === 'HIGH_PRESSURE');
                  return isFailed || isStressed || isProtected;
                })
                .map(road => {
                  const metric = stressMetricMap.get(road.id);
                  const isProtected = activeInterventions.some(int => int.targetRoadIds.includes(road.id));
                  const isFailed = simulatedRoadIds.includes(road.id) && !isProtected;
                  const vcRatio = metric ? metric.volumeCapacityRatio : (isFailed ? 0 : road.normalVolumeVph / road.baseCapacityVph);
                  const currentVol = metric ? metric.currentVolumeVph : (isFailed ? 0 : road.normalVolumeVph);
                  const capacity = metric ? metric.effectiveCapacityVph : road.baseCapacityVph;
                  const addedVol = metric ? metric.addedDivertedVolumeVph : 0;
                  const delayInc = metric ? metric.delayIncreasePercent : 0;

                  const state = isProtected ? 'PROTECTED' : isFailed ? 'FAILED' : (vcRatio >= 1.0 ? 'HIGH_PRESSURE' : vcRatio >= 0.8 ? 'AT_RISK' : 'NORMAL');
                  const stateDef = (STATE_DEFINITIONS && STATE_DEFINITIONS[state]) || STATE_DEFINITIONS?.NORMAL || DEFAULT_STATE_DEF;

                  // Find if there is a compatible intervention for this road
                  const compatibleIntervention = INTERVENTIONS.find(int => int.targetRoadIds.includes(road.id));

                  return (
                    <tr key={road.id} className={`hover:bg-slate-800/40 transition ${isProtected ? 'bg-emerald-950/20' : isFailed ? 'bg-rose-950/20' : ''}`}>
                      <td className="p-2.5 font-sans font-semibold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          isProtected ? 'bg-emerald-400' : isFailed ? 'bg-rose-500' : vcRatio >= 1.0 ? 'bg-rose-400' : vcRatio >= 0.8 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                        <span className="truncate max-w-[160px]" title={road.name}>{road.name.split('(')[0]}</span>
                        {road.isHospitalCorridor && (
                          <Hospital className="w-3 h-3 text-purple-400 shrink-0" title="Designated Hospital Lifeline" />
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400 text-[10px]">{road.type}</td>
                      <td className="p-2.5 text-slate-300">{road.normalVolumeVph.toLocaleString()}</td>
                      <td className="p-2.5 text-slate-300">{road.baseCapacityVph.toLocaleString()}</td>
                      <td className="p-2.5 font-bold">
                        {addedVol > 0 ? <span className="text-amber-400">+{addedVol.toLocaleString()}</span> : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {isFailed ? <span className="text-rose-400">0 (Severed)</span> : capacity.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-bold">
                        <span className={isProtected ? 'text-emerald-400' : isFailed ? 'text-rose-400' : vcRatio >= 1.0 ? 'text-rose-400' : vcRatio >= 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
                          {isFailed ? 'CUT' : `${(vcRatio * 100).toFixed(0)}%`}
                        </span>
                      </td>
                      <td className="p-2.5">
                        {isProtected ? (
                          <span className="text-emerald-400 font-bold">Protected</span>
                        ) : isFailed ? (
                          <span className="text-rose-400 font-bold">Impassable</span>
                        ) : delayInc > 0 ? (
                          <span className="text-amber-400 font-bold">+{delayInc}%</span>
                        ) : (
                          <span className="text-emerald-400">Normal</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isProtected ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                          isFailed ? 'bg-rose-950 text-rose-300 border border-rose-700' : 
                          `${stateDef.bgColor || 'bg-emerald-950/80'} ${stateDef.textColor || 'text-emerald-400'} border ${stateDef.borderColor || 'border-emerald-700'}`
                        }`}>
                          {isProtected ? 'PROTECTED' : isFailed ? 'FAILED' : (stateDef.badgeText || 'NORMAL')}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isProtected ? (
                            <button
                              onClick={() => onUnprotectRoad && onUnprotectRoad(road.id)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-mono border border-slate-700 font-semibold transition flex items-center gap-1"
                              title="Remove protection"
                            >
                              <ShieldX className="w-2.5 h-2.5" />
                              <span>Unprotect</span>
                            </button>
                          ) : compatibleIntervention ? (
                            <button
                              onClick={() => onProtectRoad && onProtectRoad(road.id)}
                              className="px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-mono border border-cyan-700 font-semibold transition flex items-center gap-1"
                              title={`Deploy ${compatibleIntervention.name}`}
                            >
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Protect</span>
                            </button>
                          ) : null}

                          {onFocusCorridorOnMap && (
                            <button
                              onClick={() => onFocusCorridorOnMap(road.id)}
                              className="text-[10px] text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Focus</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. SECTION F — REDUNDANCY & CASCADE INSIGHTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            Why the Cascade Worsened (Network Redundancy Analysis)
          </h4>
        </div>

        <div className="space-y-2">
          {cascadeInsights.map((insight, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. SECTION G — GEMINI AI OPERATIONAL ANALYSIS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAiGenerated ? 'Gemini AI Decision-Support Synthesis' : 'Deterministic Engineering Brief'}</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              (Grounded in deterministic simulation)
            </span>
          </div>

          <button
            onClick={() => loadAiExplanation(simulatedRoadIds)}
            disabled={isAiLoading}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition"
            title="Refresh operational synthesis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isAiLoading ? 'Synthesizing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[12px] text-slate-200 leading-relaxed font-sans">
          {aiExplanation || 'Analyzing corridor displacement vectors and secondary capacity bottlenecks across Bengaluru network...'}
        </div>
      </div>
    </div>
  );
};
