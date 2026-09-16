import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  RoadLink, 
  NetworkNode, 
  InfrastructureState, 
  ZoneData, 
  HospitalFacility,
  CascadeStep
} from '../../types';
import { STUDY_AREA_INFO } from '../../data/networkData';
import { 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  RotateCcw, 
  Activity, 
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Layers,
  MapPin,
  Hospital,
  RefreshCw
} from 'lucide-react';
import { fetchCascadeExplanation } from '../../services/aiService';

interface CascadeMapProps {
  roads: RoadLink[];
  nodes: NetworkNode[];
  zones: ZoneData[];
  hospitals: HospitalFacility[];
  roadStates: Record<string, InfrastructureState>;
  bottleneckNodeIds: string[];
  failedRoadIds: string[];
  selectedRoadId: string | null;
  onSelectRoad: (road: RoadLink) => void;
  onSelectNode: (node: NetworkNode) => void;
  onSelectHospital?: (hospital: HospitalFacility) => void;
  onMapBackgroundClick?: () => void;
  showInundationZone: boolean;
  onToggleInundationZone?: () => void;
  showHospitalCorridorsOnly?: boolean;
  onToggleHospitalCorridors?: () => void;
  currentStep?: CascadeStep;
  currentStepIndex?: number;
  totalStepsCount?: number;
  onSelectStep?: (index: number) => void;
  onReplayCascade?: () => void;
  isFocusMap?: boolean;
  onToggleFocusMap?: () => void;
  onApplyScenario?: (roadIds: string[]) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  isDrawerOpen?: boolean;
}

