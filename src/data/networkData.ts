import { NetworkNode, RoadLink, ZoneData, HospitalFacility, InterventionOption, CorridorScenario } from '../types';

// Study Area: Central Silk Board & HSR Layout — Outer Ring Road Corridor (Bengaluru, Karnataka, India)
export const STUDY_AREA_INFO = {
  name: 'Central Silk Board & HSR Layout Corridor',
  locality: 'Central Silk Board & HSR Layout (Agara-Bellandur Lake Catchment)',
  cityState: 'Bengaluru, Karnataka, India',
  region: 'Bommanahalli & South Zone, Bruhat Bengaluru Mahanagara Palike (BBMP)',
  center: { lat: 12.9215, lng: 77.6360 },
  zoom: 14,
  hazard: {
    type: 'Monsoon Cloudburst & Raja Kaluve Stormwater Overflow',
    rainfallMm: 110,
    surgeHeightMeters: 1.1,
    triggerLocationName: 'Central Silk Board Underpass & Agara Lake Raja Kaluve Channel',
    vulnerabilitySummary: 'Central Silk Board junction and the Outer Ring Road (ORR) form Bengaluru’s most congested multi-modal transit nexus, connecting HSR Layout, Koramangala, BTM Layout, and the Bellandur IT corridor. The area occupies a natural drainage depression between Agara Lake, Bellandur Lake, and Madiwala Lake. During intense monsoon cloudbursts (110mm in 2 hours), the primary stormwater drain (Raja Kaluve) overflows, submerging the low-lying Silk Board underpass, Agara-ORR junction, and Hosur Road surface lanes under 0.8–1.2m of runoff. This severs arterial access, isolates HSR Layout, and severely delays emergency trauma routing to St. John’s Medical College Hospital.'
  },
  simulationAssumptions: {
    geographicTruth: 'All road alignments, GPS coordinates, junction geometries, stormwater drain topography, and medical facilities (St. John’s Medical College Hospital, Manipal Hospital Sarjapur Road, Greenview Medical Hospital, and Jayadeva Institute) reflect real geographic infrastructure in Bengaluru, Karnataka, India.',
    modelType: 'Deterministic network flow redistribution using Volume-to-Capacity (V/C) ratios and Bureau of Public Roads (BPR) delay functions. Travel times, queue spillbacks, and displaced volumes are scenario-based simulations for resilience planning, not live sensor telematics.',
    emergencyThresholdMinutes: 12,
    peakDisplacedVolumeVph: 3400
  },
  floodPolygonCoordinates: [
    [12.9150, 77.6200],
    [12.9175, 77.6235],
    [12.9210, 77.6280],
    [12.9250, 77.6380],
    [12.9270, 77.6510],
    [12.9230, 77.6520],
    [12.9180, 77.6400],
    [12.9140, 77.6260]
  ] as [number, number][]
};

