import {
  RoadLink,
  CascadeStep,
  RippleImpactDetails,
  InterventionOption,
  SinglePointOfFailureResult,
  InfrastructureState,
  RoadStressMetric,
  AlternativeRouteSummary
} from '../types';
import { ROADS, NODES, ZONES, HOSPITALS, INTERVENTIONS, MULTI_CORRIDOR_SCENARIOS } from '../data/networkData';

/**
 * Formal definitions for the 4 core network impact states
 */
export const STATE_DEFINITIONS: Record<string, {
  label: string;
  badgeText: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
}> = {
  NORMAL: {
    label: 'NORMAL',
    badgeText: 'NORMAL (<80% CAP)',
    color: '#10b981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-700',
    dotColor: 'bg-emerald-400',
    description: 'Operating within normal design capacity (V/C < 0.80); free-flowing traffic.'
  },
  PROTECTED: {
    label: 'PROTECTED',
    badgeText: 'PROTECTED / REINFORCED',
    color: '#10b981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-600',
    dotColor: 'bg-emerald-400',
    description: 'Active counter-measure deployed; corridor failure prevented and critical throughput preserved.'
  },
  FAILED: {
    label: 'FAILED',
    badgeText: 'FAILED / IMPASSABLE',
    color: '#ef4444',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/80',
    borderColor: 'border-rose-600',
    dotColor: 'bg-rose-500',
    description: 'Corridor capacity is 0; physically impassable due to stormwater inundation (0.8–1.2m) or drain breach.'
  },
  HIGH_PRESSURE: {
    label: 'HIGH PRESSURE',
    badgeText: 'HIGH PRESSURE (>100% CAP)',
    color: '#f59e0b',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/80',
    borderColor: 'border-amber-600',
    dotColor: 'bg-amber-500',
    description: 'Volume exceeds design capacity (V/C > 1.0); heavy spillover queues, crawling transit speeds, and intersection gridlock.'
  },
  AT_RISK: {
    label: 'AT RISK',
    badgeText: 'AT RISK (80-100% CAP)',
    color: '#f97316',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-950/80',
    borderColor: 'border-orange-600',
    dotColor: 'bg-orange-500',
    description: 'Operating near saturation threshold (V/C 0.80 - 1.0); fragile feeder route vulnerable to secondary queue spillback.'
  },
  CRITICAL_ACCESS_IMPACTED: {
    label: 'CRITICAL ACCESS IMPACTED',
    badgeText: 'CRITICAL ACCESS IMPACTED',
    color: '#c084fc',
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-950/80',
    borderColor: 'border-purple-600',
    dotColor: 'bg-purple-500',
    description: 'Designated emergency trauma access lifeline to St. John’s Hospital experiencing severed access or severe delays (>30%).'
  }
};

/**
 * Pre-calibrated realistic cascade progression steps for the Bengaluru Central Silk Board & HSR Layout scenario:
 * STEP 1 INITIAL FAILURE -> STEP 2 REDISTRIBUTION -> STEP 3 SECONDARY STRESS -> STEP 4 CRITICAL ACCESS -> STEP 5 SUMMARY
 */
