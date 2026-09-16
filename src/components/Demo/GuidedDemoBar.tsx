import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Pause, 
  MapPin, 
  Sparkles,
  Quote
} from 'lucide-react';

import { ActiveAppMode } from '../../types';

export interface DemoStepItem {
  stepNumber: number;
  title: string;
  badge: string;
  narration: string;
  callToAction?: string;
  targetAppMode: ActiveAppMode;
  simulationStepIndex: number;
  applyInterventions?: string[];
  roadHighlightId?: string;
  openInspector?: boolean;
}

export const HACKATHON_DEMO_STEPS: DemoStepItem[] = [
  {
    stepNumber: 1,
    title: 'Healthy baseline network',
    badge: '1. Baseline',
    narration: 'Normal operating conditions across Bengaluru’s Central Silk Board and HSR Layout nexus (~184,500 residents). Central Silk Board Underpass and Outer Ring Road carry baseline morning peak volumes with all corridors green and stable.',
    callToAction: 'Observe normal flow rates and green corridor status on the map.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 0
  },
  {
    stepNumber: 2,
    title: 'Introduce urban flooding / road failure',
    badge: '2. Cloudburst Hazard',
    narration: 'A severe 110mm monsoon cloudburst triggers stormwater runoff, causing the primary Raja Kaluve stormwater channel to overflow into road depressions.',
    callToAction: 'Observe inundation boundary forming across Central Silk Board basin.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 1
  },
  {
    stepNumber: 3,
    title: 'Initial failed infrastructure asset',
    badge: '3. Initial Failure',
    narration: 'The Central Silk Board Underpass is submerged under 1.1m stormwater and marked RED (FAILED / IMPASSABLE), cutting 3,100 vph of critical arterial capacity.',
    callToAction: 'Inspect the severed Central Silk Board underpass link on the map.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 1,
    roadHighlightId: 'R_SILK_BOARD_JUNCTION',
    openInspector: true
  },
  {
    stepNumber: 4,
    title: 'Advance the cascade timeline',
    badge: '4. Cascade Advance',
    narration: 'As time advances +15 minutes, 3,100 vph of displaced traffic surges outward into parallel corridors. The ripple begins propagating beyond the flood basin.',
    callToAction: 'Watch queue spillover propagate into adjacent arterials.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 2
  },
  {
    stepNumber: 5,
    title: 'Traffic redistribution & secondary bottlenecks',
    badge: '5. Bottlenecks',
    narration: 'Diverted traffic floods Outer Ring Road (Agara) and HSR 27th Main (+2,150 vph). Agara Lake Junction and Madiwala Market choke as V/C ratios exceed 125%.',
    callToAction: 'Inspect active bottlenecks at Agara and Madiwala junctions.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 3,
    roadHighlightId: 'R_ORR_AGARA_CORRIDOR'
  },
  {
    stepNumber: 6,
    title: 'Hospital & emergency accessibility impact',
    badge: '6. Hospital Impact',
    narration: 'Ambulance travel time to St. John’s Medical College Hospital escalates from 6.8 to 28.5 minutes (+319% delay), completely breaching the 12-minute golden survival window.',
    callToAction: 'Review breaching zone latency meters in Hospital Access panel.',
    targetAppMode: 'HOSPITAL_ACCESS',
    simulationStepIndex: 4
  },
  {
    stepNumber: 7,
    title: 'Inspect critical infrastructure asset',
    badge: '7. Asset Inspection',
    narration: 'Clicking Central Silk Board Underpass reveals its asset profile: 3,100 vph design capacity, vulnerable sump elevation, and severed connectivity.',
    callToAction: 'Review asset technical parameters and failure drivers.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 4,
    roadHighlightId: 'R_SILK_BOARD_JUNCTION',
    openInspector: true
  },
  {
    stepNumber: 8,
    title: 'Why it is disproportionately important',
    badge: '8. Criticality',
    narration: 'Alternative route analysis proves why Silk Board is critical: its failure forces 100% of southern arterial traffic into narrow residential grids, sparking 6 secondary bottlenecks.',
    callToAction: 'Review alternative route capacity exhaustion in Asset Inspector.',
    targetAppMode: 'CASCADE_SIMULATION',
    simulationStepIndex: 4,
    roadHighlightId: 'R_SILK_BOARD_JUNCTION',
    openInspector: true
  },
  {
    stepNumber: 9,
    title: 'Open Intervention Engine',
    badge: '9. Interventions',
    narration: 'Opening the Intervention Engine reveals 4 deterministic counter-measures constrained by an emergency engineering budget of 3 resource units.',
    callToAction: 'Review available engineering interventions and budget units.',
    targetAppMode: 'INTERVENTION_PLANNER',
    simulationStepIndex: 4,
    applyInterventions: []
  },
  {
    stepNumber: 10,
    title: 'Compare possible interventions',
    badge: '10. Compare Options',
    narration: 'Compare dewatering sumps, elevated emergency lanes, canal desilting, and dynamic signals across cost, impact reduction, and deployment speed.',
    callToAction: 'Evaluate trade-offs between physical dewatering vs traffic rerouting.',
    targetAppMode: 'INTERVENTION_PLANNER',
    simulationStepIndex: 4,
    applyInterventions: []
  },
  {
    stepNumber: 11,
    title: 'Apply the strongest intervention',
    badge: '11. Deploy Solution',
    narration: 'Deploying High-Capacity Stormwater Sump at Silk Board (2 units) + Dedicated Emergency Lane on Elevated Expressway (1 unit) achieves maximum resilience return.',
    callToAction: 'Observe budget allocation and active simulation counter-measures.',
    targetAppMode: 'INTERVENTION_PLANNER',
    simulationStepIndex: 4,
    applyInterventions: ['INT_SILK_BOARD_SUMP', 'INT_ELEVATED_EMERGENCY_LANE']
  },
  {
    stepNumber: 12,
    title: 'Show BEFORE vs AFTER',
    badge: '12. Before vs After',
    narration: 'Side-by-side comparison demonstrates a 72% reduction in Ripple Impact Score (86 → 24), 5 bottlenecks cleared, and St. John’s hospital access safely restored!',
    callToAction: 'Compare deterministic metrics and directional indicators (↓ reduced).',
    targetAppMode: 'BEFORE_AFTER_COMPARISON',
    simulationStepIndex: 5,
    applyInterventions: ['INT_SILK_BOARD_SUMP', 'INT_ELEVATED_EMERGENCY_LANE']
  },
  {
    stepNumber: 13,
    title: 'Run Proactive Stress-Test',
    badge: '13. Stress-Test',
    narration: 'Instead of waiting for floods, the proactive vulnerability scanner runs single-point-of-failure graph tests across every link, mathematically ranking systemic risk.',
    callToAction: 'Inspect systemic vulnerability scores across all 7 network links.',
    targetAppMode: 'PROACTIVE_STRESS_TEST',
    simulationStepIndex: 0,
    applyInterventions: []
  },
  {
    stepNumber: 14,
    title: 'Scan another critical asset before failure',
    badge: '14. Future Resilience',
    narration: 'Scanning reveals Outer Ring Road Agara Corridor as the #2 single point of failure (Ripple Score 74). "Don’t just respond to infrastructure failure. Understand the ripple before it becomes a crisis."',
    callToAction: 'Inspect Agara Corridor vulnerability profile before inundation occurs.',
    targetAppMode: 'PROACTIVE_STRESS_TEST',
    simulationStepIndex: 0,
    applyInterventions: [],
    roadHighlightId: 'R_ORR_AGARA_CORRIDOR'
  }
];