export const NODES: NetworkNode[] = [
  { 
    id: 'N_SILK_BOARD', 
    name: 'Central Silk Board Junction & Underpass', 
    location: { lat: 12.9175, lng: 77.6235 }, 
    type: 'INTERSECTION', 
    isBottleneck: true, 
    notes: 'Primary nexus of Hosur Road (NH 44), Outer Ring Road, and BTM Layout; low-elevation drainage sag prone to flash flooding' 
  },
  { 
    id: 'N_AGARA_JUNCTION', 
    name: 'Agara Lake Junction & Flyover Approach', 
    location: { lat: 12.9255, lng: 77.6515 }, 
    type: 'BRIDGE_ACCESS', 
    isBottleneck: true, 
    notes: 'Major arterial interchange connecting ORR to Sarjapur Road and HSR Sector 1; vulnerable to Raja Kaluve overflow' 
  },
  { 
    id: 'N_MADIWALA_CHECKPOST', 
    name: 'Madiwala Market & Checkpost Junction', 
    location: { lat: 12.9230, lng: 77.6185 }, 
    type: 'INTERSECTION', 
    isBottleneck: true, 
    notes: 'Dense commercial market arterial connecting Hosur Road to St. John’s emergency approaches' 
  },
  { 
    id: 'N_ST_JOHNS_GATE', 
    name: 'St. John’s Medical College Hospital Trauma Gate', 
    location: { lat: 12.9335, lng: 77.6210 }, 
    type: 'HOSPITAL_GATE', 
    notes: '24/7 Level-1 Emergency Trauma Center and resuscitation bay on Sarjapur Road / John Nagar' 
  },
  { 
    id: 'N_HSR_27TH_MAIN', 
    name: 'HSR 27th Main Commercial Arterial Signal', 
    location: { lat: 12.9125, lng: 77.6440 }, 
    type: 'INTERSECTION', 
    isBottleneck: true, 
    notes: 'North-south commercial spine through HSR Layout Sectors 1 and 2; primary local diversion corridor' 
  },
  { 
    id: 'N_HSR_14TH_MAIN', 
    name: 'HSR 14th Main & 19th Main Cross', 
    location: { lat: 12.9160, lng: 77.6350 }, 
    type: 'INTERSECTION', 
    notes: 'Internal residential/commercial collector grid serving HSR Sectors 2, 3 and 5' 
  },
  { 
    id: 'N_BTM_29TH_MAIN', 
    name: 'BTM Layout 2nd Stage 29th Main Junction', 
    location: { lat: 12.9140, lng: 77.6110 }, 
    type: 'INTERSECTION', 
    isBottleneck: true, 
    notes: 'Western arterial approach connecting BTM residential sector to Silk Board and Bannerghatta Road' 
  },
  { 
    id: 'N_KORAMANGALA_100FT', 
    name: 'Koramangala 100 Feet Road & Water Tank Signal', 
    location: { lat: 12.9340, lng: 77.6280 }, 
    type: 'INTERSECTION', 
    isBottleneck: true, 
    notes: 'High-volume commercial arterial funneling northbound traffic into Koramangala and Indiranagar' 
  },
  { 
    id: 'N_SARJAPUR_JAKKASANDRA', 
    name: 'Sarjapur Road & Jakkasandra Signal', 
    location: { lat: 12.9280, lng: 77.6380 }, 
    type: 'INTERSECTION', 
    notes: 'Key bypass link connecting Agara Junction directly to Koramangala 1st Block' 
  },
  { 
    id: 'N_BOMMANAHALLI', 
    name: 'Bommanahalli Junction & Hosur Road Flyover Base', 
    location: { lat: 12.9030, lng: 77.6250 }, 
    type: 'LOGISTICS_HUB', 
    notes: 'Southern entrance to Bengaluru industrial and tech corridor; entry point to Electronic City Expressway' 
  },
  { 
    id: 'N_IBLUR_BELLANDUR', 
    name: 'Iblur Junction & Bellandur ORR Gateway', 
    location: { lat: 12.9260, lng: 77.6710 }, 
    type: 'BRIDGE_ACCESS', 
    notes: 'Eastern gateway leading to Bellandur Lake IT parks (EcoSpace, RMZ Ecoworld, Cessna Tech Park)' 
  },
  { 
    id: 'N_GREENVIEW_GATE', 
    name: 'Greenview Medical Hospital Gate (HSR Sector 5)', 
    location: { lat: 12.9150, lng: 77.6360 }, 
    type: 'HOSPITAL_GATE', 
    notes: 'Local multi-speciality and acute trauma stabilization facility in HSR Layout' 
  }
];