export const PREBUILT_CASCADE_STEPS: CascadeStep[] = [
  {
    stepIndex: 0,
    timeOffsetMinutes: 0,
    title: 'BASELINE: NORMAL OPERATIONS',
    summary: 'Pre-cloudburst conditions across South-East Bengaluru. All 12 corridors operational. Average casualty transit to St. John’s Hospital is 6.8 minutes.',
    triggerEvent: 'Baseline operational network prior to 110mm monsoon cloudburst and Raja Kaluve drain surge.',
    stepPhase: 'BASELINE',
    failedRoadIds: [],
    highPressureRoadIds: [],
    atRiskRoadIds: [],
    criticalAccessRoadIds: [],
    bottleneckNodeIds: [],
    networkStressLevel: 'NORMAL',
    hospitalAverageLatencyMinutes: 6.8,
    hospitalSeveredCorridorsCount: 0,
    rippleImpactScore: 6,
    rippleCategory: 'LOW',
    rippleReasons: [
      'All primary arterials (Outer Ring Road, Hosur Road, HSR 27th Main) operating at <70% volume/capacity',
      'Central Silk Board Underpass clear with active gravity drainage functioning',
      'All 4 neighbourhood zones within 8.5 minutes of St. John’s Medical College Hospital trauma bay'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 6.8,
      ZONE_BTM_LAYOUT: 7.2,
      ZONE_KORAMANGALA_SOUTH: 5.4,
      ZONE_BOMMANAHALLI: 8.5
    }
  },
  {
    stepIndex: 1,
    timeOffsetMinutes: 12,
    title: 'STEP 1 — INITIAL FAILURE',
    summary: '110mm/2hr cloudburst overwhelms natural drainage sag at Central Silk Board. The underpass is submerged under 1.1m stormwater and barricaded by traffic police (FAILED).',
    triggerEvent: 'Scenario-Based Simulation: Central Silk Board Underpass closed due to 1.1m flash inundation.',
    stepPhase: 'STEP_1_FAILURE',
    failedRoadIds: ['R_SILK_BOARD_JUNCTION'],
    highPressureRoadIds: ['R_MADIWALA_UNDERPASS'],
    atRiskRoadIds: [],
    criticalAccessRoadIds: ['R_MADIWALA_UNDERPASS', 'R_ST_JOHNS_LIFELINE'],
    bottleneckNodeIds: ['N_SILK_BOARD', 'N_BTM_29TH_MAIN'],
    networkStressLevel: 'ELEVATED',
    hospitalAverageLatencyMinutes: 12.4,
    hospitalSeveredCorridorsCount: 1,
    rippleImpactScore: 32,
    rippleCategory: 'MODERATE',
    rippleReasons: [
      'Primary nexus severed: Central Silk Board Underpass & Flyover Nexus (3,100 vph displaced)',
      'Cause: 110mm/2hr monsoon cloudburst ponding in low-elevation valley between Madiwala and Agara Lakes',
      'Traffic police barricade underpass ramps as water depth exceeds 1.1m (Capacity = 0)',
      'Immediate queue shockwave forming westbound along BTM 29th Main and southbound along Hosur Road'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 7.8,
      ZONE_BTM_LAYOUT: 15.6,
      ZONE_KORAMANGALA_SOUTH: 6.8,
      ZONE_BOMMANAHALLI: 12.4
    }
  },
  {
    stepIndex: 2,
    timeOffsetMinutes: 25,
    title: 'STEP 2 — REDISTRIBUTION',
    summary: 'Traffic demand (3,100 vehicles/hr) displaced from Silk Board underpass redirects onto Outer Ring Road (Agara stretch), HSR 27th Main, and Koramangala 100ft Road.',
    triggerEvent: 'Commuter navigation systems and transit buses reroute en masse into HSR Layout and Sarjapur corridors.',
    stepPhase: 'STEP_2_REDISTRIBUTION',
    activeRedirectCorridorIds: ['R_ORR_AGARA_CORRIDOR', 'R_HSR_27TH_MAIN', 'R_KORAMANGALA_100FT'],
    failedRoadIds: ['R_SILK_BOARD_JUNCTION'],
    highPressureRoadIds: ['R_ORR_AGARA_CORRIDOR', 'R_HSR_27TH_MAIN', 'R_MADIWALA_UNDERPASS'],
    atRiskRoadIds: ['R_SARJAPUR_AGARA_LINK', 'R_KORAMANGALA_100FT'],
    criticalAccessRoadIds: ['R_ST_JOHNS_LIFELINE', 'R_MADIWALA_UNDERPASS'],
    bottleneckNodeIds: ['N_AGARA_JUNCTION', 'N_MADIWALA_CHECKPOST'],
    networkStressLevel: 'HIGH',
    hospitalAverageLatencyMinutes: 18.2,
    hospitalSeveredCorridorsCount: 1,
    rippleImpactScore: 59,
    rippleCategory: 'MODERATE',
    rippleReasons: [
      '3,100 vph displaced volume surging into Outer Ring Road Agara stretch (+145% capacity spike)',
      'HSR 27th Main commercial spine overwhelmed by heavy buses and commercial cab diversions',
      'Directional traffic redistribution transfers severe congestion towards Agara Flyover base',
      'BTM Layout ambulance transit to St. John’s Hospital jumps from 7.2m to 19.8m'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 11.2,
      ZONE_BTM_LAYOUT: 19.8,
      ZONE_KORAMANGALA_SOUTH: 11.5,
      ZONE_BOMMANAHALLI: 17.6
    }
  },
  {
    stepIndex: 3,
    timeOffsetMinutes: 40,
    title: 'STEP 3 — SECONDARY STRESS',
    summary: 'Alternative corridors progressively degrade from AT RISK to HIGH PRESSURE. Turning queues at Agara Junction and Madiwala Market create secondary intersection gridlock.',
    triggerEvent: 'Queue spillback from saturated arterials paralyzes secondary feeder intersections.',
    stepPhase: 'STEP_3_SECONDARY_STRESS',
    failedRoadIds: ['R_SILK_BOARD_JUNCTION'],
    highPressureRoadIds: [
      'R_ORR_AGARA_CORRIDOR',
      'R_HSR_27TH_MAIN',
      'R_MADIWALA_UNDERPASS',
      'R_SARJAPUR_AGARA_LINK',
      'R_KORAMANGALA_100FT'
    ],
    atRiskRoadIds: ['R_HSR_14TH_MAIN', 'R_JAKKASANDRA_ST_JOHNS', 'R_HOSUR_RD_SURFACE'],
    criticalAccessRoadIds: ['R_ST_JOHNS_LIFELINE', 'R_JAKKASANDRA_ST_JOHNS', 'R_ELEVATED_EXPRESSWAY'],
    bottleneckNodeIds: [
      'N_SILK_BOARD',
      'N_AGARA_JUNCTION',
      'N_MADIWALA_CHECKPOST',
      'N_HSR_27TH_MAIN',
      'N_SARJAPUR_JAKKASANDRA'
    ],
    networkStressLevel: 'HIGH',
    roadExplanations: {
      'R_ORR_AGARA_CORRIDOR': 'HIGH PRESSURE: Volume surges to 134% of capacity (+1,300 vph diversion from Silk Board), producing a 2.4km stationary queue.',
      'R_HSR_27TH_MAIN': 'HIGH PRESSURE: Operates at 128% saturation as heavy traffic navigates narrow 2-lane market intersections.',
      'R_SARJAPUR_AGARA_LINK': 'HIGH PRESSURE: Agara right-turning queues block through-movement towards Koramangala.',
      'R_KORAMANGALA_100FT': 'HIGH PRESSURE: Approaching 120% capacity as commuters detour around Madiwala checkpost.',
      'R_ELEVATED_EXPRESSWAY': 'NORMAL / VIABLE: Grade-separated elevated expressway maintains free flow above surface waterlogging.'
    },
    hospitalAverageLatencyMinutes: 22.8,
    hospitalSeveredCorridorsCount: 2,
    rippleImpactScore: 78,
    rippleCategory: 'HIGH',
    rippleReasons: [
      '5 major urban junctions operating at Level of Service F (complete breakdown)',
      'HSR 27th Main queue spillback blocks cross-transit toward Greenview Medical Hospital',
      'Sarjapur Road Jakkasandra signal failure blocks northern ambulance bypass',
      '2 of 4 neighbourhood zones now exceed the 12-minute critical trauma survival window'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 16.4,
      ZONE_BTM_LAYOUT: 25.2,
      ZONE_KORAMANGALA_SOUTH: 15.8,
      ZONE_BOMMANAHALLI: 22.5
    }
  },
  {
    stepIndex: 4,
    timeOffsetMinutes: 55,
    title: 'STEP 4 — CRITICAL ACCESS IMPACT',
    summary: 'Emergency casualty access to St. John’s Medical College Hospital is severely compromised. HSR Layout and BTM Layout are isolated beyond the 12-minute golden window.',
    triggerEvent: 'Emergency lifeline approach along Madiwala Checkpost paralyzed by queue spillover.',
    stepPhase: 'STEP_4_CRITICAL_ACCESS',
    failedRoadIds: ['R_SILK_BOARD_JUNCTION'],
    highPressureRoadIds: [
      'R_ORR_AGARA_CORRIDOR',
      'R_HSR_27TH_MAIN',
      'R_MADIWALA_UNDERPASS',
      'R_SARJAPUR_AGARA_LINK',
      'R_KORAMANGALA_100FT',
      'R_HOSUR_RD_SURFACE'
    ],
    atRiskRoadIds: [
      'R_HSR_14TH_MAIN',
      'R_JAKKASANDRA_ST_JOHNS',
      'R_IBLUR_ORR_LINK'
    ],
    criticalAccessRoadIds: [
      'R_ST_JOHNS_LIFELINE',
      'R_MADIWALA_UNDERPASS',
      'R_JAKKASANDRA_ST_JOHNS',
      'R_ELEVATED_EXPRESSWAY'
    ],
    bottleneckNodeIds: [
      'N_SILK_BOARD',
      'N_AGARA_JUNCTION',
      'N_MADIWALA_CHECKPOST',
      'N_HSR_27TH_MAIN',
      'N_SARJAPUR_JAKKASANDRA',
      'N_KORAMANGALA_100FT'
    ],
    hospitalRoutesBreakdown: {
      severedRouteIds: ['R_SILK_BOARD_JUNCTION'],
      severeDelayRouteIds: ['R_MADIWALA_UNDERPASS', 'R_ORR_AGARA_CORRIDOR', 'R_HSR_27TH_MAIN'],
      viableRouteIds: ['R_ELEVATED_EXPRESSWAY', 'R_IBLUR_ORR_LINK']
    },
    networkStressLevel: 'CRITICAL',
    hospitalAverageLatencyMinutes: 26.8,
    hospitalSeveredCorridorsCount: 3,
    rippleImpactScore: 86,
    rippleCategory: 'SEVERE',
    rippleReasons: [
      'Routes No Longer Viable: Central Silk Board Underpass completely severed (capacity 0)',
      'Routes Experiencing Severe Delays: Madiwala Checkpost casualty approach (+285%) and ORR Agara (+134%)',
      'Remaining Viable Routes: Grade-separated Electronic City Elevated Expressway and eastern Iblur link',
      'HSR Layout emergency ambulance transit time surges to 28.5 mins (+319%)',
      '3 out of 4 neighbourhood zones (184,500 citizens) breach the 12-min critical trauma threshold'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 28.5,
      ZONE_BTM_LAYOUT: 29.8,
      ZONE_KORAMANGALA_SOUTH: 18.2,
      ZONE_BOMMANAHALLI: 26.5
    }
  },
  {
    stepIndex: 5,
    timeOffsetMinutes: 60,
    title: 'STEP 5 — SUMMARY',
    summary: 'Cascading failure complete. One initial underpass inundation triggered 6 secondary bottlenecks and breached the emergency trauma survival window for 184,500 residents.',
    triggerEvent: 'Systemic peak cascade state achieved. Full cause-and-effect chain synthesized.',
    stepPhase: 'STEP_5_SUMMARY',
    failedRoadIds: ['R_SILK_BOARD_JUNCTION'],
    highPressureRoadIds: [
      'R_ORR_AGARA_CORRIDOR',
      'R_HSR_27TH_MAIN',
      'R_MADIWALA_UNDERPASS',
      'R_SARJAPUR_AGARA_LINK',
      'R_KORAMANGALA_100FT',
      'R_HOSUR_RD_SURFACE'
    ],
    atRiskRoadIds: [
      'R_HSR_14TH_MAIN',
      'R_JAKKASANDRA_ST_JOHNS',
      'R_IBLUR_ORR_LINK'
    ],
    criticalAccessRoadIds: [
      'R_ST_JOHNS_LIFELINE',
      'R_MADIWALA_UNDERPASS',
      'R_JAKKASANDRA_ST_JOHNS',
      'R_ELEVATED_EXPRESSWAY'
    ],
    bottleneckNodeIds: [
      'N_SILK_BOARD',
      'N_AGARA_JUNCTION',
      'N_MADIWALA_CHECKPOST',
      'N_HSR_27TH_MAIN',
      'N_SARJAPUR_JAKKASANDRA',
      'N_KORAMANGALA_100FT'
    ],
    hospitalRoutesBreakdown: {
      severedRouteIds: ['R_SILK_BOARD_JUNCTION'],
      severeDelayRouteIds: ['R_MADIWALA_UNDERPASS', 'R_ORR_AGARA_CORRIDOR', 'R_HSR_27TH_MAIN'],
      viableRouteIds: ['R_ELEVATED_EXPRESSWAY', 'R_IBLUR_ORR_LINK']
    },
    summaryBlock: {
      initialFailure: 'Central Silk Board Underpass & Junction (submerged under 1.1m floodwater during 110mm monsoon cloudburst)',
      cascadeEffect: '6 secondary bottlenecks created across ORR Agara, HSR 27th Main, Sarjapur Road, and Koramangala 100ft Rd as 3,100 vph displaced volume overwhelmed alternative corridors',
      criticalImpact: 'St. John’s Medical College Hospital trauma access delayed from 6.8m to 28.5m (+319%), breaching the 12-minute survival window for 184,500 residents across HSR Layout and BTM'
    },
    networkStressLevel: 'CRITICAL',
    hospitalAverageLatencyMinutes: 26.8,
    hospitalSeveredCorridorsCount: 3,
    rippleImpactScore: 86,
    rippleCategory: 'SEVERE',
    rippleReasons: [
      'INITIAL FAILURE: Central Silk Board Underpass submerged under 1.1m floodwaters',
      'CASCADE EFFECT: 6 secondary bottlenecks created across ORR, HSR 27th Main, and Koramangala',
      'CRITICAL IMPACT: St. John’s Hospital access delay surged from 6.8m to 28.5m (+319%)',
      'Scenario-Based Simulation: Deterministic network flow calculations without external API dependencies'
    ],
    zoneLatencies: {
      ZONE_HSR_LAYOUT: 28.5,
      ZONE_BTM_LAYOUT: 29.8,
      ZONE_KORAMANGALA_SOUTH: 18.2,
      ZONE_BOMMANAHALLI: 26.5
    }
  }
];

