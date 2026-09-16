import React, { useState, useEffect } from 'react';
import { 
  Hospital, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { HospitalFacility, ZoneData, CascadeStep, InterventionOption } from '../../types';
import { HOSPITALS, ZONES } from '../../data/networkData';
import { fetchHospitalBrief } from '../../services/aiService';

interface HospitalAccessViewProps {
  currentStep: CascadeStep;
  activeInterventions: InterventionOption[];
  onFocusCorridors: () => void;
}

export const HospitalAccessView: React.FC<HospitalAccessViewProps> = ({
  currentStep,
  activeInterventions,
  onFocusCorridors
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(HOSPITALS[0].id);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  const selectedHospital = HOSPITALS.find(h => h.id === selectedHospitalId) || HOSPITALS[0];

  // Calculate metrics for BEFORE DISRUPTION vs AFTER DISRUPTION vs AFTER INTERVENTION
  const isBaseline = currentStep.stepIndex === 0;
  const isIntervened = activeInterventions.length > 0;

  // Before disruption metrics
  const beforeMetrics = {
    viableCorridors: 4,
    fastestRouteMinutes: 4.5,
    averageLatencyMinutes: 6.5,
    zonesBreachingThreshold: 0
  };

  // Disrupted metrics (without intervention at peak cascade)
  const disruptedMetrics = {
    viableCorridors: Math.max(1, 4 - currentStep.hospitalSeveredCorridorsCount),
    fastestRouteMinutes: currentStep.stepIndex === 0 ? 4.5 : 17.8,
    averageLatencyMinutes: currentStep.hospitalAverageLatencyMinutes,
    zonesBreachingThreshold: Object.values(currentStep.zoneLatencies).filter((lat): lat is number => typeof lat === 'number' && lat > selectedHospital.emergencyThresholdMinutes).length
  };

  // After intervention metrics (if interventions active)
  const interventionImpactReduction = activeInterventions.reduce((sum, int) => sum + int.hospitalAccessBoostPercent, 0);
  const intervenedMetrics = {
    viableCorridors: Math.min(4, disruptedMetrics.viableCorridors + (isIntervened ? 2 : 0)),
    fastestRouteMinutes: isIntervened 
      ? Number((disruptedMetrics.fastestRouteMinutes * (1 - interventionImpactReduction * 0.005)).toFixed(1))
      : disruptedMetrics.fastestRouteMinutes,
    averageLatencyMinutes: isIntervened 
      ? Number((6.5 + (currentStep.hospitalAverageLatencyMinutes - 6.5) * (1 - Math.min(0.8, interventionImpactReduction / 100))).toFixed(1))
      : currentStep.hospitalAverageLatencyMinutes,
    zonesBreachingThreshold: isIntervened ? 0 : disruptedMetrics.zonesBreachingThreshold
  };

  // Fetch AI Decision-Support Brief from server
  const loadHospitalBrief = async () => {
    setIsAiLoading(true);
    const breachingZoneNames = ZONES
      .filter(z => (currentStep.zoneLatencies[z.id] || z.normalTransitMinutes) > selectedHospital.emergencyThresholdMinutes)
      .map(z => z.name);

    const activeInterventionNames = activeInterventions.map(i => i.name);

    const effectiveLatency = isIntervened ? intervenedMetrics.averageLatencyMinutes : disruptedMetrics.averageLatencyMinutes;
    const effectiveBreaches = isIntervened ? intervenedMetrics.zonesBreachingThreshold : disruptedMetrics.zonesBreachingThreshold;

    const fallbackText = `Emergency transit to ${selectedHospital.name} under ${currentStep.title}: Average response latency reaches ${effectiveLatency} minutes across catchment sectors, with ${effectiveBreaches} zones exceeding the ${selectedHospital.emergencyThresholdMinutes}-minute critical threshold. ${isIntervened ? `Active interventions (${activeInterventionNames.join(', ')}) protect primary arterials and restore patient transit windows.` : 'Critical trauma bypass via elevated corridors is required.'}`;

    const totalAffectedPop = ZONES.reduce((sum, z) => sum + z.population, 0);
    const delayMins = Math.max(0, effectiveLatency - beforeMetrics.averageLatencyMinutes);

    const res = await fetchHospitalBrief({
      hospitalName: selectedHospital.name,
      baselineLatency: beforeMetrics.averageLatencyMinutes,
      currentLatency: effectiveLatency,
      delayMinutes: Number(delayMins.toFixed(1)),
      severedRoutes: currentStep.failedRoadIds,
      affectedPopulation: totalAffectedPop,
      fallbackText
    });

    setAiExplanation(res.explanation);
    setIsAiGenerated(res.isAiGenerated);
    setIsAiLoading(false);
  };

  useEffect(() => {
    loadHospitalBrief();
  }, [selectedHospitalId, currentStep.stepIndex, activeInterventions.length]);

  return (
    <div className="space-y-4">
      {/* Hospital Selector & Header Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-600/50 flex items-center justify-center text-rose-400 shadow-md">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Hospital & Emergency Facility Access Mode
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating emergency vehicle transit and patient survival corridors post-disruption
              </p>
            </div>
          </div>

          {/* Hospital Switcher */}
          <div className="flex items-center gap-2">
            {HOSPITALS.map(hosp => (
              <button
                key={hosp.id}
                onClick={() => setSelectedHospitalId(hosp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedHospitalId === hosp.id
                    ? 'bg-rose-950/80 text-rose-200 border-rose-600/80 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {hosp.name.split(' ')[0]} {hosp.type === 'TRAUMA_CENTER' ? 'Trauma Center' : 'EMS Depot'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Facility Status Summary */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100">{selectedHospital.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">Inpatient Beds: <b className="text-slate-200">{selectedHospital.beds}</b></span>
            <span className="text-slate-400">Trauma Bays: <b className="text-slate-200">{selectedHospital.traumaBays}</b></span>
            <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              Golden Window: {selectedHospital.emergencyThresholdMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* CORE 3-STAGE COMPARISON: BEFORE VS AFTER FAILURE VS AFTER INTERVENTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. BEFORE FAILURE */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
            <span>Stage 1: Normal Operations</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[11px] text-slate-400">Viable Access Corridors</div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {beforeMetrics.viableCorridors} <span className="text-xs text-slate-400 font-normal">routes intact</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Fastest Ambulance Route</div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {beforeMetrics.fastestRouteMinutes} mins
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Average Transit Across Zones</div>
              <div className="text-sm font-semibold font-mono text-slate-300">
                {beforeMetrics.averageLatencyMinutes} mins
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% of citizens within threshold</span>
            </div>
          </div>
        </div>

        {/* 2. AFTER DISASTER DISRUPTION */}
        <div className="bg-slate-900/90 border border-rose-900/50 rounded-xl p-3.5 relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-2 flex items-center justify-between">
            <span>Stage 2: After Flood Disruption</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[11px] text-slate-400">Viable Access Corridors</div>
              <div className="text-xl font-bold font-mono text-rose-300">
                {disruptedMetrics.viableCorridors} <span className="text-xs text-rose-400 font-normal">of 4 remain</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Fastest Remaining Route</div>
              <div className="text-lg font-bold font-mono text-rose-400">
                {disruptedMetrics.fastestRouteMinutes} mins <span className="text-xs font-normal text-rose-400">(+295%)</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Average Transit Delay</div>
              <div className="text-sm font-semibold font-mono text-rose-300">
                {disruptedMetrics.averageLatencyMinutes} mins
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-400 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{disruptedMetrics.zonesBreachingThreshold} zones exceed {selectedHospital.emergencyThresholdMinutes}m threshold</span>
            </div>
          </div>
        </div>

        {/* 3. AFTER INTERVENTION */}
        <div className={`rounded-xl p-3.5 relative overflow-hidden border transition-all ${
          isIntervened 
            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40' 
            : 'bg-slate-900/50 border-slate-800 text-slate-500'
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-2 flex items-center justify-between">
            <span>Stage 3: With Intervention</span>
            <span className={`w-2 h-2 rounded-full ${isIntervened ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[11px] text-slate-400">Viable Access Corridors</div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {intervenedMetrics.viableCorridors} <span className="text-xs text-slate-400 font-normal">restored</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Fastest Route Recovered</div>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {intervenedMetrics.fastestRouteMinutes} mins
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Average Transit Across Zones</div>
              <div className="text-sm font-semibold font-mono text-slate-200">
                {intervenedMetrics.averageLatencyMinutes} mins
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
              {isIntervened ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Trauma access restored to safe window</span>
                </>
              ) : (
                <span className="text-slate-500">Activate interventions in planner to evaluate</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Decision-Support Synthesis Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold text-rose-300 tracking-wider">
              {isAiGenerated ? 'AI Decision-Support Synthesis' : 'Deterministic Engineering Brief'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              (Grounded in deterministic simulation)
            </span>
          </div>

          <button
            id="refresh-hospital-ai-btn"
            onClick={loadHospitalBrief}
            disabled={isAiLoading}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition"
            title="Refresh Hospital Access AI Brief"
          >
            <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-rose-400' : ''}`} />
            <span>{isAiLoading ? 'Analyzing...' : 'Refresh'}</span>
          </button>
        </div>

        <p className="text-slate-200 text-[12px] leading-relaxed">
          {aiExplanation || 'Analyzing emergency patient transit corridors and golden trauma window accessibility...'}
        </p>
      </div>

      {/* ZONE-BY-ZONE TRAUMA TRANSIT LATENCY BARS */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zone-by-Zone Emergency Response Latency</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Measuring ambulance transit from each residential neighbourhood to St. Jude Emergency Bay
            </p>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">
            Emergency Cutoff: {selectedHospital.emergencyThresholdMinutes} min
          </span>
        </div>

        <div className="space-y-3">
          {ZONES.map(zone => {
            const currentLatency = currentStep.zoneLatencies[zone.id] || zone.normalTransitMinutes;
            const isBreaching = currentLatency > selectedHospital.emergencyThresholdMinutes;
            const maxScaleMinutes = 30;
            const widthPct = Math.min(100, (currentLatency / maxScaleMinutes) * 100);
            const baselineWidthPct = (zone.normalTransitMinutes / maxScaleMinutes) * 100;

            return (
              <div key={zone.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{zone.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({zone.population.toLocaleString()} pop)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400">Baseline: {zone.normalTransitMinutes}m</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className={`font-bold ${isBreaching ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentLatency}m
                    </span>
                    {isBreaching && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold">
                        BREACH (+{(currentLatency - selectedHospital.emergencyThresholdMinutes).toFixed(1)}m)
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual bar showing baseline vs current latency */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                  {/* Threshold marker line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                    style={{ left: `${(selectedHospital.emergencyThresholdMinutes / maxScaleMinutes) * 100}%` }}
                    title={`Emergency Threshold (${selectedHospital.emergencyThresholdMinutes}m)`}
                  />
                  {/* Current Latency bar */}
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBreaching ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