export const ROADS: RoadLink[] = [
  {
    id: 'R_SILK_BOARD_JUNCTION',
    name: 'Central Silk Board Underpass & Flyover Nexus',
    type: 'BRIDGE',
    fromNodeId: 'N_BTM_29TH_MAIN',
    toNodeId: 'N_SILK_BOARD',
    coordinates: [
      [12.9140, 77.6110],
      [12.9160, 77.6175],
      [12.9175, 77.6235]
    ],
    baseLengthKm: 1.40,
    baseCapacityVph: 3600,
    baseFreeFlowSpeedKmh: 45,
    normalVolumeVph: 3100,
    isPrimaryVulnerability: true,
    vulnerabilityDescription: 'Primary multi-modal nexus connecting BTM, Hosur Road, and Outer Ring Road. Low-elevation underpass submerges under 1.1m floodwaters during intense cloudbursts, cutting off east-west transit.',
    isHospitalCorridor: true
  },
  {
    id: 'R_ORR_AGARA_CORRIDOR',
    name: 'Outer Ring Road (Silk Board to Agara Junction)',
    type: 'ARTERIAL',
    fromNodeId: 'N_SILK_BOARD',
    toNodeId: 'N_AGARA_JUNCTION',
    coordinates: [
      [12.9175, 77.6235],
      [12.9215, 77.6360],
      [12.9255, 77.6515]
    ],
    baseLengthKm: 3.20,
    baseCapacityVph: 3400,
    baseFreeFlowSpeedKmh: 55,
    normalVolumeVph: 2750,
    alternativeFor: ['R_SILK_BOARD_JUNCTION'],
    vulnerabilityDescription: 'Crucial 6-lane tech corridor skirting HSR Layout. Severe waterlogging near Agara Flyover base caused by Raja Kaluve stormwater backflow.',
    isHospitalCorridor: true
  },
  {
    id: 'R_HOSUR_RD_SURFACE',
    name: 'Hosur Road Surface Arterial (Bommanahalli to Silk Board)',
    type: 'ARTERIAL',
    fromNodeId: 'N_BOMMANAHALLI',
    toNodeId: 'N_SILK_BOARD',
    coordinates: [
      [12.9030, 77.6250],
      [12.9100, 77.6240],
      [12.9175, 77.6235]
    ],
    baseLengthKm: 1.65,
    baseCapacityVph: 2800,
    baseFreeFlowSpeedKmh: 40,
    normalVolumeVph: 2300,
    isHospitalCorridor: true
  },
  {
    id: 'R_MADIWALA_UNDERPASS',
    name: 'Madiwala Market to St. John’s Approach Road',
    type: 'COLLECTOR',
    fromNodeId: 'N_SILK_BOARD',
    toNodeId: 'N_MADIWALA_CHECKPOST',
    coordinates: [
      [12.9175, 77.6235],
      [12.9200, 77.6210],
      [12.9230, 77.6185]
    ],
    baseLengthKm: 0.85,
    baseCapacityVph: 1900,
    baseFreeFlowSpeedKmh: 35,
    normalVolumeVph: 1450,
    isHospitalCorridor: true
  },
  {
    id: 'R_ST_JOHNS_LIFELINE',
    name: 'St. John’s Trauma Emergency Lifeline (Sarjapur Rd)',
    type: 'EMERGENCY_CORRIDOR',
    fromNodeId: 'N_MADIWALA_CHECKPOST',
    toNodeId: 'N_ST_JOHNS_GATE',
    coordinates: [
      [12.9230, 77.6185],
      [12.9280, 77.6195],
      [12.9335, 77.6210]
    ],
    baseLengthKm: 1.20,
    baseCapacityVph: 1800,
    baseFreeFlowSpeedKmh: 40,
    normalVolumeVph: 920,
    isHospitalCorridor: true
  },
  {
    id: 'R_KORAMANGALA_100FT',
    name: 'Koramangala 100 Feet Road Commercial Spine',
    type: 'ARTERIAL',
    fromNodeId: 'N_MADIWALA_CHECKPOST',
    toNodeId: 'N_KORAMANGALA_100FT',
    coordinates: [
      [12.9230, 77.6185],
      [12.9290, 77.6240],
      [12.9340, 77.6280]
    ],
    baseLengthKm: 1.55,
    baseCapacityVph: 2400,
    baseFreeFlowSpeedKmh: 45,
    normalVolumeVph: 1750,
    alternativeFor: ['R_SILK_BOARD_JUNCTION', 'R_ORR_AGARA_CORRIDOR']
  },
  {
    id: 'R_SARJAPUR_AGARA_LINK',
    name: 'Sarjapur Main Road (Agara to Jakkasandra Link)',
    type: 'ARTERIAL',
    fromNodeId: 'N_AGARA_JUNCTION',
    toNodeId: 'N_SARJAPUR_JAKKASANDRA',
    coordinates: [
      [12.9255, 77.6515],
      [12.9270, 77.6440],
      [12.9280, 77.6380]
    ],
    baseLengthKm: 1.60,
    baseCapacityVph: 2100,
    baseFreeFlowSpeedKmh: 40,
    normalVolumeVph: 1420,
    alternativeFor: ['R_ORR_AGARA_CORRIDOR'],
    isHospitalCorridor: true
  },
  {
    id: 'R_JAKKASANDRA_ST_JOHNS',
    name: 'Jakkasandra to St. John’s Hospital Connector',
    type: 'COLLECTOR',
    fromNodeId: 'N_SARJAPUR_JAKKASANDRA',
    toNodeId: 'N_ST_JOHNS_GATE',
    coordinates: [
      [12.9280, 77.6380],
      [12.9310, 77.6290],
      [12.9335, 77.6210]
    ],
    baseLengthKm: 1.95,
    baseCapacityVph: 1600,
    baseFreeFlowSpeedKmh: 35,
    normalVolumeVph: 1050,
    isHospitalCorridor: true
  },
  {
    id: 'R_HSR_27TH_MAIN',
    name: 'HSR Layout 27th Main Commercial Arterial',
    type: 'COLLECTOR',
    fromNodeId: 'N_SILK_BOARD',
    toNodeId: 'N_HSR_27TH_MAIN',
    coordinates: [
      [12.9175, 77.6235],
      [12.9140, 77.6340],
      [12.9125, 77.6440]
    ],
    baseLengthKm: 2.30,
    baseCapacityVph: 1700,
    baseFreeFlowSpeedKmh: 35,
    normalVolumeVph: 1100,
    alternativeFor: ['R_ORR_AGARA_CORRIDOR', 'R_SILK_BOARD_JUNCTION']
  },
  {
    id: 'R_HSR_14TH_MAIN',
    name: 'HSR 14th Main Internal Relief Arterial',
    type: 'LOCAL',
    fromNodeId: 'N_HSR_14TH_MAIN',
    toNodeId: 'N_AGARA_JUNCTION',
    coordinates: [
      [12.9160, 77.6350],
      [12.9210, 77.6430],
      [12.9255, 77.6515]
    ],
    baseLengthKm: 2.10,
    baseCapacityVph: 1300,
    baseFreeFlowSpeedKmh: 30,
    normalVolumeVph: 680,
    alternativeFor: ['R_ORR_AGARA_CORRIDOR']
  },
  {
    id: 'R_ELEVATED_EXPRESSWAY',
    name: 'Electronic City Elevated Expressway Viaduct (Grade-Separated)',
    type: 'BRIDGE',
    fromNodeId: 'N_BOMMANAHALLI',
    toNodeId: 'N_MADIWALA_CHECKPOST',
    coordinates: [
      [12.9030, 77.6250],
      [12.9130, 77.6210],
      [12.9230, 77.6185]
    ],
    baseLengthKm: 2.45,
    baseCapacityVph: 3200,
    baseFreeFlowSpeedKmh: 75,
    normalVolumeVph: 1600,
    alternativeFor: ['R_SILK_BOARD_JUNCTION', 'R_HOSUR_RD_SURFACE'],
    isHospitalCorridor: true
  },
  {
    id: 'R_IBLUR_ORR_LINK',
    name: 'Outer Ring Road (Agara to Iblur / Bellandur Gateway)',
    type: 'ARTERIAL',
    fromNodeId: 'N_AGARA_JUNCTION',
    toNodeId: 'N_IBLUR_BELLANDUR',
    coordinates: [
      [12.9255, 77.6515],
      [12.9260, 77.6610],
      [12.9260, 77.6710]
    ],
    baseLengthKm: 2.10,
    baseCapacityVph: 3200,
    baseFreeFlowSpeedKmh: 55,
    normalVolumeVph: 2500,
    alternativeFor: ['R_ORR_AGARA_CORRIDOR'],
    isHospitalCorridor: true
  }
];