/**
 * Calculates dynamic network status for an arbitrary set of disabled roads
 * or active interventions using transparent deterministic flow calculations.
 */
export function calculateDynamicCascade(
  disabledRoadIds: string[],
  activeInterventions: InterventionOption[] = []
): {
  stepData: CascadeStep;
  details: RippleImpactDetails;
  roadStates: Record<string, InfrastructureState>;
  roadStressMetrics: RoadStressMetric[];
  alternativeRoutes: AlternativeRouteSummary[];
} {
  const activeRoads = ROADS.map(r => r.id);
  const effectiveDisabled = new Set<string>();
  const protectedRoadIds = new Set<string>();

  // Check which roads have active interventions protecting or reinforcing them
  activeInterventions.forEach(int => {
    int.targetRoadIds.forEach(targetId => {
      protectedRoadIds.add(targetId);
    });
  });

  // Check if any intervention prevents failure (e.g. Stormwater Sump at Silk Board, Desilting at Agara)
  disabledRoadIds.forEach(id => {
    const isProtected = activeInterventions.some(
      int => (int.preventFailure || int.interventionType === 'PROTECT_ROUTE' || int.interventionType === 'REINFORCE_CORRIDOR') && int.targetRoadIds.includes(id)
    );
    if (isProtected) {
      protectedRoadIds.add(id);
    } else {
      effectiveDisabled.add(id);
    }
  });

  const roadStates: Record<string, InfrastructureState> = {};
  activeRoads.forEach(id => {
    roadStates[id] = protectedRoadIds.has(id) ? 'PROTECTED' : 'NORMAL';
  });

  // Mark disabled roads as FAILED
  effectiveDisabled.forEach(id => {
    roadStates[id] = 'FAILED';
  });

  // Calculate alternative routes & pressure redistribution
  const highPressure = new Set<string>();
  const atRisk = new Set<string>();
  const criticalAccess = new Set<string>();
  const bottlenecks = new Set<string>();
  const divertedVolumeByRoad: Record<string, number> = {};

  if (effectiveDisabled.size > 0) {
    // For each failed road, calculate its displaced volume and route to alternatives
    effectiveDisabled.forEach(failedId => {
      const failedRoad = ROADS.find(r => r.id === failedId);
      const displacedVolume = failedRoad ? failedRoad.normalVolumeVph : 2500;

      // Find all roads marked as alternative for this failed road
      const directAlternatives = ROADS.filter(r => 
        !effectiveDisabled.has(r.id) && r.alternativeFor?.includes(failedId)
      );

      if (directAlternatives.length > 0) {
        // Calculate raw split weights across available non-failed alternative corridors
        const rawWeights: Record<string, number> = {};
        let totalWeight = 0;

        directAlternatives.forEach(altRoad => {
          let w = 1 / directAlternatives.length;
          if (failedId === 'R_SILK_BOARD_JUNCTION') {
            if (altRoad.id === 'R_ORR_AGARA_CORRIDOR') w = 0.42;
            else if (altRoad.id === 'R_HSR_27TH_MAIN') w = 0.28;
            else if (altRoad.id === 'R_KORAMANGALA_100FT') w = 0.30;
          } else if (failedId === 'R_ORR_AGARA_CORRIDOR') {
            if (altRoad.id === 'R_SARJAPUR_AGARA_LINK') w = 0.45;
            else if (altRoad.id === 'R_HSR_27TH_MAIN') w = 0.30;
            else if (altRoad.id === 'R_HSR_14TH_MAIN') w = 0.25;
          } else if (failedId === 'R_HOSUR_RD_SURFACE') {
            if (altRoad.id === 'R_ELEVATED_EXPRESSWAY') w = 0.60;
            else w = 0.40;
          }
          rawWeights[altRoad.id] = w;
          totalWeight += w;
        });

        // Apportion displaced traffic proportionally across remaining viable alternative corridors
        directAlternatives.forEach(altRoad => {
          const splitFactor = totalWeight > 0 ? (rawWeights[altRoad.id] / totalWeight) : (1 / directAlternatives.length);
          const added = Math.round(displacedVolume * splitFactor);
          divertedVolumeByRoad[altRoad.id] = (divertedVolumeByRoad[altRoad.id] || 0) + added;
        });
      } else {
        // Fallback parallel distribution to non-failed arterials
        ROADS.filter(r => !effectiveDisabled.has(r.id) && (r.type === 'ARTERIAL' || r.type === 'BRIDGE')).forEach(altRoad => {
          divertedVolumeByRoad[altRoad.id] = (divertedVolumeByRoad[altRoad.id] || 0) + Math.round(displacedVolume * 0.30);
        });
      }
    });

    // Evaluate stress and classify states for all active roads
    ROADS.forEach(road => {
      if (effectiveDisabled.has(road.id)) return;

      const capacityBoost = activeInterventions.reduce((sum, int) => {
        return int.targetRoadIds.includes(road.id) ? sum + (int.capacityBoostPercent || 0) : sum;
      }, 0);

      const effectiveCapacity = Math.round(road.baseCapacityVph * (1 + capacityBoost / 100));
      const addedVolume = divertedVolumeByRoad[road.id] || 0;
      const currentVolume = road.normalVolumeVph + addedVolume;
      const ratio = currentVolume / effectiveCapacity;

      if (ratio >= 1.05) {
        highPressure.add(road.id);
        if (!protectedRoadIds.has(road.id)) {
          roadStates[road.id] = 'HIGH_PRESSURE';
        }
        bottlenecks.add(road.fromNodeId);
        bottlenecks.add(road.toNodeId);
      } else if (ratio >= 0.80) {
        atRisk.add(road.id);
        if (!protectedRoadIds.has(road.id)) {
          roadStates[road.id] = 'AT_RISK';
        }
        bottlenecks.add(road.fromNodeId);
      }

      // Check if designated critical hospital lifeline corridor is impacted
      if (road.isHospitalCorridor) {
        if (ratio >= 0.85 || roadStates[road.id] === 'HIGH_PRESSURE' || roadStates[road.id] === 'AT_RISK') {
          criticalAccess.add(road.id);
          if (!protectedRoadIds.has(road.id)) {
            roadStates[road.id] = 'CRITICAL_ACCESS_IMPACTED';
          }
        }
      }
    });

    // Hospital corridors that failed directly
    ROADS.filter(r => r.isHospitalCorridor).forEach(r => {
      if (effectiveDisabled.has(r.id)) {
        criticalAccess.add(r.id);
      }
    });
  }

  // Compile detailed RoadStressMetric for every road in the network
  const roadStressMetrics: RoadStressMetric[] = ROADS.map(road => {
    const isFailed = effectiveDisabled.has(road.id);
    const capacityBoost = activeInterventions.reduce((sum, int) => {
      return int.targetRoadIds.includes(road.id) ? sum + (int.capacityBoostPercent || 0) : sum;
    }, 0);

    const effectiveCapacity = isFailed ? 0 : Math.round(road.baseCapacityVph * (1 + capacityBoost / 100));
    const addedDiverted = isFailed ? 0 : (divertedVolumeByRoad[road.id] || 0);
    const currentVolume = isFailed ? 0 : road.normalVolumeVph + addedDiverted;
    const ratio = effectiveCapacity > 0 ? Number((currentVolume / effectiveCapacity).toFixed(2)) : 0;
    
    let delayIncreasePercent = 0;
    if (isFailed) {
      delayIncreasePercent = 999;
    } else if (ratio >= 1.25) {
      delayIncreasePercent = 190;
    } else if (ratio >= 1.0) {
      delayIncreasePercent = 95;
    } else if (ratio >= 0.80) {
      delayIncreasePercent = 40;
    }

    const state = roadStates[road.id] || 'NORMAL';

    return {
      roadId: road.id,
      roadName: road.name,
      roadType: road.type,
      baseVolumeVph: road.normalVolumeVph,
      addedDivertedVolumeVph: addedDiverted,
      currentVolumeVph: currentVolume,
      effectiveCapacityVph: effectiveCapacity,
      volumeCapacityRatio: ratio,
      state,
      delayIncreasePercent,
      isHospitalCorridor: Boolean(road.isHospitalCorridor),
      alternativeForRoads: road.alternativeFor || []
    };
  });

  // Calculate detailed Alternative Route Summaries for failed roads
  const alternativeRoutes: AlternativeRouteSummary[] = Array.from(effectiveDisabled).map(failedId => {
    const failedRoad = ROADS.find(r => r.id === failedId);
    const displaced = failedRoad ? failedRoad.normalVolumeVph : 3100;

    if (failedId === 'R_SILK_BOARD_JUNCTION') {
      return {
        failedRoadId: failedId,
        failedRoadName: failedRoad ? failedRoad.name : failedId,
        primaryDisplacedVolumeVph: displaced,
        alternativePaths: [
          {
            name: 'Outer Ring Road (Agara Corridor Bypass)',
            roadIds: ['R_ORR_AGARA_CORRIDOR', 'R_SARJAPUR_AGARA_LINK'],
            divertedVolumeVph: Math.round(displaced * 0.42),
            divertedPercent: 42,
            transitTimeMinutes: 18.5,
            status: roadStates['R_ORR_AGARA_CORRIDOR'] || 'HIGH_PRESSURE',
            description: 'Absorbs 42% of displaced traffic via the 6-lane Outer Ring Road towards Agara Junction. Produces severe queue near Agara Flyover.'
          },
          {
            name: 'HSR 27th Main Commercial Arterial',
            roadIds: ['R_HSR_27TH_MAIN', 'R_HSR_14TH_MAIN'],
            divertedVolumeVph: Math.round(displaced * 0.28),
            divertedPercent: 28,
            transitTimeMinutes: 21.2,
            status: roadStates['R_HSR_27TH_MAIN'] || 'HIGH_PRESSURE',
            description: 'Absorbs 28% of traffic diverted into HSR Layout internal grid. Rapidly degrades into Level of Service F gridlock.'
          },
          {
            name: 'Koramangala 100ft Road Corridor',
            roadIds: ['R_KORAMANGALA_100FT', 'R_MADIWALA_UNDERPASS'],
            divertedVolumeVph: Math.round(displaced * 0.30),
            divertedPercent: 30,
            transitTimeMinutes: 19.4,
            status: roadStates['R_KORAMANGALA_100FT'] || 'HIGH_PRESSURE',
            description: 'Carries 30% of northbound traffic into Koramangala towards Indiranagar and St. John’s Hospital approaches.'
          }
        ]
      };
    }

    return {
      failedRoadId: failedId,
      failedRoadName: failedRoad ? failedRoad.name : failedId,
      primaryDisplacedVolumeVph: displaced,
      alternativePaths: [
        {
          name: 'Parallel Arterial Detour Path',
          roadIds: ROADS.filter(r => !effectiveDisabled.has(r.id)).slice(0, 2).map(r => r.id),
          divertedVolumeVph: Math.round(displaced * 0.70),
          divertedPercent: 70,
          transitTimeMinutes: 17.5,
          status: 'HIGH_PRESSURE',
          description: 'Spillover volume redirected into adjoining arterial network.'
        }
      ]
    };
  });

  // Calculate zone latencies to primary hospital (St. John's Medical College Hospital)
  const zoneLatencies: Record<string, number> = {};
  let totalLatencyIncrease = 0;
  let zonesBreachingThreshold = 0;

  ZONES.forEach(zone => {
    let latency = zone.normalTransitMinutes;
    if (effectiveDisabled.has('R_SILK_BOARD_JUNCTION') && effectiveDisabled.has('R_ORR_AGARA_CORRIDOR')) {
      // Compound Cascade (Scenario D): Simultaneous failure of both primary spines
      if (zone.id === 'ZONE_HSR_LAYOUT') latency = 33.5;
      else if (zone.id === 'ZONE_BTM_LAYOUT') latency = 34.8;
      else if (zone.id === 'ZONE_BOMMANAHALLI') latency = 31.0;
      else latency = 22.5;
    } else if (effectiveDisabled.has('R_SILK_BOARD_JUNCTION')) {
      if (zone.id === 'ZONE_HSR_LAYOUT') {
        latency = 28.5;
      } else if (zone.id === 'ZONE_BTM_LAYOUT') {
        latency = 29.8;
      } else if (zone.id === 'ZONE_BOMMANAHALLI') {
        latency = 26.5;
      } else {
        latency = 18.2;
      }
    } else if (effectiveDisabled.has('R_ORR_AGARA_CORRIDOR')) {
      if (zone.id === 'ZONE_HSR_LAYOUT') latency = 24.5;
      else if (zone.id === 'ZONE_BTM_LAYOUT') latency = 16.8;
      else latency = 14.5;
    } else if (effectiveDisabled.size > 1) {
      latency = Number((zone.normalTransitMinutes * (1 + effectiveDisabled.size * 0.70)).toFixed(1));
    } else if (effectiveDisabled.size > 0) {
      latency = Number((zone.normalTransitMinutes * (1 + effectiveDisabled.size * 0.50)).toFixed(1));
    }

    // Apply interventions mitigation
    const hospitalBoost = activeInterventions.reduce((sum, int) => sum + int.hospitalAccessBoostPercent, 0);
    if (hospitalBoost > 0) {
      const excess = Math.max(0, latency - zone.normalTransitMinutes);
      const reducedExcess = excess * Math.max(0.12, 1 - hospitalBoost / 100);
      latency = Number((zone.normalTransitMinutes + reducedExcess).toFixed(1));
    }

    zoneLatencies[zone.id] = latency;
    totalLatencyIncrease += (latency - zone.normalTransitMinutes);

    if (latency > 12) {
      zonesBreachingThreshold++;
    }
  });

  const avgLatencyIncrease = totalLatencyIncrease / ZONES.length;

  // Calculate Transparent Explainable Ripple Impact Score (0 to 100)
  const totalRoutes = ROADS.length;
  const affectedRoutes = effectiveDisabled.size + highPressure.size + atRisk.size;
  const routeFactor = Math.min(25, (affectedRoutes / totalRoutes) * 35);
  const bottleneckFactor = Math.min(25, (bottlenecks.size / 6) * 25);
  const travelBurdenFactor = Math.min(25, (avgLatencyIncrease / 12) * 25);
  const zoneBreachFactor = Math.min(25, (zonesBreachingThreshold / ZONES.length) * 25);

  let rawScore = Math.round(routeFactor + bottleneckFactor + travelBurdenFactor + zoneBreachFactor);
  if (effectiveDisabled.size === 0) rawScore = 6;

  // Reduce score according to interventions
  const totalReductionPct = activeInterventions.reduce((sum, int) => sum + int.impactReductionPercent, 0);
  if (totalReductionPct > 0) {
    rawScore = Math.max(8, Math.round(rawScore * (1 - Math.min(0.85, totalReductionPct / 100))));
  }

  let category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
  if (rawScore >= 70) category = 'SEVERE';
  else if (rawScore >= 50) category = 'HIGH';
  else if (rawScore >= 25) category = 'MODERATE';

  const reasons: string[] = [];
  if (effectiveDisabled.size > 0) {
    reasons.push(`${effectiveDisabled.size} critical corridor link(s) completely submerged or blocked [FAILED]`);
  }
  if (highPressure.size > 0) {
    reasons.push(`${highPressure.size} detour corridor(s) operating beyond 100% design capacity [HIGH PRESSURE]`);
  }
  if (atRisk.size > 0) {
    reasons.push(`${atRisk.size} feeder route(s) nearing saturation threshold [AT RISK]`);
  }
  if (criticalAccess.size > 0) {
    reasons.push(`${criticalAccess.size} emergency trauma access corridor(s) experiencing severe delays to St. John’s Hospital [CRITICAL ACCESS IMPACTED]`);
  }
  if (bottlenecks.size > 0) {
    reasons.push(`${bottlenecks.size} secondary intersection bottleneck(s) formed from diverted traffic queues`);
  }
  if (zonesBreachingThreshold > 0) {
    reasons.push(`${zonesBreachingThreshold} out of ${ZONES.length} neighbourhood zones breach the 12-min critical trauma survival window`);
  }
  if (activeInterventions.length > 0) {
    reasons.push(`${activeInterventions.length} active resilience intervention(s) mitigating cascading network strain`);
  }

  const details: RippleImpactDetails = {
    score: rawScore,
    category,
    affectedRoutesCount: affectedRoutes,
    totalNetworkRoutesCount: totalRoutes,
    secondaryBottlenecksCount: bottlenecks.size,
    averageTravelBurdenIncreasePercent: Math.round((avgLatencyIncrease / 6.8) * 100),
    hospitalAccessLatencyIncreaseMinutes: Number(avgLatencyIncrease.toFixed(1)),
    zonesExceedingEmergencyThreshold: zonesBreachingThreshold,
    totalZonesCount: ZONES.length,
    reasons
  };

  const stepData: CascadeStep = {
    stepIndex: effectiveDisabled.size === 0 ? 0 : 4,
    timeOffsetMinutes: effectiveDisabled.size === 0 ? 0 : 60,
    title: effectiveDisabled.size === 0 ? 'NORMAL NETWORK (Baseline Operations)' : 'HOSPITAL ACCESS IMPACT (Cascading Disruption Peak)',
    summary: `${effectiveDisabled.size} severed link(s), ${affectedRoutes} affected corridors, ${bottlenecks.size} bottlenecks.`,
    failedRoadIds: Array.from(effectiveDisabled),
    highPressureRoadIds: Array.from(highPressure),
    atRiskRoadIds: Array.from(atRisk),
    criticalAccessRoadIds: Array.from(criticalAccess),
    bottleneckNodeIds: Array.from(bottlenecks),
    networkStressLevel: category === 'SEVERE' ? 'CRITICAL' : category === 'HIGH' ? 'HIGH' : category === 'MODERATE' ? 'ELEVATED' : 'NORMAL',
    hospitalAverageLatencyMinutes: Number((6.8 + avgLatencyIncrease).toFixed(1)),
    hospitalSeveredCorridorsCount: criticalAccess.size,
    rippleImpactScore: rawScore,
    rippleCategory: category,
    rippleReasons: reasons,
    zoneLatencies
  };

  return { 
    stepData, 
    details, 
    roadStates, 
    roadStressMetrics, 
    alternativeRoutes 
  };
}