export const CascadeMap: React.FC<CascadeMapProps> = ({
  roads,
  nodes,
  zones,
  hospitals,
  roadStates,
  bottleneckNodeIds,
  failedRoadIds,
  selectedRoadId,
  onSelectRoad,
  onSelectNode,
  showInundationZone,
  onToggleInundationZone,
  showHospitalCorridorsOnly = false,
  onToggleHospitalCorridors,
  currentStep,
  currentStepIndex = 0,
  totalStepsCount = 6,
  onSelectStep,
  onReplayCascade,
  isFocusMap = false,
  onToggleFocusMap,
  onApplyScenario,
  isPlaying = false,
  onTogglePlay,
  onSelectHospital,
  onMapBackgroundClick,
  isDrawerOpen = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Overlay visibility states
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(false);
  const [isStepOverlayDismissed, setIsStepOverlayDismissed] = useState<boolean>(false);
  const [isStepOverlayCollapsed, setIsStepOverlayCollapsed] = useState<boolean>(false);

  // AI Narrative state for Story Card
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  const loadCascadeNarrative = async () => {
    setIsAiLoading(true);
    const fallbackText = currentStep?.description || 'Normal network operating conditions observed across all primary arterial corridors.';
    try {
      const res = await fetchCascadeExplanation({
        stepTitle: currentStep?.title || `Stage ${currentStepIndex}`,
        stepPhase: `Stage ${currentStepIndex}`,
        disruptedRoads: currentStep?.failedRoadIds || [],
        rippleScore: currentStep?.rippleScore || 0,
        bottleneckCount: currentStep?.bottleneckNodeIds?.length || 0,
        hospitalDelayMinutes: currentStep?.hospitalAverageLatencyMinutes || 0,
        summaryBlock: currentStep?.summaryBlock,
        fallbackText
      });
      setAiNarrative(res.explanation);
      setIsAiGenerated(res.isAiGenerated);
    } catch {
      setAiNarrative(fallbackText);
      setIsAiGenerated(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    loadCascadeNarrative();
  }, [currentStepIndex, currentStep?.title]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [STUDY_AREA_INFO.center.lat, STUDY_AREA_INFO.center.lng],
      zoom: STUDY_AREA_INFO.zoom,
      minZoom: 13,
      maxZoom: 18,
      zoomControl: false
    });

    // Standard OpenStreetMap raster tile layer (HTTPS, normal interactive viewing)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Map background click dismisses popovers
    map.on('click', () => {
      onMapBackgroundClick?.();
    });

    const layers = L.layerGroup().addTo(map);
    layerGroupRef.current = layers;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size when drawer toggles or focus map changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFocusMap, isDrawerOpen]);

  // Update vectors whenever data or simulation state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Agara Lake Raja Kaluve Inundation Hazard Polygon
    if (showInundationZone && STUDY_AREA_INFO.floodPolygonCoordinates) {
      const floodPoly = L.polygon(STUDY_AREA_INFO.floodPolygonCoordinates, {
        color: '#0284c7',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#0369a1',
        fillOpacity: 0.22,
      }).addTo(layers);

      floodPoly.bindTooltip(
        `<div class="text-xs font-semibold text-cyan-300">
          🌊 Agara-Bellandur Catchment Inundation Zone (110mm Cloudburst + Raja Kaluve Overflow)
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Scenario-Based Hydrological Simulation</div>
        </div>`,
        { sticky: true }
      );
    }

    // 2. Zone Boundaries (HSR Layout, Koramangala, BTM Layout, Bommanahalli)
    zones.forEach(zone => {
      const zonePoly = L.polygon(zone.polygon, {
        color: '#334155',
        weight: 1,
        dashArray: '4, 4',
        fillColor: '#1e293b',
        fillOpacity: 0.12
      }).addTo(layers);

      const zoneLatency = currentStep?.zoneLatencies?.[zone.id] ?? zone.normalTransitMinutes;
      const isBreached = zoneLatency > 12;

      zonePoly.bindTooltip(
        `<div class="p-1">
          <div class="font-bold text-slate-100 text-xs">${zone.name}</div>
          <div class="text-[11px] text-slate-300">Pop: ${zone.population.toLocaleString()} residents</div>
          <div class="text-[10px] ${isBreached ? 'text-rose-400 font-bold' : 'text-slate-400'} mt-0.5">
            Trauma Latency: ${zoneLatency}m ${isBreached ? '(SURVIVAL WINDOW BREACHED)' : ''}
          </div>
        </div>`,
        { sticky: true }
      );
    });

    // 3. Road Links (Polylines)
    roads.forEach(road => {
      const state = roadStates[road.id] || 'NORMAL';
      const isSelected = selectedRoadId === road.id;

      if (showHospitalCorridorsOnly && !road.isHospitalCorridor && state === 'NORMAL') {
        const dimLine = L.polyline(road.coordinates, {
          color: '#334155',
          weight: 2,
          opacity: 0.35
        }).addTo(layers);
        dimLine.on('click', () => onSelectRoad(road));
        return;
      }

      let color = '#38bdf8'; // Normal (cyan/blue)
      let weight = road.type === 'EXPRESSWAY' || road.type === 'ARTERIAL' ? 5 : 3.5;
      let opacity = 0.9;
      let dashArray: string | undefined = undefined;
      let className = '';

      if (state === 'PROTECTED') {
        color = '#10b981'; // Emerald Viable / Protected
        weight = 6.5;
        className = 'leaflet-protected-corridor';
      } else if (state === 'FAILED') {
        color = '#ef4444'; // Red
        weight = 7;
        dashArray = '6, 6';
        className = 'leaflet-failed-road-pulse';
      } else if (state === 'CRITICAL_ACCESS_IMPACTED' || state === 'CRITICAL_ACCESS') {
        color = '#c084fc'; // Purple
        weight = 5.5;
        if (currentStepIndex >= 4) {
          className = 'leaflet-severe-delay-line';
        }
      } else if (state === 'HIGH_PRESSURE') {
        color = '#f59e0b'; // Amber
        weight = 5.5;
      } else if (state === 'AT_RISK') {
        color = '#f97316'; // Deep Orange
        weight = 5;
      }

      // Special viable lifeline: Electronic City Elevated Expressway Viaduct
      if (currentStepIndex >= 4 && road.id === 'R_ELEVATED_ECITY_EXPWY') {
        color = '#10b981'; // Emerald Viable
        className = 'leaflet-viable-emergency-corridor';
        weight = 6.5;
      }

      if (isSelected) {
        weight += 3;
      }

      // Outer glow for selected, failed, protected, or high-pressure roads
      if (state === 'FAILED' || state === 'CRITICAL_ACCESS_IMPACTED' || state === 'AT_RISK' || state === 'PROTECTED' || isSelected) {
        L.polyline(road.coordinates, {
          color: color,
          weight: weight + 6,
          opacity: state === 'PROTECTED' ? 0.4 : 0.25
        }).addTo(layers);
      }

      const poly = L.polyline(road.coordinates, {
        color,
        weight,
        opacity,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        className
      }).addTo(layers);

      poly.on('click', () => {
        onSelectRoad(road);
      });

      const explanation = currentStep?.roadExplanations?.[road.id];
      const statusBadge = 
        state === 'PROTECTED' ? '<span class="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600">[PROTECTED] Active Counter-Measure Applied</span>' :
        state === 'FAILED' ? '<span class="text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-600">[FAILED] Capacity 0 - Impassable</span>' :
        (state === 'CRITICAL_ACCESS_IMPACTED' || state === 'CRITICAL_ACCESS') ? '<span class="text-purple-300 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-600">[CRITICAL ACCESS IMPACTED]</span>' :
        state === 'HIGH_PRESSURE' ? '<span class="text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600">[HIGH PRESSURE] &gt;100% Capacity</span>' :
        state === 'AT_RISK' ? '<span class="text-orange-400 font-bold bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-600">[AT RISK] 80-100% Saturation</span>' :
        road.id === 'R_ELEVATED_ECITY_EXPWY' && currentStepIndex >= 4 ? '<span class="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600">[VIABLE ELEVATED BYPASS]</span>' :
        '<span class="text-cyan-400 font-bold">[NORMAL] Free Flow</span>';

      poly.bindTooltip(
        `<div class="p-1.5 text-xs font-sans max-w-xs">
          <div class="font-bold text-slate-100 flex items-center gap-1.5">${road.name}</div>
          <div class="text-[11px] text-slate-300 mt-0.5 font-mono">${road.type} • ${road.baseCapacityVph.toLocaleString()} vph design capacity</div>
          <div class="mt-1.5 text-[11px]">${statusBadge}</div>
          ${explanation ? `<div class="mt-1.5 p-1 rounded bg-slate-950/90 text-[10px] text-amber-300 border border-slate-800">${explanation}</div>` : ''}
          <div class="text-[10px] text-cyan-400 mt-1">Click corridor to inspect deterministic stress dynamics</div>
        </div>`,
        { sticky: true }
      );
    });

    // STEP 1 VISUAL ENHANCEMENT: Bengaluru Silk Board Inundation Barricades
    if (currentStepIndex >= 1 && failedRoadIds.includes('R_SILK_BOARD_JUNCTION')) {
      const barricadeNodes = [
        { lat: 12.9175, lng: 77.6235, label: 'Silk Board Underpass Portal Barricade' },
        { lat: 12.9190, lng: 77.6255, label: 'ORR Agara Ramp Ramp Apron' }
      ];

      barricadeNodes.forEach(b => {
        const barIcon = L.divIcon({
          html: `
            <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid #ef4444; border-radius: 6px; padding: 3px 6px; box-shadow: 0 0 14px rgba(239,68,68,0.7); display: flex; align-items: center; gap: 5px; white-space: nowrap; cursor: pointer;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 8px #ef4444;"></span>
              <span style="color: #fca5a5; font-size: 10px; font-weight: 800; font-family: monospace;">⛔ BARRICADE • 1.1m INUNDATION</span>
            </div>
          `,
          className: 'custom-barricade-icon',
          iconSize: [210, 26],
          iconAnchor: [105, 13]
        });
        L.marker([b.lat, b.lng], { icon: barIcon }).addTo(layers).bindTooltip(
          `<div class="p-1 text-xs">
            <div class="font-bold text-rose-400">⛔ ${b.label}</div>
            <div class="text-slate-300 text-[11px]">Submerged under 1.1m stormwater runoff. Impassable to emergency transit.</div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">Scenario-Based Simulation</div>
          </div>`,
          { sticky: true }
        );
      });
    }

    // STEP 2 VISUAL ENHANCEMENT: Traffic Flow Vectors on ORR Agara & HSR 27th Main
    if (currentStepIndex >= 2 && currentStepIndex <= 3) {
      const orrRoad = roads.find(r => r.id === 'R_ORR_AGARA_CORRIDOR');
      const hsr27th = roads.find(r => r.id === 'R_HSR_27TH_MAIN');

      if (orrRoad) {
        L.polyline(orrRoad.coordinates, {
          color: '#38bdf8',
          weight: 6,
          opacity: 0.95,
          className: 'leaflet-traffic-flow'
        }).addTo(layers);

        const flowBadgeIcon = L.divIcon({
          html: `
            <div style="background: rgba(8, 47, 73, 0.95); border: 1.5px solid #06b6d4; border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 6px; white-space: nowrap;">
              <span style="font-size: 13px; font-weight: 900; color: #38bdf8;">↗</span>
              <div>
                <div style="color: #ffffff; font-size: 10px; font-weight: 800; font-family: sans-serif;">+1,650 vph DIVERSION</div>
                <div style="color: #67e8f9; font-size: 9px; font-family: monospace;">Detour Flow ➔ ORR Agara</div>
              </div>
            </div>
          `,
          className: 'custom-traffic-flow-badge',
          iconSize: [180, 32],
          iconAnchor: [90, 16]
        });

        L.marker([12.9240, 77.6460], { icon: flowBadgeIcon }).addTo(layers);
      }

      if (hsr27th) {
        L.polyline(hsr27th.coordinates, {
          color: '#38bdf8',
          weight: 5,
          opacity: 0.9,
          className: 'leaflet-traffic-flow'
        }).addTo(layers);
      }
    }

    // STEP 4 VISUAL ENHANCEMENT: St. John's Hospital Access Delay Vector
    if (currentStepIndex >= 4) {
      const hospitalDetourCoords: [number, number][] = [
        [12.9150, 77.6400], // HSR Sector 1
        [12.9230, 77.6320], // Madiwala Checkpost (Spillover)
        [12.9320, 77.6210]  // St. John’s Hospital Gate
      ];

      L.polyline(hospitalDetourCoords, {
        color: '#c084fc',
        weight: 3.5,
        dashArray: '4, 8',
        opacity: 0.85,
        className: 'leaflet-severe-delay-line'
      }).addTo(layers);

      const hospitalImpactBadge = L.divIcon({
        html: `
          <div style="background: rgba(59, 7, 100, 0.95); border: 2px solid #c084fc; border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 18px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 6px; white-space: nowrap;">
            <span style="font-size: 13px;">⚠️</span>
            <div>
              <div style="color: #f3e8ff; font-size: 10px; font-weight: 800;">ST. JOHN’S AMBULANCE DELAY: 28.5m (+319%)</div>
              <div style="color: #e9d5ff; font-size: 9px; font-family: monospace;">12-Min Golden Window Breached</div>
            </div>
          </div>
        `,
        className: 'custom-hospital-impact-badge',
        iconSize: [260, 34],
        iconAnchor: [130, 17]
      });

      L.marker([12.9270, 77.6260], { icon: hospitalImpactBadge }).addTo(layers);
    }

    // 4. Bottleneck Nodes & Pulse Rings
    nodes.forEach(node => {
      const isBottleneck = bottleneckNodeIds.includes(node.id);
      const isEpicenter = node.id === 'N_SILK_BOARD' && failedRoadIds.includes('R_SILK_BOARD_JUNCTION');

      if (isEpicenter || isBottleneck) {
        const pulseColor = isEpicenter ? '#ef4444' : '#f59e0b';
        const pulseRadius = isEpicenter ? 30 : 20;

        const pulseHtml = `
          <div style="position: relative; width: ${pulseRadius * 2}px; height: ${pulseRadius * 2}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${pulseColor}; opacity: 0.4; animation: ripple-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${pulseColor}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${pulseColor};"></div>
          </div>
        `;

        const pulseIcon = L.divIcon({
          html: pulseHtml,
          className: 'custom-bottleneck-pulse',
          iconSize: [pulseRadius * 2, pulseRadius * 2],
          iconAnchor: [pulseRadius, pulseRadius]
        });

        const marker = L.marker([node.location.lat, node.location.lng], { icon: pulseIcon }).addTo(layers);
        marker.on('click', () => onSelectNode(node));
        marker.bindTooltip(
          `<div class="p-1 text-xs">
            <div class="font-bold ${isEpicenter ? 'text-rose-400' : 'text-amber-400'}">
              ${isEpicenter ? '⚠️ FAILURE EPICENTER' : '⚡ SECONDARY BOTTLENECK'}
            </div>
            <div class="text-slate-200 font-semibold">${node.name}</div>
            <div class="text-[11px] text-slate-400">${node.notes || 'Intersection experiencing queue spillover'}</div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">Scenario-Based Simulation</div>
          </div>`,
          { sticky: true }
        );
      } else {
        const circle = L.circleMarker([node.location.lat, node.location.lng], {
          radius: 4.5,
          color: '#64748b',
          weight: 1.5,
          fillColor: '#0f172a',
          fillOpacity: 0.9
        }).addTo(layers);

        circle.on('click', () => onSelectNode(node));
        circle.bindTooltip(
          `<div class="p-1 text-xs">
            <div class="font-bold text-slate-200">${node.name}</div>
            <div class="text-[10px] text-slate-400">${node.type}</div>
          </div>`,
          { sticky: true }
        );
      }
    });

    // 5. Hospital Facility Markers
    hospitals.forEach(hosp => {
      const isTrauma = hosp.type === 'TRAUMA_CENTER';
      const shortName = hosp.name.includes('John') ? 'St. John’s Trauma Center' : 
                        hosp.name.includes('Manipal') ? 'Manipal Sarjapur' : 
                        hosp.name.includes('Greenview') ? 'Greenview HSR' : 'Jayadeva Institute';

      const hospitalHtml = `
        <div style="background: #0f172a; border: 2px solid ${isTrauma ? '#ef4444' : '#06b6d4'}; border-radius: 8px; padding: 4px 7px; box-shadow: 0 4px 14px rgba(0,0,0,0.7); display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;">
          <div style="width: 20px; height: 20px; border-radius: 4px; background: ${isTrauma ? '#ef4444' : '#06b6d4'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px;">+</div>
          <div>
            <div style="color: #f1f5f9; font-size: 11px; font-weight: 800;">${shortName}</div>
            <div style="color: #94a3b8; font-size: 9px; font-mono;">${hosp.traumaBays} Resuscitation Bays</div>
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospitalHtml,
        className: 'custom-hospital-marker',
        iconSize: [170, 36],
        iconAnchor: [85, 18]
      });

      const hospMarker = L.marker([hosp.location.lat, hosp.location.lng], { icon: hospIcon }).addTo(layers);
      hospMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectHospital?.(hosp);
      });
      hospMarker.bindTooltip(
        `<div class="p-2 text-xs font-sans">
          <div class="font-bold text-slate-100 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${isTrauma ? 'bg-rose-500' : 'bg-cyan-500'}"></span>
            ${hosp.name}
          </div>
          <div class="text-slate-300 mt-1">${hosp.beds} Inpatient Beds • ${hosp.traumaBays} Resuscitation Bays</div>
          <div class="text-amber-400 font-semibold mt-0.5">Critical Emergency Window: ${hosp.emergencyThresholdMinutes} mins</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Scenario-Based Simulation</div>
        </div>`,
        { sticky: true }
      );
    });

  }, [
    roads, 
    nodes, 
    zones, 
    hospitals, 
    roadStates, 
    bottleneckNodeIds, 
    failedRoadIds, 
    selectedRoadId, 
    showInundationZone, 
    showHospitalCorridorsOnly,
    currentStepIndex,
    currentStep,
    onSelectRoad, 
    onSelectNode
  ]);

  const cascadeMilestones = [
    { index: 0, label: 'Baseline', short: '0: BASE' },
    { index: 1, label: '1. Initial Failure', short: '1: FAILURE' },
    { index: 2, label: '2. Redistribution', short: '2: REDIST' },
    { index: 3, label: '3. Secondary Stress', short: '3: STRESS' },
    { index: 4, label: '4. Critical Access', short: '4: ACCESS' },
    { index: 5, label: '5. Summary', short: '5: SUMMARY' }
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP PIPELINE STEPPER (COMPACT, SEMI-TRANSPARENT HUD) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[95vw]">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-1.5 text-xs">
          <div className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80 shrink-0 hidden md:block">
            Cascade Progression
          </div>
          
          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          {/* Stepper buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {cascadeMilestones.map((m) => {
              const isActive = currentStepIndex === m.index;
              const isPast = currentStepIndex > m.index;

              return (
                <button
                  key={m.index}
                  onClick={() => onSelectStep?.(m.index)}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 whitespace-nowrap ${
                    isActive 
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400' 
                      : isPast
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-950/60 text-slate-500 hover:text-slate-300'
                  }`}
                  title={m.label}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-white animate-pulse' : isPast ? 'bg-cyan-400' : 'bg-slate-600'
                  }`} />
                  <span className="hidden sm:inline">{m.label}</span>
                  <span className="sm:hidden">{m.short}</span>
                </button>
              );
            })}
          </div>

          {/* Play/Pause quick button inside stepper */}
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`p-1.5 rounded-lg text-white font-semibold transition ml-1 shrink-0 ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
              title={isPlaying ? 'Pause Cascade' : 'Play Cascade'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* TOP-LEFT: MINIMAL COLLAPSIBLE MAP LEGEND */}
      <div className="absolute top-3 left-3 z-10 pointer-events-auto">
        {!isLegendExpanded ? (
          <button
            id="toggle-map-legend-btn"
            onClick={() => setIsLegendExpanded(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border border-slate-800 backdrop-blur-md shadow-lg text-xs font-semibold transition"
            title="Expand Map Legend"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">Legend</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        ) : (
          <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs shadow-2xl w-64 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Infrastructure States</span>
              </span>
              <button
                onClick={() => setIsLegendExpanded(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
                title="Collapse Legend"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                <span className="w-3 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                <div className="min-w-0">
                  <span className="font-bold text-rose-400">FAILED</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">(Cap = 0, Submerged)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                <span className="w-3 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <div className="min-w-0">
                  <span className="font-bold text-amber-400">HIGH PRESSURE</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">(&gt;100% Volume)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                <span className="w-3 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                <div className="min-w-0">
                  <span className="font-bold text-orange-400">AT RISK</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">(80-100% Capacity)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-purple-900/40">
                <span className="w-3 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                <div className="min-w-0">
                  <span className="font-bold text-purple-300">HOSPITAL ACCESS</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">(Lifeline Delayed)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-emerald-900/40">
                <span className="w-3 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <div className="min-w-0">
                  <span className="font-bold text-emerald-300">VIABLE LIFELINE</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">(Elevated Viaduct)</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Secondary Bottleneck
              </span>
              <span className="flex items-center gap-1">
                <span className="text-rose-400 font-bold">+</span>
                Trauma Lifeline
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TOP-RIGHT: DISMISSIBLE & COLLAPSIBLE STAGE CAUSE-AND-EFFECT STORY CARD */}
      {!isStepOverlayDismissed && !isFocusMap && !isDrawerOpen && (
        <div className="absolute top-14 right-3 z-20 max-w-sm w-full pointer-events-auto transition-all duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-3.5 text-xs">
            {/* Header with minimize & close controls */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  currentStepIndex === 0 ? 'bg-emerald-400' :
                  currentStepIndex === 1 ? 'bg-rose-500 animate-ping' :
                  currentStepIndex === 2 ? 'bg-cyan-400 animate-pulse' :
                  currentStepIndex === 3 ? 'bg-amber-400' :
                  currentStepIndex === 4 ? 'bg-purple-400 animate-pulse' :
                  'bg-rose-500'
                }`} />
                <span className="font-bold text-white text-xs uppercase tracking-wider truncate">
                  {currentStep?.title || `Stage ${currentStepIndex}`}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0">
                  T+{currentStep?.timeOffsetMinutes ?? 0}m
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setIsStepOverlayCollapsed(!isStepOverlayCollapsed)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title={isStepOverlayCollapsed ? 'Expand Details' : 'Minimize Card'}
                >
                  {isStepOverlayCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsStepOverlayDismissed(true)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                  title="Dismiss Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Body */}
            {!isStepOverlayCollapsed && (
              <div className="space-y-2.5">
                {/* Deterministic Metrics Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500">Displacement:</span>
                    <div className="font-bold text-slate-200">
                      {currentStepIndex === 0 ? '0 vph' : '3,100 vph'}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500">Active Bottlenecks:</span>
                    <div className="font-bold text-amber-400">
                      {currentStep?.bottleneckNodeIds?.length || 0} junctions
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500">Trauma Transit:</span>
                    <div className={`font-bold ${currentStep?.hospitalAverageLatencyMinutes && currentStep.hospitalAverageLatencyMinutes > 12 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {currentStep?.hospitalAverageLatencyMinutes || 6.8} min
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500">Ripple Score:</span>
                    <div className={`font-bold ${currentStep?.rippleScore && currentStep.rippleScore >= 70 ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {currentStep?.rippleScore || 0} / 100
                    </div>
                  </div>
                </div>

                {/* AI / Deterministic Cause-and-Effect Narrative */}
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isAiGenerated ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-300">
                        {isAiGenerated ? 'AI Cause-and-Effect Narrative' : 'Deterministic Engineering Brief'}
                      </span>
                    </div>
                    <button
                      id="refresh-story-ai-btn"
                      onClick={loadCascadeNarrative}
                      disabled={isAiLoading}
                      className="text-slate-400 hover:text-cyan-300 transition"
                      title="Refresh Explanation"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-cyan-400' : ''}`} />
                    </button>
                  </div>
                  
                  {isAiLoading ? (
                    <p className="text-[11px] text-cyan-400/80 animate-pulse">
                      Synthesizing cause-and-effect cascade narrative from simulation data...
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {aiNarrative || currentStep?.description}
                    </p>
                  )}
                </div>

                {/* Replay Button if at end */}
                {currentStepIndex === 5 && onReplayCascade && (
                  <button
                    onClick={onReplayCascade}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Replay Cascade Sequence</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MINIMAL FLOATING CONTROLS IN FOCUS MAP MODE */}
      {isFocusMap && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[95vw]">
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-cyan-500/50 shadow-2xl flex flex-wrap items-center gap-2 text-xs">
            {/* Exit Focus Map */}
            {onToggleFocusMap && (
              <button
                id="exit-focus-map-btn"
                onClick={onToggleFocusMap}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Focus Map</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-800" />

            {/* Quick Failure Presets */}
            {onApplyScenario && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 mr-1 hidden sm:inline">Failures:</span>
                <button
                  onClick={() => onApplyScenario(['R_SILK_BOARD_JUNCTION'])}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    failedRoadIds.length === 1 && failedRoadIds.includes('R_SILK_BOARD_JUNCTION')
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Simulate Central Silk Board Underpass Submersion"
                >
                  Silk Board
                </button>
                <button
                  onClick={() => onApplyScenario(['R_ORR_AGARA_CORRIDOR'])}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    failedRoadIds.length === 1 && failedRoadIds.includes('R_ORR_AGARA_CORRIDOR')
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Simulate Agara Lake Raja Kaluve Overflow"
                >
                  Agara ORR
                </button>
                <button
                  onClick={() => onApplyScenario(['R_SILK_BOARD_JUNCTION', 'R_ORR_AGARA_CORRIDOR'])}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    failedRoadIds.length === 2
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Simulate Compound Cascade (Silk Board + Agara)"
                >
                  Compound
                </button>
                <button
                  onClick={() => onApplyScenario([])}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    failedRoadIds.length === 0
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Restore all corridors to normal"
                >
                  Clear All
                </button>
              </div>
            )}

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5">
              {onToggleInundationZone && (
                <button
                  onClick={onToggleInundationZone}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    showInundationZone
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Inundation Polygon"
                >
                  Flood Zone
                </button>
              )}
              {onToggleHospitalCorridors && (
                <button
                  onClick={onToggleHospitalCorridors}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    showHospitalCorridorsOnly
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Hospital Trauma Corridors"
                >
                  Lifelines Only
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