interface GuidedDemoBarProps {
  currentDemoStep: number;
  onSelectDemoStep: (stepNumber: number) => void;
  onCloseDemo: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export const GuidedDemoBar: React.FC<GuidedDemoBarProps> = ({
  currentDemoStep,
  onSelectDemoStep,
  onCloseDemo,
  autoPlay,
  onToggleAutoPlay
}) => {
  const currentStep = HACKATHON_DEMO_STEPS.find(s => s.stepNumber === currentDemoStep) || HACKATHON_DEMO_STEPS[0];

  const handleNext = () => {
    if (currentDemoStep < HACKATHON_DEMO_STEPS.length) {
      onSelectDemoStep(currentDemoStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentDemoStep > 1) {
      onSelectDemoStep(currentDemoStep - 1);
    }
  };

  return (
    <div id="guided-demo-banner" className="bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/50 px-4 py-2 flex items-center justify-between gap-3 z-30 shrink-0 shadow-lg select-none">
      {/* Step Badge & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shadow-sm">
            {currentStep.stepNumber}
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold hidden sm:inline-block">
            {currentStep.badge}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-white truncate">
              {currentStep.title}
            </h4>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
              <Sparkles className="w-2.5 h-2.5" /> 14-Step Judging Script
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate max-w-2xl">
            {currentStep.narration}
          </p>
        </div>
      </div>

      {/* Step Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          id="demo-prev-btn"
          onClick={handlePrev}
          disabled={currentDemoStep === 1}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Step Selector Dropdown */}
        <select
          id="demo-step-selector"
          value={currentDemoStep}
          onChange={(e) => onSelectDemoStep(Number(e.target.value))}
          className="bg-slate-800 text-cyan-300 font-mono text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 hover:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          title="Select Demo Step"
        >
          {HACKATHON_DEMO_STEPS.map((s) => (
            <option key={s.stepNumber} value={s.stepNumber}>
              Step {s.stepNumber}: {s.title}
            </option>
          ))}
        </select>

        <button
          id="demo-next-btn"
          onClick={handleNext}
          disabled={currentDemoStep === HACKATHON_DEMO_STEPS.length}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          id="demo-autoplay-btn"
          onClick={onToggleAutoPlay}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border ${
            autoPlay 
              ? 'bg-amber-600 text-white border-amber-400' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          {autoPlay ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{autoPlay ? 'Pause' : 'Auto'}</span>
        </button>

        <button
          id="demo-close-btn"
          onClick={onCloseDemo}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition ml-1"
          title="Exit Guided Demo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