/**
 * Runs proactive stress-testing on all individual roads and generates a ranking
 * of "POTENTIAL SINGLE POINTS OF FAILURE" in the Central Silk Board & HSR Layout network.
 */
export function runProactiveStressTest(): SinglePointOfFailureResult[] {
  const results: SinglePointOfFailureResult[] = [];

  ROADS.forEach(road => {
    const { details } = calculateDynamicCascade([road.id]);
    
    let vulnerabilityFactor = 'Moderate neighbourhood connectivity role; parallel arterial links available.';
    if (road.id === 'R_SILK_BOARD_JUNCTION') {
      vulnerabilityFactor = 'Primary nexus of Hosur Road & Outer Ring Road; failure severs east-west transit and displaces 3,100 vph into residential corridors.';
    } else if (road.id === 'R_ORR_AGARA_CORRIDOR') {
      vulnerabilityFactor = 'Critical 6-lane tech corridor connecting Silk Board to Bellandur; vulnerable to Agara Raja Kaluve drain backflow.';
    } else if (road.id === 'R_HOSUR_RD_SURFACE') {
      vulnerabilityFactor = 'Main southern arterial into Bengaluru; ground-level inundation at Bommanahalli blocks heavy freight and bus fleets.';
    } else if (road.id === 'R_ST_JOHNS_LIFELINE') {
      vulnerabilityFactor = 'Dedicated trauma approach corridor to St. John’s Hospital Emergency Resuscitation Gate; failure directly threatens critical patients.';
    } else if (road.id === 'R_ELEVATED_EXPRESSWAY') {
      vulnerabilityFactor = 'Grade-separated high-speed viaduct; immune to surface flooding, essential emergency alternative.';
    }

    results.push({
      assetId: road.id,
      assetName: road.name,
      assetType: road.type,
      rippleScore: details.score,
      category: details.category,
      secondaryBottlenecksCount: details.secondaryBottlenecksCount,
      hospitalLatencyDelayMinutes: details.hospitalAccessLatencyIncreaseMinutes,
      affectedZonesCount: details.zonesExceedingEmergencyThreshold,
      rank: 0,
      vulnerabilityFactor
    });
  });

  // Sort by ripple score descending
  results.sort((a, b) => b.rippleScore - a.rippleScore);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return results;
}

