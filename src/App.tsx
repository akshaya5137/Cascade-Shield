import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Hospital, 
  Wrench, 
  GitCompare, 
  Search, 
  Layers, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
  MapPin,
  Sparkles,
  Network
} from 'lucide-react';
import { 
  ActiveAppMode, 
  RoadLink, 
  NetworkNode, 
  InfrastructureState, 
  InterventionOption,
  RoadStressMetric,
  HospitalFacility
} from './types';
import { 
  ROADS, 
  NODES, 
  ZONES, 
  HOSPITALS, 
  INTERVENTIONS, 
  STUDY_AREA_INFO 
} from './data/networkData';
import { 
  PREBUILT_CASCADE_STEPS, 
  calculateDynamicCascade,
  runResilientCascadeSimulation
} from './engine/simulationEngine';

import { Header } from './components/Header';
import { StudyAreaContextBar } from './components/Panels/StudyAreaContextBar';
import { CascadeMap } from './components/Map/CascadeMap';
import { RippleTimeline } from './components/Timeline/RippleTimeline';
import { RippleImpactScoreCard } from './components/Panels/RippleImpactScoreCard';
import { HospitalAccessView } from './components/Panels/HospitalAccessView';
import { InterventionPlanner } from './components/Panels/InterventionPlanner';
import { BeforeAfterComparison } from './components/Panels/BeforeAfterComparison';
import { StressTestView } from './components/Panels/StressTestView';
import { MultiCorridorAnalysisView } from './components/Panels/MultiCorridorAnalysisView';
import { RiskProfileModal } from './components/Panels/RiskProfileModal';
import { DataProvenanceModal } from './components/Panels/DataProvenanceModal';
import { AssetInspector } from './components/Panels/AssetInspector';
import { GuidedDemoBar, HACKATHON_DEMO_STEPS } from './components/Demo/GuidedDemoBar';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // App navigation mode
  const [activeMode, setActiveMode] = useState<ActiveAppMode>('CASCADE_SIMULATION');

  // Drawer / UX layout states
  const [isFocusMap, setIsFocusMap] = useState<boolean>(false);
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState<boolean>(true);
  const [isTimelineCompact, setIsTimelineCompact] = useState<boolean>(false);
  const [isStudyAreaBarCollapsed, setIsStudyAreaBarCollapsed] = useState<boolean>(false);

  // Timeline / Step State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Custom Disruption overrides (if user clicks on map or proactive stress-test)
  const [customDisabledRoadIds, setCustomDisabledRoadIds] = useState<string[] | null>(null);

  // Active Interventions & Budget Units
  const [maxBudgetUnits, setMaxBudgetUnits] = useState<number>(3);
  const [activeInterventionIds, setActiveInterventionIds] = useState<string[]>([]);

  // Selected Road, Node, or Hospital for inspection
  const [selectedRoad, setSelectedRoad] = useState<RoadLink | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(null);

  // Map layer controls
  const [showInundationZone, setShowInundationZone] = useState<boolean>(true);
  const [showHospitalCorridorsOnly, setShowHospitalCorridorsOnly] = useState<boolean>(false);

  // Modals & Guided Demo
  const [isRiskProfileOpen, setIsRiskProfileOpen] = useState<boolean>(false);
  const [isDataProvenanceOpen, setIsDataProvenanceOpen] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);
  const [demoAutoPlay, setDemoAutoPlay] = useState<boolean>(false);
  const [beforeAfterMapPreview, setBeforeAfterMapPreview] = useState<'UNMITIGATED' | 'MITIGATED'>('MITIGATED');

  // Current active interventions objects
  const activeInterventions = useMemo(() => {
    return INTERVENTIONS.filter(int => activeInterventionIds.includes(int.id));
  }, [activeInterventionIds]);

  // Derive simulation step, ripple details, stress metrics, and alternative routes
  const { currentStep, rippleDetails, roadStates, roadStressMetrics, alternativeRoutes } = useMemo(() => {
    // When in Before vs After Comparison, allow live map preview toggle between unmitigated and mitigated
    if (activeMode === 'BEFORE_AFTER_COMPARISON') {
      const targetFailedRoadIds = customDisabledRoadIds !== null 
        ? customDisabledRoadIds 
        : ['R_SILK_BOARD_JUNCTION'];
      const sim = beforeAfterMapPreview === 'UNMITIGATED'
        ? runResilientCascadeSimulation(targetFailedRoadIds, [])
        : runResilientCascadeSimulation(targetFailedRoadIds, activeInterventions);
      return {
        currentStep: sim.stepData,
        rippleDetails: sim.details,
        roadStates: sim.roadStates,
        roadStressMetrics: sim.roadStressMetrics,
        alternativeRoutes: sim.alternativeRoutes
      };
    }

    // If user has set custom disabled roads via stress testing or map clicking
    if (customDisabledRoadIds !== null) {
      const result = runResilientCascadeSimulation(customDisabledRoadIds, activeInterventions);
      return {
        currentStep: result.stepData,
        rippleDetails: result.details,
        roadStates: result.roadStates,
        roadStressMetrics: result.roadStressMetrics,
        alternativeRoutes: result.alternativeRoutes
      };
    }

    // Otherwise, use prebuilt realistic cascade progression with active interventions applied
    const baseStep = PREBUILT_CASCADE_STEPS[currentStepIndex] || PREBUILT_CASCADE_STEPS[0];
    
    // When interventions are active, simulate mitigated step
    if (activeInterventions.length > 0) {
      const result = runResilientCascadeSimulation(baseStep.failedRoadIds, activeInterventions);
      return {
        currentStep: {
          ...result.stepData,
          stepIndex: currentStepIndex,
          title: baseStep.title,
          timeOffsetMinutes: baseStep.timeOffsetMinutes,
          summary: baseStep.summary,
          triggerEvent: baseStep.triggerEvent
        },
        rippleDetails: result.details,
        roadStates: result.roadStates,
        roadStressMetrics: result.roadStressMetrics,
        alternativeRoutes: result.alternativeRoutes
      };
    }

    // Standard unmitigated prebuilt step
    const standardCalc = calculateDynamicCascade(baseStep.failedRoadIds, []);
    return {
      currentStep: baseStep,
      rippleDetails: standardCalc.details,
      roadStates: standardCalc.roadStates,
      roadStressMetrics: standardCalc.roadStressMetrics,
      alternativeRoutes: standardCalc.alternativeRoutes
    };
  }, [customDisabledRoadIds, currentStepIndex, activeInterventions, activeMode, beforeAfterMapPreview]);

  // Road stress metric record map
  const roadStressMetricsRecord = useMemo(() => {
    const record: Record<string, RoadStressMetric> = {};
    roadStressMetrics.forEach(m => {
      record[m.roadId] = m;
    });
    return record;
  }, [roadStressMetrics]);

  // Calculation for Before vs After comparison
  const { unmitigatedStep, unmitigatedDetails, intervenedStep, intervenedDetails } = useMemo(() => {
    const targetFailedRoadIds = customDisabledRoadIds !== null 
      ? customDisabledRoadIds 
      : ['R_SILK_BOARD_JUNCTION'];

    const unmitigated = runResilientCascadeSimulation(targetFailedRoadIds, []);
    const intervened = runResilientCascadeSimulation(targetFailedRoadIds, activeInterventions);

    return {
      unmitigatedStep: unmitigated.stepData,
      unmitigatedDetails: unmitigated.details,
      intervenedStep: intervened.stepData,
      intervenedDetails: intervened.details
    };
  }, [customDisabledRoadIds, activeInterventions]);

  // Autoplay simulation timeline timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = playbackSpeed === 2 ? 1400 : 2600;
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= PREBUILT_CASCADE_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Guided demo sequence effects
  useEffect(() => {
    if (!isDemoActive) return;

    const demoConfig = HACKATHON_DEMO_STEPS.find(s => s.stepNumber === currentDemoStep);
    if (!demoConfig) return;

    // Apply demo step configuration
    setActiveMode(demoConfig.targetAppMode);
    setCurrentStepIndex(demoConfig.simulationStepIndex);
    setIsAnalysisDrawerOpen(true);

    if (demoConfig.applyInterventions) {
      setActiveInterventionIds(demoConfig.applyInterventions);
    } else if (demoConfig.stepNumber <= 10) {
      setActiveInterventionIds([]);
      setCustomDisabledRoadIds(null);
    }

    if (demoConfig.stepNumber === 7 || demoConfig.stepNumber === 8) {
      setShowHospitalCorridorsOnly(true);
    } else {
      setShowHospitalCorridorsOnly(false);
    }

    if (demoConfig.stepNumber >= 2) {
      setShowInundationZone(true);
    } else {
      setShowInundationZone(false);
    }

    if (demoConfig.roadHighlightId) {
      const road = ROADS.find(r => r.id === demoConfig.roadHighlightId);
      if (road) {
        setSelectedRoad(road);
        setSelectedNode(null);
        setSelectedHospital(null);
      }
    } else {
      setSelectedRoad(null);
      setSelectedNode(null);
    }
  }, [isDemoActive, currentDemoStep]);

  // Autoplay demo steps timer
  useEffect(() => {
    if (!isDemoActive || !demoAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentDemoStep(prev => {
        if (prev >= HACKATHON_DEMO_STEPS.length) {
          setDemoAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [isDemoActive, demoAutoPlay]);

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRoad || selectedNode) {
          setSelectedRoad(null);
          setSelectedNode(null);
        } else if (isFocusMap) {
          setIsFocusMap(false);
        } else if (isAnalysisDrawerOpen && activeMode !== 'CASCADE_SIMULATION') {
          setIsAnalysisDrawerOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRoad, selectedNode, isFocusMap, isAnalysisDrawerOpen, activeMode]);

  // Handlers
  const handleTogglePlay = () => {
    if (currentStepIndex >= PREBUILT_CASCADE_STEPS.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCustomDisabledRoadIds(null);
    setSelectedRoad(null);
    setSelectedNode(null);
  };

  const handleToggleSpeed = () => {
    setPlaybackSpeed(prev => (prev === 1 ? 2 : 1));
  };

  const handleToggleIntervention = (interventionId: string) => {
    setActiveInterventionIds(prev => {
      if (prev.includes(interventionId)) {
        return prev.filter(id => id !== interventionId);
      } else {
        const item = INTERVENTIONS.find(i => i.id === interventionId);
        const currentCost = INTERVENTIONS
          .filter(i => prev.includes(i.id))
          .reduce((sum, i) => sum + i.costUnits, 0);
        
        if (item && currentCost + item.costUnits > maxBudgetUnits) {
          return prev;
        }
        return [...prev, interventionId];
      }
    });
  };

  const handleSimulateFailure = (roadId: string) => {
    setCustomDisabledRoadIds(prev => {
      const list = prev ? [...prev] : [currentStep.failedRoadIds[0] || 'R_SILK_BOARD_JUNCTION'];
      if (!list.includes(roadId)) list.push(roadId);
      return list;
    });
  };

  const handleRestoreRoad = (roadId: string) => {
    setCustomDisabledRoadIds(prev => {
      if (!prev) return null;
      const next = prev.filter(id => id !== roadId);
      return next.length > 0 ? next : null;
    });
  };

  const handleSimulateAssetFromStressTest = (roadId: string) => {
    setCustomDisabledRoadIds([roadId]);
    setActiveMode('CASCADE_SIMULATION');
    setIsAnalysisDrawerOpen(true);
    const roadObj = ROADS.find(r => r.id === roadId);
    if (roadObj) setSelectedRoad(roadObj);
  };

  const handleApplyPresetOptimal = () => {
    setActiveInterventionIds(['INT_SILK_BOARD_SUMP', 'INT_ELEVATED_EMERGENCY_LANE']);
  };

  const handleProtectRoad = (roadId: string) => {
    const matching = INTERVENTIONS.find(i => i.targetRoadIds.includes(roadId));
    if (!matching) return;

    setActiveInterventionIds(prev => {
      if (!prev.includes(matching.id)) {
        return [...prev, matching.id];
      }
      return prev;
    });
  };

  const handleUnprotectRoad = (roadId: string) => {
    const matching = INTERVENTIONS.find(i => i.targetRoadIds.includes(roadId));
    if (!matching) return;

    setActiveInterventionIds(prev => prev.filter(id => id !== matching.id));
  };

  // Header Mode Change: Toggle drawer if clicking already active tab, otherwise switch & open
  const handleHeaderModeChange = (mode: ActiveAppMode) => {
    if (isFocusMap) {
      setIsFocusMap(false);
    }
    if (activeMode === mode) {
      setIsAnalysisDrawerOpen(!isAnalysisDrawerOpen);
    } else {
      setActiveMode(mode);
      setIsAnalysisDrawerOpen(true);
    }
  };

  // Focus Map Toggle
  const handleToggleFocusMap = () => {
    setIsFocusMap(!isFocusMap);
    if (!isFocusMap) {
      setIsAnalysisDrawerOpen(false);
    }
  };

  const getDrawerTitle = () => {
    switch (activeMode) {
      case 'CASCADE_SIMULATION':
        return {
          title: 'Cascade Simulation Dossier',
          subtitle: 'Step-by-step failure progression & transparent ripple scoring',
          icon: <Activity className="w-4 h-4 text-cyan-400" />
        };
      case 'MULTI_CORRIDOR_ANALYSIS':
        return {
          title: 'Multi-Corridor Strategic Analysis',
          subtitle: 'Side-by-side volume comparisons & compound failure testing',
          icon: <Network className="w-4 h-4 text-cyan-400" />
        };
      case 'HOSPITAL_ACCESS':
        return {
          title: 'Hospital & Emergency Lifeline Analysis',
          subtitle: 'St. John’s Medical College Hospital trauma access & threshold breaches',
          icon: <Hospital className="w-4 h-4 text-purple-400" />
        };
      case 'INTERVENTION_PLANNER':
        return {
          title: 'Intervention Engine & Counter-Measures',
          subtitle: 'Budget allocation, pump deployment & viaduct bypass corridors',
          icon: <Wrench className="w-4 h-4 text-cyan-400" />
        };
      case 'BEFORE_AFTER_COMPARISON':
        return {
          title: 'Before vs After Intervention Comparison',
          subtitle: 'Quantifiable resilience delta & casualty transit recovery',
          icon: <GitCompare className="w-4 h-4 text-purple-400" />
        };
      case 'PROACTIVE_STRESS_TEST':
        return {
          title: 'Proactive Infrastructure Stress-Test',
          subtitle: 'Ranked vulnerability index & alternative route viability',
          icon: <Search className="w-4 h-4 text-cyan-400" />
        };
      default:
        return {
          title: 'Cascade Resilience Dossier',
          subtitle: 'Deterministic cascade infrastructure modeling',
          icon: <Activity className="w-4 h-4 text-cyan-400" />
        };
    }
  };

  const drawerInfo = getDrawerTitle();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        activeMode={activeMode}
        onModeChange={handleHeaderModeChange}
        onOpenRiskProfile={() => setIsRiskProfileOpen(true)}
        onOpenDataProvenance={() => setIsDataProvenanceOpen(true)}
        onStartDemo={() => {
          setIsDemoActive(true);
          setCurrentDemoStep(1);
        }}
        isDemoActive={isDemoActive}
        networkStressLevel={currentStep.networkStressLevel}
        rippleScore={rippleDetails.score}
        isFocusMap={isFocusMap}
        onToggleFocusMap={handleToggleFocusMap}
        isAnalysisDrawerOpen={isAnalysisDrawerOpen}
      />

      {/* Context Bar: Collapsible study area bar (hidden in Focus Map mode) */}
      {!isFocusMap && !isStudyAreaBarCollapsed && (
        <div className="relative">
          <StudyAreaContextBar 
            onOpenRiskProfile={() => setIsRiskProfileOpen(true)}
            onNavigateToHospitalAccess={() => {
              setActiveMode('HOSPITAL_ACCESS');
              setIsAnalysisDrawerOpen(true);
            }}
            onNavigateToInterventions={() => {
              setActiveMode('INTERVENTION_PLANNER');
              setIsAnalysisDrawerOpen(true);
            }}
          />
          <button
            onClick={() => setIsStudyAreaBarCollapsed(true)}
            className="absolute top-2 right-2 text-[10px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 z-30 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800"
            title="Minimize Context Bar"
          >
            <span>Hide Bar</span>
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Compact Context Ribbon when collapsed */}
      {!isFocusMap && isStudyAreaBarCollapsed && (
        <div className="h-6 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-200">{STUDY_AREA_INFO.locality}</span>
            <span className="text-slate-500">• 110mm Monsoon Cloudburst Simulation</span>
          </div>
          <button
            onClick={() => setIsStudyAreaBarCollapsed(false)}
            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Show Details</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Guided Hackathon Pitch Story Bar (if active) */}
      {isDemoActive && (
        <GuidedDemoBar
          currentDemoStep={currentDemoStep}
          onSelectDemoStep={setCurrentDemoStep}
          onCloseDemo={() => setIsDemoActive(false)}
          autoPlay={demoAutoPlay}
          onToggleAutoPlay={() => setDemoAutoPlay(!demoAutoPlay)}
        />
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center: Primary Interactive Map Area */}
        <div className={`h-full transition-all duration-300 relative flex flex-col ${
          isFocusMap || !isAnalysisDrawerOpen ? 'w-full' : activeMode === 'MULTI_CORRIDOR_ANALYSIS' ? 'w-full lg:w-1/2 xl:w-2/5' : 'w-full lg:w-3/5 xl:w-7/12'
        }`}>
          {/* Floating Layer Controls (Top Right of Map) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs shadow-lg pointer-events-auto">
            <button
              onClick={() => setShowInundationZone(!showInundationZone)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                showInundationZone ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Flood Inundation Hazard Polygon"
            >
              {showInundationZone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Flood Zone</span>
            </button>

            <button
              onClick={() => setShowHospitalCorridorsOnly(!showHospitalCorridorsOnly)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition font-medium text-[11px] ${
                showHospitalCorridorsOnly ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-white'
              }`}
              title="Filter Hospital Emergency Corridors"
            >
              <Hospital className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Lifelines</span>
            </button>

            {customDisabledRoadIds !== null && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-amber-300 border border-amber-600/50 hover:bg-slate-700 font-medium transition text-[11px]"
                title="Clear Custom Failures"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Custom</span>
              </button>
            )}

            {/* If Drawer is Closed, show Quick Open Drawer Button */}
            {!isAnalysisDrawerOpen && !isFocusMap && (
              <button
                onClick={() => setIsAnalysisDrawerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition shadow-sm ml-1"
                title="Open Analysis Drawer"
              >
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span>Open Panel</span>
              </button>
            )}
          </div>

          {/* Leaflet Map Centerpiece */}
          <div className="flex-1 w-full h-full relative">
            <CascadeMap
              roads={ROADS}
              nodes={NODES}
              zones={ZONES}
              hospitals={HOSPITALS}
              roadStates={roadStates}
              bottleneckNodeIds={currentStep.bottleneckNodeIds}
              failedRoadIds={currentStep.failedRoadIds}
              selectedRoadId={selectedRoad?.id || null}
              onSelectRoad={(road) => {
                setSelectedRoad(road);
                setSelectedNode(null);
                setSelectedHospital(null);
              }}
              onSelectNode={(node) => {
                setSelectedNode(node);
                setSelectedRoad(null);
                setSelectedHospital(null);
              }}
              onSelectHospital={(hosp) => {
                setSelectedHospital(hosp);
                setSelectedRoad(null);
                setSelectedNode(null);
              }}
              onMapBackgroundClick={() => {
                setSelectedRoad(null);
                setSelectedNode(null);
                setSelectedHospital(null);
              }}
              isDrawerOpen={isAnalysisDrawerOpen && activeMode !== 'CASCADE_SIMULATION'}
              showInundationZone={showInundationZone}
              onToggleInundationZone={() => setShowInundationZone(!showInundationZone)}
              showHospitalCorridorsOnly={showHospitalCorridorsOnly}
              onToggleHospitalCorridors={() => setShowHospitalCorridorsOnly(!showHospitalCorridorsOnly)}
              currentStep={currentStep}
              currentStepIndex={currentStepIndex}
              totalStepsCount={PREBUILT_CASCADE_STEPS.length}
              onSelectStep={setCurrentStepIndex}
              onReplayCascade={handleReset}
              isFocusMap={isFocusMap}
              onToggleFocusMap={handleToggleFocusMap}
              onApplyScenario={(roadIds) => setCustomDisabledRoadIds(roadIds)}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />

            {/* Compact Asset Inspector Popover (Bottom-Left) */}
            {(selectedRoad || selectedNode || selectedHospital) && (
              <AssetInspector
                selectedRoad={selectedRoad}
                selectedNode={selectedNode}
                selectedHospital={selectedHospital}
                roadState={selectedRoad ? roadStates[selectedRoad.id] : undefined}
                stressMetric={selectedRoad ? roadStressMetricsRecord[selectedRoad.id] : undefined}
                alternativeSummary={selectedRoad ? alternativeRoutes.find(a => a.failedRoadId === selectedRoad.id) : undefined}
                isFailed={selectedRoad ? currentStep.failedRoadIds.includes(selectedRoad.id) : false}
                activeInterventions={activeInterventions}
                failedRoadIds={customDisabledRoadIds || currentStep.failedRoadIds}
                onSimulateFailure={handleSimulateFailure}
                onRestoreRoad={handleRestoreRoad}
                onProtectRoad={handleProtectRoad}
                onUnprotectRoad={handleUnprotectRoad}
                onOpenHospitalAccess={() => setActiveMode('HOSPITAL_ACCESS')}
                onClose={() => {
                  setSelectedRoad(null);
                  setSelectedNode(null);
                  setSelectedHospital(null);
                }}
              />
            )}
          </div>

          {/* Bottom Cascade Timeline Bar (Collapsible or Floating in Focus Map) */}
          {!isFocusMap && (
            <div className="p-2 sm:p-3 bg-slate-950/90 border-t border-slate-800 z-10 shrink-0">
              <RippleTimeline
                steps={PREBUILT_CASCADE_STEPS}
                currentStepIndex={currentStepIndex}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onSelectStep={setCurrentStepIndex}
                onReset={handleReset}
                playbackSpeed={playbackSpeed}
                onToggleSpeed={handleToggleSpeed}
                isCompact={isTimelineCompact}
                onToggleCompact={() => setIsTimelineCompact(!isTimelineCompact)}
              />
            </div>
          )}
        </div>

        {/* Right: Collapsible Mode-Specific Intelligence Panels Drawer */}
        {!isFocusMap && isAnalysisDrawerOpen && (
          <div className={`h-full border-l border-slate-800 bg-slate-950/95 overflow-y-auto p-4 flex flex-col gap-4 shadow-2xl transition-all duration-300 ${
            activeMode === 'MULTI_CORRIDOR_ANALYSIS' ? 'w-full lg:w-1/2 xl:w-3/5' : 'w-full lg:w-2/5 xl:w-5/12'
          }`}>
            {/* Drawer Header with Title & Dismiss Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
                  {drawerInfo.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    {drawerInfo.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {drawerInfo.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  id="close-analysis-drawer-btn"
                  onClick={() => setIsAnalysisDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close Drawer (Expand Map)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. CASCADE SIMULATION MODE VIEW */}
            {activeMode === 'CASCADE_SIMULATION' && (
              <div className="space-y-4">
                {/* Ripple Impact Score Card */}
                <RippleImpactScoreCard details={rippleDetails} />

                {/* Quick Action Cards: Interventions & Hospital status */}
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setActiveMode('HOSPITAL_ACCESS')}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-600/60 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        <Hospital className="w-3.5 h-3.5 text-rose-400" />
                        Hospital Latency
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                      {currentStep.hospitalAverageLatencyMinutes} min
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {Object.values(currentStep.zoneLatencies).filter((l): l is number => typeof l === 'number' && l > 12).length} zones exceeding cutoff
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveMode('INTERVENTION_PLANNER')}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-600/60 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        Intervention Engine
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                      {activeInterventionIds.length} Active
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {activeInterventionIds.length > 0 ? 'Mitigating network strain' : 'Evaluate 4 counter-measures'}
                    </div>
                  </div>
                </div>

                {/* Real-Time Network Stress Log */}
                <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Real-Time Network Stress Log</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Step {currentStep.stepIndex + 1} of {PREBUILT_CASCADE_STEPS.length}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Severed Primary Connections:</span>
                      <span className="font-mono font-bold text-rose-400">{currentStep.failedRoadIds.length} links</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Alternative Routes Under Stress:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {currentStep.highPressureRoadIds.length + currentStep.atRiskRoadIds.length} links
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Secondary Bottlenecks:</span>
                      <span className="font-mono font-bold text-orange-400">{currentStep.bottleneckNodeIds.length} junctions</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Evaluate multi-corridor cascade?</span>
                    <button
                      onClick={() => setActiveMode('MULTI_CORRIDOR_ANALYSIS')}
                      className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>Multi-Corridor Module</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MULTI-CORRIDOR REDISTRIBUTION & CASCADE ANALYSIS */}
            {activeMode === 'MULTI_CORRIDOR_ANALYSIS' && (
              <ErrorBoundary fallbackTitle="Multi-Corridor Strategic Analysis">
                <MultiCorridorAnalysisView
                  onApplyScenarioToMap={(roadIds) => {
                    setCustomDisabledRoadIds(roadIds);
                  }}
                  activeDisabledRoadIds={customDisabledRoadIds || currentStep.failedRoadIds}
                  activeInterventions={activeInterventions}
                  onProtectRoad={handleProtectRoad}
                  onUnprotectRoad={handleUnprotectRoad}
                  onFocusCorridorOnMap={(roadId) => {
                    const road = ROADS.find(r => r.id === roadId);
                    if (road) setSelectedRoad(road);
                  }}
                />
              </ErrorBoundary>
            )}

            {/* 3. HOSPITAL & EMERGENCY ACCESS MODE */}
            {activeMode === 'HOSPITAL_ACCESS' && (
              <HospitalAccessView
                currentStep={currentStep}
                activeInterventions={activeInterventions}
                onFocusCorridors={() => setShowHospitalCorridorsOnly(true)}
              />
            )}

            {/* 4. INTERVENTION PRIORITISATION ENGINE */}
            {activeMode === 'INTERVENTION_PLANNER' && (
              <InterventionPlanner
                activeInterventionIds={activeInterventionIds}
                onToggleIntervention={handleToggleIntervention}
                maxBudgetUnits={maxBudgetUnits}
                onSetMaxBudgetUnits={setMaxBudgetUnits}
                currentRippleScore={rippleDetails.score}
                selectedAssetId={selectedRoad?.id || null}
                onSelectAsset={(id) => {
                  if (id) {
                    const road = ROADS.find(r => r.id === id);
                    if (road) setSelectedRoad(road);
                  } else {
                    setSelectedRoad(null);
                  }
                }}
                onNavigateToComparison={() => {
                  setActiveMode('BEFORE_AFTER_COMPARISON');
                  setIsAnalysisDrawerOpen(true);
                }}
              />
            )}

            {/* 5. BEFORE VS AFTER COMPARISON */}
            {activeMode === 'BEFORE_AFTER_COMPARISON' && (
              <BeforeAfterComparison
                unmitigatedStep={unmitigatedStep}
                unmitigatedDetails={unmitigatedDetails}
                intervenedStep={intervenedStep}
                intervenedDetails={intervenedDetails}
                activeInterventions={activeInterventions}
                onApplyPresetOptimal={handleApplyPresetOptimal}
                mapPreviewMode={beforeAfterMapPreview}
                onToggleMapPreview={setBeforeAfterMapPreview}
              />
            )}

            {/* 6. PROACTIVE STRESS-TESTING MODE */}
            {activeMode === 'PROACTIVE_STRESS_TEST' && (
              <StressTestView
                onSimulateAssetFailure={handleSimulateAssetFromStressTest}
                activeDisruptedRoadId={customDisabledRoadIds?.[0] || null}
                roadStressMetrics={roadStressMetricsRecord}
                alternativeRoutes={alternativeRoutes}
                roadStates={roadStates}
              />
            )}
          </div>
        )}
      </main>

      {/* Neighbourhood Risk Profile Dossier Modal */}
      <RiskProfileModal
        isOpen={isRiskProfileOpen}
        onClose={() => setIsRiskProfileOpen(false)}
        onBeginSimulation={() => {
          setIsRiskProfileOpen(false);
          setActiveMode('CASCADE_SIMULATION');
          setIsAnalysisDrawerOpen(true);
          setCurrentStepIndex(1); // Trigger inundation
        }}
      />

      {/* Data Provenance & Assumptions Transparency Modal */}
      <DataProvenanceModal
        isOpen={isDataProvenanceOpen}
        onClose={() => setIsDataProvenanceOpen(false)}
      />
    </div>
  );
}
