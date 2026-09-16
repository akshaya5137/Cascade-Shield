export type InfrastructureState = 
  | 'NORMAL' 
  | 'HIGH_PRESSURE' 
  | 'AT_RISK' 
  | 'FAILED' 
  | 'CRITICAL_ACCESS_IMPACTED' 
  | 'CRITICAL_ACCESS'
  | 'PROTECTED';

export type RoadType = 'BRIDGE' | 'ARTERIAL' | 'COLLECTOR' | 'LOCAL' | 'EMERGENCY_CORRIDOR';

export type InterventionType = 
  | 'PROTECT_ROUTE' 
  | 'REINFORCE_CORRIDOR' 
  | 'OPEN_DIVERSION' 
  | 'INCREASE_CAPACITY' 
  | 'OPERATIONAL_PRIORITY';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  location: GeoPoint;
  type: 'INTERSECTION' | 'BRIDGE_ACCESS' | 'HOSPITAL_GATE' | 'CIVIC_CENTER' | 'LOGISTICS_HUB';
  isBottleneck?: boolean;
  notes?: string;
}

export interface RoadLink {
  id: string;
  name: string;
  type: RoadType;
  fromNodeId: string;
  toNodeId: string;
  coordinates: [number, number][]; // [lat, lng] array
  baseLengthKm: number;
  baseCapacityVph: number; // vehicles per hour
  baseFreeFlowSpeedKmh: number;
  normalVolumeVph: number;
  isPrimaryVulnerability?: boolean;
  vulnerabilityDescription?: string;
  isHospitalCorridor?: boolean;
  alternativeFor?: string[]; // road IDs this serves as alternative for
}

export interface ZoneData {
  id: string;
  name: string;
  population: number;
  centroid: GeoPoint;
  polygon: [number, number][];
  primaryHospitalId: string;
  normalTransitMinutes: number;
}

export interface HospitalFacility {
  id: string;
  name: string;
  type: 'TRAUMA_CENTER' | 'CHILDRENS_EMERGENCY' | 'COMMUNITY_CLINIC' | 'EMS_STATION';
  location: GeoPoint;
  nodeId: string;
  beds: number;
  traumaBays: number;
  emergencyThresholdMinutes: number; // e.g. 10 or 15 mins
}

export interface CascadeStep {
  stepIndex: number;
  timeOffsetMinutes: number;
  title: string;
  summary: string;
  triggerEvent?: string;
  failedRoadIds: string[];
  highPressureRoadIds: string[];
  atRiskRoadIds: string[];
  criticalAccessRoadIds: string[];
  bottleneckNodeIds: string[];
  networkStressLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  hospitalAverageLatencyMinutes: number;
  hospitalSeveredCorridorsCount: number;
  rippleImpactScore: number;
  rippleCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  rippleReasons: string[];
  zoneLatencies: Record<string, number>; // zoneId -> minutes
  
  // Step-by-step cause-and-effect visualization enrichments
  stepPhase?: 'BASELINE' | 'STEP_1_FAILURE' | 'STEP_2_REDISTRIBUTION' | 'STEP_3_SECONDARY_STRESS' | 'STEP_4_CRITICAL_ACCESS' | 'STEP_5_SUMMARY';
  activeRedirectCorridorIds?: string[]; // for Step 2 directional flow
  roadExplanations?: Record<string, string>; // for Step 3 explanations
  hospitalRoutesBreakdown?: {
    severedRouteIds: string[];
    severeDelayRouteIds: string[];
    viableRouteIds: string[];
  };
  summaryBlock?: {
    initialFailure: string;
    cascadeEffect: string;
    criticalImpact: string;
  };
}

export interface InterventionOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  interventionType: InterventionType;
  costUnits: number; // budget cost (e.g. 1 unit)
  implementationSpeedMinutes: number;
  targetRoadIds: string[];
  capacityBoostPercent?: number; // e.g. +50% capacity
  preventFailure?: boolean; // protects a road from failing
  opensBypass?: boolean; // opens a new emergency link
  bypassLinkId?: string;
  hospitalAccessBoostPercent: number;
  impactReductionPercent: number;
  mitigatedBottlenecksCount: number;
  explainableWhy: string;
}

export interface RoadStressMetric {
  roadId: string;
  roadName: string;
  roadType: RoadType;
  baseVolumeVph: number;
  addedDivertedVolumeVph: number;
  currentVolumeVph: number;
  effectiveCapacityVph: number;
  volumeCapacityRatio: number; // e.g. 1.25
  state: InfrastructureState;
  delayIncreasePercent: number;
  isHospitalCorridor: boolean;
  alternativeForRoads: string[];
}

export interface AlternativeRouteSummary {
  failedRoadId: string;
  failedRoadName: string;
  primaryDisplacedVolumeVph: number;
  alternativePaths: {
    name: string;
    roadIds: string[];
    divertedVolumeVph: number;
    divertedPercent: number;
    transitTimeMinutes: number;
    status: InfrastructureState;
    description: string;
  }[];
}

export interface RippleImpactDetails {
  score: number; // 0 to 100
  category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  affectedRoutesCount: number;
  totalNetworkRoutesCount: number;
  secondaryBottlenecksCount: number;
  averageTravelBurdenIncreasePercent: number;
  hospitalAccessLatencyIncreaseMinutes: number;
  zonesExceedingEmergencyThreshold: number;
  totalZonesCount: number;
  reasons: string[];
}

export interface SinglePointOfFailureResult {
  assetId: string;
  assetName: string;
  assetType: RoadType | 'INTERSECTION';
  rippleScore: number;
  category: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  secondaryBottlenecksCount: number;
  hospitalLatencyDelayMinutes: number;
  affectedZonesCount: number;
  rank: number;
  vulnerabilityFactor: string;
}

export interface CorridorScenario {
  id: string;
  name: string;
  tagline: string;
  triggerCorridorId: string;
  triggerCorridorName: string;
  hazardDescription: string;
  floodDepthMeters: number;
  displacedVolumeVph: number;
  impactedCorridorIds: string[];
  secondaryBottlenecks: string[];
  hospitalAccessImpact: string;
  estimatedRippleScore: number;
}

export type ActiveAppMode = 
  | 'CASCADE_SIMULATION'
  | 'MULTI_CORRIDOR_ANALYSIS'
  | 'HOSPITAL_ACCESS'
  | 'INTERVENTION_PLANNER'
  | 'BEFORE_AFTER_COMPARISON'
  | 'PROACTIVE_STRESS_TEST';