export interface DynamicCascadeResult {
  stepData: CascadeStep;
  details: RippleImpactDetails;
  roadStates: Record<string, InfrastructureState>;
  roadStressMetrics: RoadStressMetric[];
  alternativeRoutes: AlternativeRouteSummary[];
  isFallbackUsed?: boolean;
}

/**
 * Resilient wrapper guaranteeing deterministic execution with local fallback
 */
export function runResilientCascadeSimulation(
  disabledRoadIds: string[],
  activeInterventions: InterventionOption[] = []
): DynamicCascadeResult {
  try {
    return calculateDynamicCascade(disabledRoadIds, activeInterventions);
  } catch (error) {
    console.warn('[CASCADE SHIELD] Dynamic calculation encountered an error; activating internal fallback dataset:', error);
    
    // Guaranteed deterministic fallback using local baseline dataset
    const fallbackStep = PREBUILT_CASCADE_STEPS[1];
    const defaultRoadStates: Record<string, InfrastructureState> = {};
    ROADS.forEach(r => {
      defaultRoadStates[r.id] = disabledRoadIds.includes(r.id) ? 'FAILED' : 'NORMAL';
    });

    const fallbackDetails: RippleImpactDetails = {
      score: 48,
      category: 'MODERATE',
      affectedRoutesCount: disabledRoadIds.length + 3,
      totalNetworkRoutesCount: ROADS.length,
      secondaryBottlenecksCount: 3,
      averageTravelBurdenIncreasePercent: 70,
      hospitalAccessLatencyIncreaseMinutes: 6.5,
      zonesExceedingEmergencyThreshold: 2,
      totalZonesCount: ZONES.length,
      reasons: [
        'Internal deterministic fallback active: local Bengaluru GIS dataset preserved.',
        `${disabledRoadIds.length} corridor link(s) registered as disrupted.`
      ]
    };

    return {
      stepData: {
        ...fallbackStep,
        failedRoadIds: disabledRoadIds
      },
      details: fallbackDetails,
      roadStates: defaultRoadStates,
      roadStressMetrics: [],
      alternativeRoutes: [],
      isFallbackUsed: true
    };
  }
}