export const HOSPITALS: HospitalFacility[] = [
  {
    id: 'HOSP_ST_JOHNS',
    name: 'St. John’s Medical College Hospital',
    type: 'TRAUMA_CENTER',
    location: { lat: 12.9335, lng: 77.6210 },
    nodeId: 'N_ST_JOHNS_GATE',
    beds: 1350,
    traumaBays: 24,
    emergencyThresholdMinutes: 12
  },
  {
    id: 'HOSP_MANIPAL_SARJAPUR',
    name: 'Manipal Hospital Sarjapur Road',
    type: 'TRAUMA_CENTER',
    location: { lat: 12.9260, lng: 77.6710 },
    nodeId: 'N_IBLUR_BELLANDUR',
    beds: 180,
    traumaBays: 10,
    emergencyThresholdMinutes: 15
  },
  {
    id: 'HOSP_GREENVIEW',
    name: 'Greenview Medical Hospital (HSR Layout Sector 5)',
    type: 'COMMUNITY_CLINIC',
    location: { lat: 12.9150, lng: 77.6360 },
    nodeId: 'N_GREENVIEW_GATE',
    beds: 85,
    traumaBays: 6,
    emergencyThresholdMinutes: 15
  },
  {
    id: 'HOSP_JAYADEVA',
    name: 'Sri Jayadeva Institute of Cardiovascular Sciences (BTM)',
    type: 'EMS_STATION',
    location: { lat: 12.9140, lng: 77.6110 },
    nodeId: 'N_BTM_29TH_MAIN',
    beds: 1150,
    traumaBays: 20,
    emergencyThresholdMinutes: 12
  }
];

