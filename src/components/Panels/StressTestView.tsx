import React, { useState } from 'react';
import { 
  Search, 
  AlertOctagon, 
  Play, 
  ArrowUpRight, 
  ShieldAlert, 
  BarChart3, 
  Info,
  CheckCircle2,
  TrendingUp,
  Activity,
  Table,
  Compass,
  CornerDownRight,
  Filter,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { 
  SinglePointOfFailureResult, 
  RoadLink, 
  RoadStressMetric, 
  AlternativeRouteSummary, 
  InfrastructureState 
} from '../../types';
import { ROADS } from '../../data/networkData';
import { runProactiveStressTest, STATE_DEFINITIONS } from '../../engine/simulationEngine';

interface StressTestViewProps {
  onSimulateAssetFailure: (roadId: string) => void;
  activeDisruptedRoadId: string | null;
  roadStressMetrics?: Record<string, RoadStressMetric>;
  alternativeRoutes?: AlternativeRouteSummary[];
  roadStates?: Record<string, InfrastructureState>;
}

export const StressTestView: React.FC<StressTestViewProps> = ({
  onSimulateAssetFailure,
  activeDisruptedRoadId,
  roadStressMetrics = {},
  alternativeRoutes = [],
  roadStates = {}
}) => {
  const [activeTab, setActiveTab] = useState<'RANKING' | 'STRESS_TABLE' | 'ALTERNATIVES'>('RANKING');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [results] = useState<SinglePointOfFailureResult[]>(() => runProactiveStressTest());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(results[0]?.assetId || '');

  const selectedResult = results.find(r => r.assetId === selectedAssetId) || results[0];

  // Prepare stress metrics list
  const metricsList: RoadStressMetric[] = Object.values(roadStressMetrics);

  const filteredMetrics = metricsList.filter(metric => {
    if (selectedStateFilter === 'ALL') return true;
    return metric.state === selectedStateFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600/50 flex items-center justify-center text-amber-400 shadow-md shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Proactive Stress-Testing & Vulnerability Scanner
              </h3>
              <p className="text-xs text-slate-400">
                Network graph redistribution model evaluating capacity stress, alternative paths, and failure ripples
              </p>
            </div>
          </div>

          {/* Sub-view Nav Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('RANKING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'RANKING'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SPOF Ranking</span>
            </button>
            <button
              onClick={() => setActiveTab('STRESS_TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'STRESS_TABLE'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Capacity Stress Table</span>
            </button>
            <button
              onClick={() => setActiveTab('ALTERNATIVES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ALTERNATIVES'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Alternative Paths ({alternativeRoutes.length})</span>
            </button>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            {activeTab === 'RANKING' && 'Every road segment and bridge is evaluated independently through our graph redistribution model. Select any asset below to preview its failure cascade or click "Simulate Failure" to load it into the live map.'}
            {activeTab === 'STRESS_TABLE' && 'Real-time Volume-to-Capacity (V/C) stress ratios and congestion delays calculated across all corridors following diverted traffic redistribution.'}
            {activeTab === 'ALTERNATIVES' && 'Computed detour routes where displaced traffic is forced when critical bridges or arterial corridors fail.'}
          </span>
        </div>
      </div>

      {/* TAB 1: SPOF RANKING */}
      {activeTab === 'RANKING' && (
        <div className="space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Ranked Potential Single Points of Failure
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {results.length} Critical Assets Scanned
              </span>
            </div>

            <div className="space-y-2.5">
              {results.map(item => {
                const isSelected = selectedAssetId === item.assetId;
                const isCurrentlySimulated = activeDisruptedRoadId === item.assetId;

                const categoryStyle = 
                  item.category === 'SEVERE' ? 'bg-rose-950/80 text-rose-300 border-rose-700' :
                  item.category === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border-amber-700' :
                  item.category === 'MODERATE' ? 'bg-yellow-950/80 text-yellow-300 border-yellow-700' :
                  'bg-emerald-950/80 text-emerald-300 border-emerald-700';

                return (
                  <div
                    key={item.assetId}
                    onClick={() => setSelectedAssetId(item.assetId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono font-extrabold text-xs flex items-center justify-center text-slate-200 shrink-0">
                        #{item.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">
                            {item.assetName}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.assetType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.vulnerabilityFactor}
                        </p>
                      </div>
                    </div>

                    {/* Metrics and Simulation Trigger */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {/* Ripple Category Badge */}
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${categoryStyle}`}>
                        {item.category} (Score: {item.rippleScore})
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSimulateAssetFailure(item.assetId);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                          isCurrentlySimulated
                            ? 'bg-rose-600 text-white border border-rose-400'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isCurrentlySimulated ? 'Simulating' : 'Simulate Failure'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SELECTED ASSET DEEP-DIVE CARD */}
          {selectedResult && (
            <div className="bg-slate-900/95 border border-cyan-800/50 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                    Vulnerability Assessment Dossier
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {selectedResult.assetName} (Rank #{selectedResult.rank} Vulnerability)
                  </h4>
                </div>
                <button
                  onClick={() => onSimulateAssetFailure(selectedResult.assetId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Stress-Test in Simulator</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Ripple Score</span>
                  <div className="font-mono text-xl font-extrabold text-white mt-0.5">
                    {selectedResult.rippleScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Secondary Bottlenecks</span>
                  <div className="font-mono text-xl font-extrabold text-amber-400 mt-0.5">
                    {selectedResult.secondaryBottlenecksCount} junctions
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Trauma Delay Surge</span>
                  <div className="font-mono text-xl font-extrabold text-rose-400 mt-0.5">
                    +{selectedResult.hospitalLatencyDelayMinutes}m
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Zones In Breach</span>
                  <div className="font-mono text-xl font-extrabold text-purple-400 mt-0.5">
                    {selectedResult.affectedZonesCount} zones
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                <b className="text-cyan-400">Strategic Finding: </b>
                {selectedResult.vulnerabilityFactor} Disruption creates immediate cascading queue spillover into neighboring residential sectors. Pre-disaster reinforcement or designated alternate emergency bypass routing is strongly advised.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAPACITY STRESS TABLE */}
      {activeTab === 'STRESS_TABLE' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Network Redistribution & Volume/Capacity Stress
              </h4>
            </div>

            {/* State Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px] mr-1">Filter State:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'FAILED', label: 'FAILED' },
                { id: 'HIGH_PRESSURE', label: 'HIGH PRESSURE' },
                { id: 'AT_RISK', label: 'AT RISK' },
                { id: 'CRITICAL_ACCESS', label: 'CRITICAL ACCESS' },
                { id: 'NORMAL', label: 'NORMAL' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedStateFilter(chip.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    selectedStateFilter === chip.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">State Definition</th>
                <th className="py-2.5 px-3">Baseline Vol</th>
                <th className="py-2.5 px-3">Diverted Vol</th>
                <th className="py-2.5 px-3">Current Vol</th>
                <th className="py-2.5 px-3">Capacity</th>
                <th className="py-2.5 px-3">V/C Ratio</th>
                <th className="py-2.5 px-3">Delay Surge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMetrics.map(metric => {
                const stateDef = STATE_DEFINITIONS[metric.state] || {
                  label: metric.state,
                  badgeText: metric.state,
                  textColor: 'text-slate-400',
                  bgColor: 'bg-slate-900',
                  borderColor: 'border-slate-700',
                  description: ''
                };

                const isOverloaded = metric.volumeCapacityRatio >= 1.0;

                return (
                  <tr key={metric.roadId} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-100">{metric.roadName}</div>
                      <div className="text-[10px] text-slate-400">{metric.roadId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${stateDef.bgColor} ${stateDef.textColor} ${stateDef.borderColor}`}>
                        {stateDef.badgeText}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {metric.baseVolumeVph} vph
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {metric.addedDivertedVolumeVph > 0 ? (
                        <span className="text-amber-400">+{metric.addedDivertedVolumeVph} vph</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                      {metric.currentVolumeVph} vph
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {metric.effectiveCapacityVph} vph
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              metric.volumeCapacityRatio >= 1.05 ? 'bg-amber-500' :
                              metric.volumeCapacityRatio >= 0.80 ? 'bg-orange-500' :
                              'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, (metric.volumeCapacityRatio / 1.5) * 100)}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold text-[11px] ${
                          isOverloaded ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                          {(metric.volumeCapacityRatio * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {metric.delayIncreasePercent > 0 ? (
                        <span className="text-rose-400">+{metric.delayIncreasePercent}%</span>
                      ) : (
                        <span className="text-emerald-400">0%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ALTERNATIVE ROUTES */}
      {activeTab === 'ALTERNATIVES' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Calculated Alternative Routes & Displaced Volume Apportionment
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              {alternativeRoutes.length} failed link diversion summaries active
            </span>
          </div>

          {alternativeRoutes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No road failures currently active. All traffic is flowing normally across primary routes.</p>
              <p className="mt-1 text-slate-500">Select any corridor on the map or choose a stress test above to simulate link diversion.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alternativeRoutes.map(summary => (
                <div key={summary.failedRoadId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                          FAILED LINK
                        </span>
                        <span className="font-bold text-sm text-slate-100">{summary.failedRoadName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Displaced Volume: <b className="text-amber-400 font-mono">{summary.primaryDisplacedVolumeVph} vph</b> forced into surrounding alternate grid
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {summary.alternativePaths.map((alt, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
                            {alt.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            +{alt.divertedVolumeVph} vph ({alt.divertedPercent}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {alt.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                          <span>Transit: {alt.transitTimeMinutes} min</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold">
                            {alt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
