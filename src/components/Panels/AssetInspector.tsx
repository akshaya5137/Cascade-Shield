import React, { useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  Route, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Activity, 
  Hospital,
  ArrowRight,
  Zap,
  TrendingUp,
  Compass,
  CornerDownRight,
  ShieldCheck,
  ShieldX,
  Info,
  Layers
} from 'lucide-react';
import { 
  RoadLink, 
  NetworkNode, 
  InfrastructureState, 
  RoadStressMetric, 
  AlternativeRouteSummary, 
  HospitalFacility,
  InterventionOption
} from '../../types';
import { INTERVENTIONS, ROADS } from '../../data/networkData';
import { STATE_DEFINITIONS, calculateDynamicCascade } from '../../engine/simulationEngine';

interface AssetInspectorProps {
  selectedRoad: RoadLink | null;
  selectedNode: NetworkNode | null;
  selectedHospital?: HospitalFacility | null;
  roadState?: InfrastructureState;
  stressMetric?: RoadStressMetric;
  alternativeSummary?: AlternativeRouteSummary;
  isFailed: boolean;
  activeInterventions?: InterventionOption[];
  failedRoadIds?: string[];
  onSimulateFailure: (roadId: string) => void;
  onRestoreRoad: (roadId: string) => void;
  onProtectRoad?: (roadId: string) => void;
  onUnprotectRoad?: (roadId: string) => void;
  onOpenHospitalAccess?: () => void;
  onClose: () => void;
}