export const ZONES: ZoneData[] = [
  {
    id: 'ZONE_HSR_LAYOUT',
    name: 'HSR Layout (Sectors 1–7 Tech Enclave)',
    population: 98500,
    centroid: { lat: 12.9150, lng: 77.6400 },
    polygon: [
      [12.9255, 77.6360],
      [12.9255, 77.6515],
      [12.9050, 77.6515],
      [12.9050, 77.6360]
    ],
    primaryHospitalId: 'HOSP_ST_JOHNS',
    normalTransitMinutes: 6.8
  },
  {
    id: 'ZONE_BTM_LAYOUT',
    name: 'BTM Layout (1st & 2nd Stage Dense Commuter Ward)',
    population: 86000,
    centroid: { lat: 12.9140, lng: 77.6150 },
    polygon: [
      [12.9220, 77.6080],
      [12.9220, 77.6235],
      [12.9060, 77.6235],
      [12.9060, 77.6080]
    ],
    primaryHospitalId: 'HOSP_ST_JOHNS',
    normalTransitMinutes: 7.2
  },
  {
    id: 'ZONE_KORAMANGALA_SOUTH',
    name: 'Koramangala South & Jakkasandra Commercial Ward',
    population: 64000,
    centroid: { lat: 12.9310, lng: 77.6260 },
    polygon: [
      [12.9360, 77.6180],
      [12.9360, 77.6350],
      [12.9250, 77.6350],
      [12.9250, 77.6180]
    ],
    primaryHospitalId: 'HOSP_ST_JOHNS',
    normalTransitMinutes: 5.4
  },
  {
    id: 'ZONE_BOMMANAHALLI',
    name: 'Bommanahalli & Mangammanapalya Corridor',
    population: 72000,
    centroid: { lat: 12.9040, lng: 77.6280 },
    polygon: [
      [12.9120, 77.6200],
      [12.9120, 77.6360],
      [12.8980, 77.6360],
      [12.8980, 77.6200]
    ],
    primaryHospitalId: 'HOSP_ST_JOHNS',
    normalTransitMinutes: 8.5
  }
];