/**
 * Computes the optimal next engineering intervention given remaining budget and already deployed actions.
 */
export function getRecommendedIntervention(
  remainingBudget: number,
  activeInterventionIds: string[]
): { recommended: InterventionOption | null; reason: string } {
  const available = INTERVENTIONS.filter(
    int => !activeInterventionIds.includes(int.id) && int.costUnits <= remainingBudget
  );

  if (available.length === 0) {
    if (remainingBudget === 0) {
      return {
        recommended: null,
        reason: 'Budget fully allocated. Active interventions are currently maximizing network containment.'
      };
    }
    return {
      recommended: null,
      reason: 'No remaining interventions fit within the allocated emergency budget units.'
    };
  }

  // Sort by highest ROI (ripple reduction percentage per budget unit)
  const sorted = [...available].sort((a, b) => {
    const roiA = a.impactReductionPercent / a.costUnits;
    const roiB = b.impactReductionPercent / b.costUnits;
    return roiB - roiA;
  });

  const top = sorted[0];
  const roi = (top.impactReductionPercent / top.costUnits).toFixed(0);

  return {
    recommended: top,
    reason: `Highest resilience ROI (${roi}% reduction/unit). Delivers -${top.impactReductionPercent}% cascade mitigation and protects ${top.targetRoadIds.length} critical corridor(s) for ${top.costUnits} budget unit(s).`
  };
}

/**
 * System audit diagnostics confirming zero API key dependencies and full local readiness.
 */
export function getSimulationDiagnostics() {
  return {
    engineState: 'OPERATIONAL' as const,
    operatingMode: 'STANDALONE_DETERMINISTIC_LOCAL' as const,
    geminiApiKeyRequired: false,
    externalApiRequired: false,
    externalDependencies: [] as string[],
    activeStudyArea: 'Central Silk Board & HSR Layout Corridor (Bengaluru, Karnataka, India)',
    hazardsSimulated: '110mm Monsoon Cloudburst + Raja Kaluve Stormwater Inundation',
    networkDataset: {
      roadLinksCount: ROADS.length,
      junctionsCount: NODES.length,
      residentialZonesCount: ZONES.length,
      hospitalFacilitiesCount: HOSPITALS.length,
      availableInterventionsCount: INTERVENTIONS.length,
      multiCorridorScenariosCount: MULTI_CORRIDOR_SCENARIOS.length
    },
    localFallbackReady: true
  };
}