export const AssetInspector: React.FC<AssetInspectorProps> = ({
  selectedRoad,
  selectedNode,
  selectedHospital,
  roadState = 'NORMAL',
  stressMetric,
  alternativeSummary,
  isFailed,
  activeInterventions = [],
  failedRoadIds = [],
  onSimulateFailure,
  onRestoreRoad,
  onProtectRoad,
  onUnprotectRoad,
  onOpenHospitalAccess,
  onClose
}) => {
  if (!selectedRoad && !selectedNode && !selectedHospital) return null;

  // Check if current road is protected by an active intervention
  const compatibleIntervention = useMemo(() => {
    if (!selectedRoad) return null;
    return INTERVENTIONS.find(int => int.targetRoadIds.includes(selectedRoad.id)) || null;
  }, [selectedRoad]);

  const isProtected = useMemo(() => {
    if (!selectedRoad) return false;
    return activeInterventions.some(int => int.targetRoadIds.includes(selectedRoad.id)) || roadState === 'PROTECTED';
  }, [selectedRoad, activeInterventions, roadState]);

  // Deterministic before vs after protection metrics
  const protectionComparison = useMemo(() => {
    if (!selectedRoad || !isProtected) return null;

    const baseFailures = failedRoadIds.length > 0 ? failedRoadIds : [selectedRoad.id];
    const unmitigated = calculateDynamicCascade(baseFailures, []);
    const mitigated = calculateDynamicCascade(baseFailures, activeInterventions);

    const unmitigatedDisplaced = baseFailures.reduce((sum, id) => sum + (ROADS.find(r => r.id === id)?.normalVolumeVph || 0), 0);
    const mitigatedDisplaced = (mitigated.roadStressMetrics || [])
      .filter(m => baseFailures.includes(m.roadId) && m.state === 'FAILED')
      .reduce((sum, m) => sum + m.baseVolumeVph, 0);

    const unmitigatedPeak = Math.max(0, ...(unmitigated.roadStressMetrics || []).map(m => m.volumeCapacityRatio));
    const mitigatedPeak = Math.max(0, ...(mitigated.roadStressMetrics || []).map(m => m.volumeCapacityRatio));

    return {
      risBefore: unmitigated.details.score,
      risAfter: mitigated.details.score,
      routesBefore: unmitigated.details.affectedRoutesCount,
      routesAfter: mitigated.details.affectedRoutesCount,
      bottlenecksBefore: unmitigated.details.secondaryBottlenecksCount,
      bottlenecksAfter: mitigated.details.secondaryBottlenecksCount,
      hospitalBefore: unmitigated.stepData.hospitalAverageLatencyMinutes,
      hospitalAfter: mitigated.stepData.hospitalAverageLatencyMinutes,
      displacedBefore: unmitigatedDisplaced,
      displacedAfter: mitigatedDisplaced,
      peakVcBefore: unmitigatedPeak,
      peakVcAfter: mitigatedPeak
    };
  }, [selectedRoad, isProtected, failedRoadIds, activeInterventions]);

  const stateDef = STATE_DEFINITIONS[roadState] || STATE_DEFINITIONS.NORMAL || {
    label: roadState,
    badgeText: roadState,
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-950/80',
    borderColor: 'border-cyan-600',
    description: 'Operating within design capacity under free-flow conditions.'
  };

  const vcRatio = stressMetric ? stressMetric.volumeCapacityRatio : (isFailed ? 0 : 0.7);

  return (
    <div 
      id="asset-inspector-popover"
      className="absolute top-4 right-4 z-20 w-92 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl animate-fade-in text-xs max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            selectedHospital ? 'bg-rose-950 text-rose-400 border border-rose-700' :
            isProtected ? 'bg-emerald-950 text-emerald-400 border border-emerald-600 shadow-sm shadow-emerald-950' :
            isFailed ? 'bg-rose-950 text-rose-400 border border-rose-700' : 
            'bg-cyan-950 text-cyan-400 border border-cyan-700'
          }`}>
            {selectedHospital ? <Hospital className="w-4 h-4" /> :
             isProtected ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> :
             selectedRoad ? <Route className="w-4 h-4" /> : 
             <Activity className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
              {selectedHospital ? 'Emergency Health Facility' :
               isProtected ? 'Protected Infrastructure Asset' :
               selectedRoad ? 'Infrastructure Link' : 
               'Network Node'}
            </span>
            <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
              {selectedHospital?.name || selectedRoad?.name || selectedNode?.name}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hospital Facility Details */}
      {selectedHospital && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px]">Trauma Capacity</span>
              <div className="font-bold text-slate-200">{selectedHospital.beds} Beds ({selectedHospital.traumaBays} Trauma Bays)</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Survival Window</span>
              <div className="font-bold text-rose-400">{selectedHospital.emergencyThresholdMinutes} min Cutoff</div>
            </div>
          </div>

          {onOpenHospitalAccess && (
            <button
              onClick={onOpenHospitalAccess}
              className="w-full py-2 px-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs"
            >
              <span>Inspect Emergency Lifeline Corridors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Road Link Details */}
      {selectedRoad && (
        <div className="mt-3 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">Operational State:</span>
            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
              isProtected ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600' :
              isFailed ? 'bg-rose-950 text-rose-300 border-rose-700' :
              `${stateDef.bgColor || 'bg-slate-900'} ${stateDef.textColor || 'text-slate-300'} border-slate-700`
            }`}>
              {isProtected ? 'PROTECTED' : isFailed ? 'FAILED / IMPASSABLE' : (stateDef.badgeText || 'OPERATIONAL')}
            </span>
          </div>

          {/* 1. ACTIVE PROTECTION NOTIFICATION & BEFORE/AFTER DELTA (STEP 7 & 8) */}
          {isProtected && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600 space-y-2 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PROTECTION ACTIVE</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-500 font-bold">
                  Defended
                </span>
              </div>

              {compatibleIntervention && (
                <div>
                  <div className="text-[11px] font-bold text-white leading-snug">
                    {compatibleIntervention.name}
                  </div>
                  <p className="text-[10px] text-emerald-300/80 mt-0.5 leading-relaxed">
                    {compatibleIntervention.tagline}
                  </p>
                </div>
              )}

              <div className="text-[10px] text-emerald-300 font-mono pt-1 border-t border-emerald-800/80">
                ✓ Corridor failure prevented • Baseline traffic throughput maintained.
              </div>

              {/* Compact UNPROTECTED → PROTECTED Resilience Delta Table */}
              {protectionComparison && (
                <div className="pt-2 border-t border-emerald-800/80 space-y-1 text-[10px] font-mono">
                  <div className="text-[9px] font-bold uppercase text-slate-400 flex justify-between pb-0.5">
                    <span>Resilience Impact Delta</span>
                    <span className="text-cyan-400">Unprotected → Protected</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Ripple Impact Score:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.risBefore}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.risAfter}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Routes:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.routesBefore}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.routesAfter}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Secondary Bottlenecks:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.bottlenecksBefore}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.bottlenecksAfter}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Network V/C:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.peakVcBefore.toFixed(2)}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.peakVcAfter.toFixed(2)}</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Hospital Trauma Access:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.hospitalBefore}m</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.hospitalAfter}m</span>
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Displaced Traffic:</span>
                    <span>
                      <span className="text-rose-400 font-bold">{protectionComparison.displacedBefore.toLocaleString()} vph</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-emerald-400 font-bold">{protectionComparison.displacedAfter.toLocaleString()} vph</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-time Traffic Stress Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">V/C Ratio</span>
              <span className={`font-bold text-xs ${
                isProtected ? 'text-emerald-400' :
                isFailed ? 'text-rose-400' : 
                vcRatio >= 1.0 ? 'text-rose-400' : 
                vcRatio >= 0.8 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {isProtected ? `${vcRatio.toFixed(2)} (Safe)` : isFailed ? '0 (Severed)' : vcRatio.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Current Flow</span>
              <span className="font-bold text-slate-200 text-xs">
                {stressMetric ? stressMetric.currentVolumeVph.toLocaleString() : (isFailed ? '0' : selectedRoad.normalVolumeVph.toLocaleString())}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Effective Cap</span>
              <span className="font-bold text-slate-200 text-xs">
                {stressMetric ? stressMetric.effectiveCapacityVph.toLocaleString() : (isFailed ? '0' : selectedRoad.baseCapacityVph.toLocaleString())}
              </span>
            </div>
          </div>

          {/* Road Specs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px]">Corridor Type</span>
              <div className="font-bold text-slate-200">{selectedRoad.type}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Segment Length</span>
              <div className="font-bold text-slate-200">{selectedRoad.baseLengthKm} km</div>
            </div>
          </div>

          {/* Hospital Lifeline Badge */}
          {selectedRoad.isHospitalCorridor && (
            <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-center gap-1.5 text-purple-300 text-[11px] font-medium">
              <Hospital className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Designated Emergency Trauma Hospital Lifeline</span>
            </div>
          )}

          {/* Role in Cascade */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Role in Cascade Dynamics</span>
            <p className="text-slate-300 leading-relaxed">
              {selectedRoad.id === 'R_SILK_BOARD_JUNCTION' 
                ? 'Primary Failure Trigger: Inundation depression where Raja Kaluve stormwater ponds, cutting 3,100 vph.'
                : selectedRoad.isHospitalCorridor 
                ? 'Hospital Lifeline: Critical ambulance transit conduit connecting HSR and BTM to St. John’s Trauma Center.'
                : selectedRoad.id === 'R_ORR_AGARA_CORRIDOR' || selectedRoad.id === 'R_HSR_27TH_MAIN'
                ? 'Redistribution Chokepoint: Absorbs +2,150 vph of diverted traffic, driving V/C ratio past capacity.'
                : 'Arterial Segment: Secondary redistribution vector contributing to regional queue propagation.'}
            </p>
          </div>

          {/* Action Buttons: Simulate Failure / Restore / Protect */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {/* If Protected: Allow removing protection */}
            {isProtected ? (
              <button
                id="remove-protection-btn"
                onClick={() => onUnprotectRoad && onUnprotectRoad(selectedRoad.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold transition shadow-sm text-xs"
                title="Deactivate protective counter-measure for this corridor"
              >
                <ShieldX className="w-3.5 h-3.5 text-amber-400" />
                <span>Remove Protection (Revert to Baseline)</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Failure / Restore Controls */}
                {isFailed ? (
                  <button
                    onClick={() => onRestoreRoad(selectedRoad.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Road Connection</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSimulateFailure(selectedRoad.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-950 text-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Simulate Failure</span>
                  </button>
                )}

                {/* Protect Corridor Button */}
                {compatibleIntervention ? (
                  <button
                    id="protect-corridor-btn"
                    onClick={() => onProtectRoad && onProtectRoad(selectedRoad.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition shadow-md text-xs"
                    title={`Deploy ${compatibleIntervention.name}`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Protect Corridor ({compatibleIntervention.id.replace('INT_', '').replace(/_/g, ' ')})</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Protection unavailable: No compatible intervention is configured for this corridor.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Node Details */}
      {selectedNode && (
        <div className="mt-3 space-y-2 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Node Type:</span>
            <span className="font-mono text-cyan-400 font-bold">{selectedNode.type}</span>
          </div>
          {selectedNode.notes && (
            <p className="text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
              {selectedNode.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