export const INTERVENTIONS: InterventionOption[] = [
  {
    id: 'INT_SILK_BOARD_SUMP',
    name: 'Deploy High-Capacity Stormwater Sump & Rapid Flood Gates at Silk Board Underpass',
    tagline: 'Defends Central Silk Board from total submersion; keeps 1 emergency lane passable',
    description: 'Deploys BBMP rapid emergency dewatering pump stations (10,000 gpm capacity) and pneumatic inflatable flood barriers at the Central Silk Board underpass portals to prevent 1.1m flooding and escort emergency ambulances.',
    interventionType: 'PROTECT_ROUTE',
    costUnits: 1,
    implementationSpeedMinutes: 30,
    targetRoadIds: ['R_SILK_BOARD_JUNCTION'],
    preventFailure: true,
    capacityBoostPercent: 45,
    hospitalAccessBoostPercent: 88,
    impactReductionPercent: 50,
    mitigatedBottlenecksCount: 5,
    explainableWhy: 'Directly defends Bengaluru’s most critical transit nexus from complete flooding, preserving single-lane ambulance access into Hosur Road and preventing 3,100 vph from spilling into narrow HSR Layout residential lanes.'
  },
  {
    id: 'INT_ELEVATED_EMERGENCY_LANE',
    name: 'Designate Electronic City Elevated Expressway as Exclusive Emergency Transit Lifeline',
    tagline: 'Opens grade-separated, flood-immune viaduct directly to St. John’s Trauma Gate',
    description: 'Coordinates traffic police to commandeer one dedicated northbound lane of the Electronic City Elevated Expressway exclusively for emergency ambulances, paramedical response teams, and essential evacuation vehicles.',
    interventionType: 'OPERATIONAL_PRIORITY',
    costUnits: 1,
    implementationSpeedMinutes: 15,
    targetRoadIds: ['R_ELEVATED_EXPRESSWAY', 'R_ST_JOHNS_LIFELINE'],
    opensBypass: true,
    capacityBoostPercent: 55,
    hospitalAccessBoostPercent: 92,
    impactReductionPercent: 44,
    mitigatedBottlenecksCount: 4,
    explainableWhy: 'Bypasses ground-level waterlogging entirely via the elevated viaduct, enabling ambulances from Bommanahalli and Electronic City to reach St. John’s Medical College Hospital in under 8 minutes regardless of surface inundation.'
  },
  {
    id: 'INT_AGARA_KALUVE_DESILTING',
    name: 'Rapid Desilting & Agara-Bellandur Raja Kaluve Diversion Bunds',
    tagline: 'Protects Outer Ring Road Agara stretch from stormwater backflow breach',
    description: 'Mobilizes backhoes and mobile dewatering pumps to clear Raja Kaluve drainage choke points near Agara Lake and sets up temporary retaining bunds along the ORR median.',
    interventionType: 'REINFORCE_CORRIDOR',
    costUnits: 1,
    implementationSpeedMinutes: 45,
    targetRoadIds: ['R_ORR_AGARA_CORRIDOR', 'R_SARJAPUR_AGARA_LINK'],
    preventFailure: true,
    capacityBoostPercent: 40,
    hospitalAccessBoostPercent: 75,
    impactReductionPercent: 38,
    mitigatedBottlenecksCount: 3,
    explainableWhy: 'Prevents stormwater drain backflow from flooding the critical Outer Ring Road Agara approach, keeping the 6-lane arterial open for traffic diverted away from Silk Board.'
  },
  {
    id: 'INT_DYNAMIC_SIGNAL_HSR',
    name: 'Dynamic Adaptive Signal Preemption on HSR 27th Main & Sarjapur Road',
    tagline: 'Triples green-cycle capacity on detour corridors to clear queue spillover',
    description: 'Switches traffic controllers at HSR 27th Main and Jakkasandra Junction to emergency green-wave flush mode, favoring redirected northbound and westbound detour traffic.',
    interventionType: 'INCREASE_CAPACITY',
    costUnits: 1,
    implementationSpeedMinutes: 10,
    targetRoadIds: ['R_HSR_27TH_MAIN', 'R_SARJAPUR_AGARA_LINK', 'R_KORAMANGALA_100FT'],
    capacityBoostPercent: 35,
    hospitalAccessBoostPercent: 65,
    impactReductionPercent: 32,
    mitigatedBottlenecksCount: 3,
    explainableWhy: 'Prevents turning-movement gridlock at secondary junctions by increasing queue discharge rates by 35%, stopping spillback queues before they block St. John’s Hospital casualty access.'
  }
];

// Pre-calibrated Multi-Corridor Scenarios for Multi-Corridor Analysis Mode
export const MULTI_CORRIDOR_SCENARIOS: CorridorScenario[] = [
  {
    id: 'SCENARIO_SILK_BOARD',
    name: 'Scenario A: Central Silk Board Underpass Submersion',
    tagline: 'Primary 1.1m flooding at Silk Board underpass triggers massive diversion onto ORR and HSR',
    triggerCorridorId: 'R_SILK_BOARD_JUNCTION',
    triggerCorridorName: 'Central Silk Board Underpass & Flyover Nexus',
    hazardDescription: 'Intense cloudburst (110mm in 2 hours) submerges the low-lying Silk Board underpass, cutting off BTM and Hosur Road connection to Outer Ring Road.',
    floodDepthMeters: 1.1,
    displacedVolumeVph: 3100,
    impactedCorridorIds: ['R_SILK_BOARD_JUNCTION', 'R_ORR_AGARA_CORRIDOR', 'R_HSR_27TH_MAIN', 'R_KORAMANGALA_100FT'],
    secondaryBottlenecks: ['N_AGARA_JUNCTION', 'N_MADIWALA_CHECKPOST', 'N_HSR_27TH_MAIN'],
    hospitalAccessImpact: 'St. John’s Medical College Hospital trauma access delayed from 6.8m to 28.5m (+319%). Ambulance approach via Madiwala choked by 1.8km spillover.',
    estimatedRippleScore: 86
  },
  {
    id: 'SCENARIO_AGARA_ORR',
    name: 'Scenario B: Agara Lake Raja Kaluve Breach (ORR Inundation)',
    tagline: 'Stormwater backflow breaches Agara Flyover base; severs tech corridor to Bellandur',
    triggerCorridorId: 'R_ORR_AGARA_CORRIDOR',
    triggerCorridorName: 'Outer Ring Road (Silk Board to Agara Junction)',
    hazardDescription: 'Raja Kaluve drainage channel between Agara Lake and Bellandur Lake breaches retention bunds, flooding 6 lanes of ORR under 0.9m of water.',
    floodDepthMeters: 0.9,
    displacedVolumeVph: 2750,
    impactedCorridorIds: ['R_ORR_AGARA_CORRIDOR', 'R_SARJAPUR_AGARA_LINK', 'R_HSR_14TH_MAIN', 'R_HSR_27TH_MAIN'],
    secondaryBottlenecks: ['N_SARJAPUR_JAKKASANDRA', 'N_HSR_27TH_MAIN', 'N_IBLUR_BELLANDUR'],
    hospitalAccessImpact: 'Eastbound ambulance routing to Manipal Hospital Sarjapur Rd severed; detour via Jakkasandra adds 19.4m delay.',
    estimatedRippleScore: 78
  },
  {
    id: 'SCENARIO_HOSUR_RD',
    name: 'Scenario C: Hosur Road Bommanahalli Surface Inundation',
    tagline: 'Waterlogging at Bommanahalli forces heavy vehicles onto BTM and elevated viaduct',
    triggerCorridorId: 'R_HOSUR_RD_SURFACE',
    triggerCorridorName: 'Hosur Road Surface Arterial (Bommanahalli to Silk Board)',
    hazardDescription: 'Stormwater inundation at Bommanahalli drains under 0.8m water, blocking ground-level bus and goods movement into Bengaluru.',
    floodDepthMeters: 0.8,
    displacedVolumeVph: 2300,
    impactedCorridorIds: ['R_HOSUR_RD_SURFACE', 'R_BTM_29TH_MAIN', 'R_SILK_BOARD_JUNCTION', 'R_ELEVATED_EXPRESSWAY'],
    secondaryBottlenecks: ['N_SILK_BOARD', 'N_BTM_29TH_MAIN'],
    hospitalAccessImpact: 'Ambulance transit from Bommanahalli delayed by 15.2m; elevated expressway becomes sole viable high-speed lifeline.',
    estimatedRippleScore: 72
  },
  {
    id: 'SCENARIO_COMPOUND_CASCADE',
    name: 'Scenario D: Compound Cascade (Silk Board + Agara Breach)',
    tagline: 'Simultaneous failure of both primary spines causes catastrophic South-East network gridlock',
    triggerCorridorId: 'R_SILK_BOARD_JUNCTION',
    triggerCorridorName: 'Central Silk Board & Outer Ring Road Agara Corridor',
    hazardDescription: 'Monsoon cloudburst coincides with maximum lake discharge, simultaneously drowning Silk Board underpass and ORR Agara stretch.',
    floodDepthMeters: 1.2,
    displacedVolumeVph: 5850,
    impactedCorridorIds: ['R_SILK_BOARD_JUNCTION', 'R_ORR_AGARA_CORRIDOR', 'R_HOSUR_RD_SURFACE', 'R_SARJAPUR_AGARA_LINK', 'R_KORAMANGALA_100FT', 'R_HSR_27TH_MAIN'],
    secondaryBottlenecks: ['N_SILK_BOARD', 'N_AGARA_JUNCTION', 'N_MADIWALA_CHECKPOST', 'N_HSR_27TH_MAIN', 'N_BTM_29TH_MAIN'],
    hospitalAccessImpact: '184,500 residents across HSR Layout and BTM isolated beyond the 12-minute golden survival window; average trauma arrival takes 33.5m.',
    estimatedRippleScore: 95
  }
];
