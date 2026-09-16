# Cascade Shield
## Resilience Intelligence for Cascading Infrastructure Failures

> *"See the ripple before the next failure happens."*

---

## 1. Executive Summary

**Cascade Shield** is a resilience decision-support system that models how infrastructure failures propagate through connected networks, identifies the assets that amplify those failures, and lets planners compare interventions before a cascade becomes a crisis.

Modern urban infrastructure systems are deeply interdependent. When a primary transportation corridor fails—such as an arterial underpass submerging during an intense monsoon cloudburst—the immediate consequence is localized disruption. However, the true catastrophe arises from the **network ripple**: thousands of displaced vehicles divert into adjoining collector streets and residential lanes, exceeding design capacities, creating secondary intersection gridlocks, and severing emergency access corridors to critical medical facilities.

Traditional asset-by-asset monitoring systems observe failures in isolation: a road is marked flooded, or an intersection is reported congested. They do not model how pressure redistributes across the network graph, nor do they quantify how a failure on one corridor degrades trauma access latency miles away.

Cascade Shield solves this challenge through a **scenario-based, deterministic network flow model** coupled with an **explainable AI decision-support layer**:
- It represents the physical road network as a directed graph of nodes and links with real GIS coordinates and calibrated capacities.
- It simulates volume-to-capacity (V/C) stress and queue spillbacks using deterministic delay functions.
- It computes a composite **Ripple Impact Score (0–100)** to quantify systemic network disruption.
- It tracks emergency casualty access latency across neighbourhood zones toward regional trauma centers against clinical golden-hour survival benchmarks.
- It evaluates pre-engineered counter-measures against an emergency budget, calculating resilience return-on-investment (ROI) in a transparent Before vs. After matrix.
- It uses server-side **Google Gemini models** strictly as an operational narrative interpreter—translating computed numbers into plain-language tactical briefings without relying on generative AI for numerical arithmetic.

### What Makes the Approach Different
1. **Network-Level vs. Asset-Level**: Focuses on systemic propagation rather than single-point monitoring.
2. **Deterministic Arithmetic with AI Translation**: All graphs, latencies, and scores are mathematically computed; Gemini is strictly an explainer, not an oracle.
3. **Zero-API-Key Offline Fallback**: If Gemini or internet connectivity is unavailable, the entire deterministic simulation, map visualization, timeline, and pre-calculated engineering briefs remain 100% operational.
4. **Proactive Stress-Testing**: Allows infrastructure engineers to stress-test every link in the network ahead of disaster events to identify potential single points of failure (SPOFs).

### Prototype Demonstration Scope
The current prototype models the **Central Silk Board and HSR Layout corridor** in Bengaluru, Karnataka, India under a severe **110mm monsoon cloudburst** and Raja Kaluve stormwater channel overflow scenario.

---

## 2. Problem Statement

### Hackathon Problem: "Cascading Failure: When One Failure Becomes Many"
Infrastructure systems are interconnected networks. When a single critical link fails:
1. **Traffic and Demand Redistribution**: Demand does not disappear; it is forced onto alternative feeder corridors.
2. **Capacity Saturation**: Narrow parallel arterials and residential roads rapidly absorb volume far exceeding their design limits (V/C > 1.0).
3. **Secondary Bottlenecks**: Convergence points, turning bays, and traffic signals at secondary junctions lock up into stationary queues.
4. **Emergency Lifeline Severance**: Emergency medical services (ambulances), fire tenders, and relief convoys become trapped in gridlock, escalating preventable mortality.
5. **Asset-Centric Monitoring Blindspot**: Monitoring sensors only flag the flooded road, leaving emergency responders blind to the compounding gridlock miles downstream.

### Study Domain: Bengaluru Urban Road Infrastructure
- **City/Region**: Bengaluru, Karnataka, India (Bommanahalli and South Zone, BBMP).
- **Focal Corridor**: Central Silk Board Underpass & Outer Ring Road (ORR) – HSR Layout – Agara Lake nexus.
- **Primary Hazard**: Urban pluvial flooding caused by an intense monsoon cloudburst (110mm in 2 hours) and Raja Kaluve (stormwater canal) backflow.
- **Critical Facility Anchor**: St. John’s Medical College Hospital Level-1 Emergency Trauma Center.

### Distinction: Baseline vs. Assumption vs. Simulation
| Aspect | Real Geographic Baseline | Scenario Assumptions | Simulated Consequences |
| :--- | :--- | :--- | :--- |
| **Road Network** | OpenStreetMap (OSM) GPS coordinates, junction geometries, lane configurations. | Base free-flow speeds (30–75 km/h) and normal hourly volumes (680–3,100 vph). | Volume-to-Capacity ratios, queue spillbacks, road state transitions. |
| **Hazard** | Real drainage depression between Madiwala, Agara, and Bellandur Lakes. | 110mm cloudburst in 2 hours; 1.1m flood depth at underpass. | Submersion and physical impassability (Capacity = 0 vph). |
| **Healthcare** | Real hospital locations (St. John's, Manipal Sarjapur, Greenview, Jayadeva). | 12-minute trauma golden hour benchmark; 1,350 beds at St. John's. | Dynamic transit latency delays (6.8m → 28.5m) and population at risk. |

---

## 3. Project Goals

1. **Graph Representation**: Model physical road corridors and junctions as a mathematical network graph.
2. **Disruption Injection**: Introduce localized infrastructure failures (submersion, structural closure).
3. **Traffic Redistribution**: Deterministically apportion displaced vehicles across viable alternative corridors based on network topology.
4. **Secondary Bottleneck Detection**: Identify junctions and links where converging diverted flow exceeds capacity.
5. **Critical Asset Identification**: Quantify which corridors act as catastrophic failure multipliers when severed.
6. **Critical Facility Accessibility**: Track dynamic emergency ambulance transit times from residential wards to regional trauma centers.
7. **Intervention Analysis**: Model pre-engineered engineering and operational interventions against constrained budgets.
8. **Before vs. After Comparison**: Directly benchmark network resilience metrics pre- and post-intervention.
9. **Proactive Stress-Testing**: Systematically simulate individual asset failures across the entire network to rank vulnerabilities before disaster strikes.

---

## 4. Target Users

*(Intended future users based on design requirements; not current institutional customers or deployed partners)*

1. **Disaster Management Authorities**: State and district disaster management authorities (e.g., KSDMA / DDMA) planning monsoon contingency routes.
2. **Municipal & Urban Planners**: City corporations (e.g., BBMP) prioritizing drainage desilting, pump deployments, and road geometry improvements.
3. **Infrastructure & Traffic Engineers**: Traffic management police and highway authorities configuring emergency diversion plans and adaptive signal preemption.
4. **Emergency Medical Services (EMS) Coordinators**: Hospital disaster liaisons and 108 ambulance dispatchers planning secondary trauma transit corridors during flood alerts.
5. **Critical Infrastructure Operators**: Operators of elevated viaducts, transit interchanges, and toll corridors coordinating flood gates and emergency lanes.

---

## 5. Current Study Area & Scenario

- **Location**: Bengaluru, Karnataka, India
- **Study Area**: Central Silk Board & HSR Layout Corridor (Agara–Bellandur Lake Catchment)
- **Municipal Jurisdiction**: Bommanahalli & South Zone, Bruhat Bengaluru Mahanagara Palike (BBMP)
- **Center GPS Coordinates**: Latitude 12.9215° N, Longitude 77.6360° E (Zoom: 14)
- **Primary Hazard**: Monsoon Cloudburst (110mm) & Raja Kaluve Stormwater Drain Overflow (Surge height: 1.1m)

### Physical Vulnerability Dossier
Central Silk Board junction and the Outer Ring Road (ORR) represent Bengaluru’s most congested multi-modal transit nexus, connecting HSR Layout, Koramangala, BTM Layout, and the Bellandur IT corridor. The corridor occupies a low-elevation drainage depression between Agara Lake, Bellandur Lake, and Madiwala Lake. During extreme monsoon cloudbursts, the primary stormwater channel (Raja Kaluve) overflows, ponding 0.8–1.2m of water in the underpass and surface lanes.

```
       [Madiwala Lake] ──── Raja Kaluve Drainage ────► [Agara Lake] ────► [Bellandur Lake]
                                     │
                         [Silk Board Low-Elevation Sag]
                                (1.1m Inundation)
```

### Exact Data Breakdown
- **Real Geographic Data**:
  - OpenStreetMap (OSM) roadway coordinates, road lengths, and junction nodes.
  - GPS positions of St. John's Medical College Hospital, Manipal Hospital Sarjapur Road, Greenview Medical Hospital, and Sri Jayadeva Institute.
  - Geometry of residential zones (HSR Layout, BTM Layout, Koramangala South, Bommanahalli).
- **Scenario Assumptions**:
  - 110mm rainfall triggering 1.1m flood depth.
  - Normal hourly baseline traffic volume (e.g., 3,100 vph on Silk Board underpass).
  - Emergency response threshold of 12 minutes (clinical "Golden Hour" parameter).
- **Simulated Consequences**:
  - Redistribution split factors (42% ORR Agara, 28% HSR 27th Main, 30% Koramangala 100ft).
  - Delay increases (+40%, +95%, +190%).
  - Hospital latency escalation (+319%).

*Note: The platform does NOT perform real-time flood sensor telematic ingestion or live hydrological stream modeling.*

---

## 6. Core System Concept

### System Pipeline

```
OpenStreetMap / GIS Baseline (Nodes, Roads, Coordinates, Capacities)
                           ↓
               Road Network Graph & Data Structures
                           ↓
        Hazard Scenario Selection (e.g. 110mm Monsoon Cloudburst)
                           ↓
           Initial Infrastructure Failure (Underpass Inundated)
                           ↓
           Deterministic Traffic Flow Redistribution
                           ↓
            Secondary Network Stress & V/C Saturation
                           ↓
     Secondary Bottleneck Identification (Converging Saturated Nodes)
                           ↓
        Critical Facility Accessibility Impact (Ambulance Latencies)
                           ↓
         Intervention Engine (Budget Allocation & Counter-Measures)
                           ↓
           Before vs. After Comparative Matrix & Map Preview
                           ↓
         Server-Side Gemini Operational Explanation (Decision Support)
```

### Role of Gemini vs. Deterministic Simulation
- **Deterministic Engine is Truth**: All quantitative results (V/C ratios, delays, transit minutes, Ripple Impact Scores, and budget tallies) are calculated mathematically by local TypeScript code in the browser and server.
- **Gemini is Operational Interpreter**: Google Gemini receives the computed state (corridor names, percentages, bottleneck counts, minutes delayed) and synthesizes plain-language executive appraisals for incident commanders.
- **Strict Non-Hallucination**: Gemini is prompted never to invent metrics. If Gemini is unreachable or unconfigured, the system automatically falls back to deterministic rule-based engineering briefs.

---

## 7. System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BROWSER CLIENT                                  │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      React 19 SPA (Root App.tsx)                        │   │
│   ├──────────────────┬──────────────────────┬───────────────────────────────┤   │
│   │   Header & Nav   │  Study Area Context  │      Guided Demo Engine       │   │
│   │   (Header.tsx)   │ (StudyAreaContextBar)│     (GuidedDemoBar.tsx)       │   │
│   └──────────────────┴──────────────────────┴───────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                           Interactive Panels                            │   │
│   │  • RippleTimeline.tsx         • MultiCorridorAnalysisView.tsx           │   │
│   │  • HospitalAccessView.tsx     • InterventionPlanner.tsx                 │   │
│   │  • BeforeAfterComparison.tsx  • StressTestView.tsx (SPOF Ranking)       │   │
│   │  • AssetInspector.tsx         • RippleImpactScoreCard.tsx               │   │
│   │  • DataProvenanceModal.tsx    • RiskProfileModal.tsx                    │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │             Leaflet Interactive Map (CascadeMap.tsx)                    │   │
│   │  • OpenStreetMap Raster Basemap Layer                                   │   │
│   │  • Dynamic SVG Polylines (Color-Coded by State)                         │   │
│   │  • Inundation Zone Hazard Polygon • Bottleneck Pulse Markers            │   │
│   │  • Directional Redirect Badges • Barricades • Hospital Pins             │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │       Client Simulation Engine (src/engine/simulationEngine.ts)         │   │
│   │  • calculateDynamicCascade()    • runProactiveStressTest()              │   │
│   │  • runResilientCascadeSimulation() • getRecommendedIntervention()       │   │
│   │  • Local Dataset (networkData.ts): ROADS, NODES, ZONES, HOSPITALS       │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                   HTTP Fetch /api/ai/* (aiService.ts)                           │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS / EXPRESS SERVER (server.ts)                     │
│                                                                                 │
│   • Middleware Mode Vite Server (Development) / Express Static dist/ (Prod)     │
│   • Liveness Probes: GET /health, GET /api/health                               │
│   • In-Memory AI Explanation Cache: Map<string, string>                         │
│   • AI Endpoints:                                                               │
│       GET  /api/ai/status                                                       │
│       POST /api/ai/explain-cascade                                              │
│       POST /api/ai/explain-bottleneck                                           │
│       POST /api/ai/hospital-brief                                               │
│       POST /api/ai/compare-interventions                                        │
│       POST /api/ai/explain-multi-corridor                                       │
│                                                                                 │
│   • Fallback Retry Runner: 503 Retry + Model Cascade:                           │
│       1. gemini-3.8-flash                                                       │
│       2. gemini-3.1-flash-lite                                                  │
│       3. gemini-flash-latest                                                    │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │
                         Google GenAI SDK (@google/genai)
                         process.env.GEMINI_API_KEY
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │         Google Gemini API         │
                     └───────────────────────────────────┘
```

---

## 8. Technology Stack

| Technology | Role | Where Used |
| :--- | :--- | :--- |
| **React 19** (`react`, `react-dom`) | UI Framework | Entire client interface in `src/` |
| **TypeScript 5.8** | Type Safety & Models | All client and server code (`.ts`, `.tsx`) |
| **Vite 6** (`vite`, `@vitejs/plugin-react`) | Bundler & Dev Server | Development HMR and frontend production build |
| **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`) | Design System & Styling | UI styling across all components |
| **Leaflet 1.9** (`leaflet`, `@types/leaflet`) | Interactive GIS Map | `src/components/Map/CascadeMap.tsx` |
| **OpenStreetMap** | Raster Map Tiles | Basemap tile provider in `CascadeMap.tsx` |
| **Lucide React** (`lucide-react`) | UI Iconography | Navigation, controls, status indicators |
| **Motion** (`motion`) | UI Micro-animations | Modal and drawer transitions |
| **Node.js** | Server Runtime | Host environment for Express and Vite |
| **Express 4** (`express`, `@types/express`) | Backend Web Server | `server.ts` API routes and asset serving |
| **@google/genai 2.21** | Official Gemini AI SDK | `server.ts` server-side AI generation |
| **dotenv 17** (`dotenv`) | Configuration Loader | `server.ts` environment variable injection |
| **tsx 4** (`tsx`) | TypeScript Node Runner | Dev execution (`npm run dev`) |
| **esbuild 0.25** (`esbuild`) | Server Bundler | Production build packaging `server.ts` into `dist/server.cjs` |

---

## 9. Folder / File Structure

```
CASCADE-SHIELD/
├── .antigravity/                   # Ide project metadata and session configs
├── .env.example                    # Template for environment variables (GEMINI_API_KEY, APP_URL)
├── .gitignore                      # Git exclusion rules (node_modules, dist, .env*)
├── index.html                      # HTML shell loading Leaflet CSS, Google Fonts, and main.tsx
├── metadata.json                   # App capabilities declaration (SERVER_SIDE_GEMINI_API)
├── package.json                    # Dependencies, scripts (dev, build, start, preview, lint)
├── README.md                       # Project overview and local execution instructions
├── server.ts                       # Full-stack Express server, Gemini client, API endpoints
├── tsconfig.json                   # TypeScript compiler options (ES2022, bundler, @/* alias)
├── vite.config.ts                  # Vite config (Tailwind plugin, React plugin, HMR controls)
└── src/
    ├── App.tsx                     # Main layout coordinator, state manager, drawer handler
    ├── index.css                   # Global styles, Tailwind directives, Leaflet dark map rules
    ├── main.tsx                    # React 19 bootstrap entry point
    ├── types.ts                    # TypeScript interfaces for nodes, roads, steps, interventions
    ├── components/
    │   ├── Header.tsx              # Top navigation bar, mode switcher, stress badge, AI status
    │   ├── Demo/
    │   │   └── GuidedDemoBar.tsx   # 14-step guided judging and demonstration controller
    │   ├── Map/
    │   │   └── CascadeMap.tsx      # Leaflet map instance, vectors, markers, popups, legend
    │   ├── Panels/
    │   │   ├── AssetInspector.tsx          # Inspector popup for individual road links and nodes
    │   │   ├── BeforeAfterComparison.tsx   # Side-by-side unmitigated vs. mitigated comparison
    │   │   ├── DataProvenanceModal.tsx     # 4-layer data architecture and provenance modal
    │   │   ├── HospitalAccessView.tsx      # Hospital trauma latency and zone breach panel
    │   │   ├── InterventionPlanner.tsx     # Engineering counter-measures and budget allocator
    │   │   ├── MultiCorridorAnalysisView.tsx # Multi-corridor matrix, scenarios, custom builder
    │   │   ├── RippleImpactScoreCard.tsx   # Composite score breakdown card
    │   │   ├── RiskProfileModal.tsx        # Study area context and hazard dossier modal
    │   │   ├── StressTestView.tsx          # Single-point-of-failure vulnerability scanner
    │   │   └── StudyAreaContextBar.tsx     # Geographic context bar with expandable summary
    │   └── Timeline/
    │       └── RippleTimeline.tsx  # Step-by-step cascade progress bar, time slider, controls
    ├── data/
    │   └── networkData.ts          # Nodes, roads, zones, hospitals, interventions, scenarios
    ├── engine/
    │   └── simulationEngine.ts     # Core deterministic cascade simulation and stress-testing
    └── services/
        └── aiService.ts            # Client HTTP service communicating with Express /api/ai/*
```

---

## 10. Simulation Engine

The deterministic simulation engine is implemented in [src/engine/simulationEngine.ts](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/engine/simulationEngine.ts).

### 1. Network Graph Representation
- **Nodes ($N = 12$)**: Physical intersections, bridge approaches, and hospital trauma gates.
- **Edges / Links ($E = 12$)**: Directed roadway segments with calibrated physical parameters:
  - Base length ($L$ in km)
  - Base hourly capacity ($C$ in vehicles per hour, vph)
  - Base free-flow speed ($S_0$ in km/h)
  - Normal baseline traffic volume ($V_0$ in vph)
  - Designated alternative corridors (`alternativeFor: string[]`)
  - Hospital lifeline designation (`isHospitalCorridor: boolean`)

### 2. Disruption & Capacity Modification
When a road is disabled (e.g., Central Silk Board Underpass submergence):
- If protected by an active intervention (e.g., Inflatable Flood Barriers / Stormwater Sump), the failure is intercepted and capacity is preserved.
- Otherwise, the road state becomes `FAILED`, and its effective capacity drops to zero:
  $$C_{\text{effective}} = 0$$

### 3. Traffic Redistribution Mechanism
Displaced volume ($V_{\text{displaced}} = V_0$) from severed roads is apportioned across functional alternative corridors:
- **Direct Alternatives for Central Silk Board (`R_SILK_BOARD_JUNCTION`)**:
  - Outer Ring Road Agara Stretch (`R_ORR_AGARA_CORRIDOR`): absorbs **42%** of displaced flow.
  - HSR 27th Main (`R_HSR_27TH_MAIN`): absorbs **28%** of displaced flow.
  - Koramangala 100ft Road (`R_KORAMANGALA_100FT`): absorbs **30%** of displaced flow.
- **Direct Alternatives for ORR Agara Corridor (`R_ORR_AGARA_CORRIDOR`)**:
  - Sarjapur Main Road (`R_SARJAPUR_AGARA_LINK`): absorbs **45%**.
  - HSR 27th Main (`R_HSR_27TH_MAIN`): absorbs **30%**.
  - HSR 14th Main (`R_HSR_14TH_MAIN`): absorbs **25%**.
- **Direct Alternatives for Hosur Road (`R_HOSUR_RD_SURFACE`)**:
  - Elevated Expressway (`R_ELEVATED_EXPRESSWAY`): absorbs **60%**.
  - Parallel Surface Arterials: absorb **40%**.

### 4. Volume-to-Capacity (V/C) Stress & Delay Formulation
For every active link $i$, its updated volume is:
$$V_i = V_{0,i} + V_{\text{diverted},i}$$

Its effective capacity considering active engineering capacity boosts is:
$$C_{\text{effective},i} = C_{0,i} \times \left(1 + \frac{\sum \text{CapacityBoostPercent}}{100}\right)$$

The Volume-to-Capacity Ratio is calculated as:
$$\text{Ratio}_i = \frac{V_i}{C_{\text{effective},i}}$$

#### Piecewise Congestion Delay Model
Rather than an unconstrained high-power polynomial, Cascade Shield implements a calibrated piecewise delay model reflecting saturated urban gridlock conditions:
- If $\text{State} = \text{FAILED}$: Delay Increase = $+999\%$ (Impassable)
- If $\text{Ratio}_i \ge 1.25$: Delay Increase = $+190\%$ (Severe gridlock, stop-and-go)
- If $\text{Ratio}_i \ge 1.00$: Delay Increase = $+95\%$ (Operating above capacity)
- If $\text{Ratio}_i \ge 0.80$: Delay Increase = $+40\%$ (At-risk feeder saturation)
- If $\text{Ratio}_i < 0.80$: Delay Increase = $0\%$ (Normal flow)

### 5. Infrastructure State Classifications
- `FAILED`: Road capacity is 0; physically impassable due to water depth > 0.8m.
- `HIGH_PRESSURE`: Volume exceeds design capacity ($\text{V/C} \ge 1.05$); queue spillover.
- `AT_RISK`: Operating near saturation ($0.80 \le \text{V/C} < 1.05$); fragile feeder route.
- `CRITICAL_ACCESS_IMPACTED`: Designated emergency trauma corridor with $\text{V/C} \ge 0.85$ or delay $> 30\%$.
- `NORMAL`: Volume within design capacity ($\text{V/C} < 0.80$).

### 6. Secondary Bottleneck Identification
A node is flagged as an active **Secondary Bottleneck** if it connects to any link operating at `HIGH_PRESSURE` or `AT_RISK`. Diverging queues at these nodes cause junction-level blockages that propagate upstream.

---

## 11. Cascade Timeline

The default scenario features 6 calibrated chronological progression steps accessible via [RippleTimeline.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Timeline/RippleTimeline.tsx):

| Step | Time | Title | Phase | Core Deterministic Metrics | Map Visualization | Gemini AI Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | **T+0m** | Baseline: Normal Operations | `BASELINE` | Failed: 0, Bottlenecks: 0, Latency: 6.8m, RIS: 6 | All links green (`NORMAL`); no flood overlay | Explains normal pre-storm network balance |
| **1** | **T+12m** | Step 1 — Initial Failure | `STEP_1_FAILURE` | Failed: 1 (`R_SILK_BOARD`), Bottlenecks: 2, Latency: 12.4m, RIS: 32 | Silk Board underpass red (`FAILED`); barricade icon; flood polygon visible | Explains stormwater inundation mechanism |
| **2** | **T+25m** | Step 2 — Redistribution | `STEP_2_REDISTRIBUTION` | Displaced: 3,100 vph; High Pressure: 3 links, RIS: 59 | Directional redirect badges on ORR, HSR 27th Main, Koramangala 100ft | Explains commuter diversion into secondary corridors |
| **3** | **T+40m** | Step 3 — Secondary Stress | `STEP_3_SECONDARY_STRESS` | High Pressure: 5 links, Bottlenecks: 5, Latency: 22.8m, RIS: 78 | Secondary junctions pulsating yellow/amber; Agara & Madiwala choking | Explains intersection queue spillback dynamics |
| **4** | **T+55m** | Step 4 — Critical Access Impact | `STEP_4_CRITICAL_ACCESS` | Severe Delay Routes: 3; Zones Breaching: 3/4; Latency: 26.8m, RIS: 86 | St. John’s casualty approaches highlighted purple; elevated viaduct viable | Synthesizes trauma survival golden-hour crisis |
| **5** | **T+60m** | Step 5 — Summary | `STEP_5_SUMMARY` | Full cascade synthesized; 184,500 citizens isolated; RIS: 86 | Complete network strain overview with cause-and-effect summary box | Delivers executive disaster appraisal |

---

## 12. Ripple Impact Score (RIS)

### Definition & Purpose
The **Ripple Impact Score** is a composite resilience metric ranging from **0 to 100** that quantifies the systemic network-level disruption caused by infrastructure failures. It is a prototype engineering metric designed for comparative resilience decision support.

> **Disclaimer**: *The Ripple Impact Score is an internal prototype decision-support metric developed for this platform. It is NOT an official government or municipal regulatory standard.*

### Exact Mathematical Formula
As implemented in `calculateDynamicCascade` ([src/engine/simulationEngine.ts:604-620](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/engine/simulationEngine.ts#L604-L620)), the raw score is the sum of four normalized sub-factors, each capped at 25 points:

$$\text{RawScore} = \text{RouteFactor} + \text{BottleneckFactor} + \text{TravelBurdenFactor} + \text{ZoneBreachFactor}$$

Where:
1. **Route Factor ($\le 25$)**:
   $$\text{RouteFactor} = \min\left(25, \; \frac{N_{\text{affected}}}{N_{\text{total}}} \times 35\right)$$
   *(where $N_{\text{affected}} = N_{\text{failed}} + N_{\text{highPressure}} + N_{\text{atRisk}}$ and $N_{\text{total}} = 12$)*

2. **Bottleneck Factor ($\le 25$)**:
   $$\text{BottleneckFactor} = \min\left(25, \; \frac{N_{\text{bottlenecks}}}{6} \times 25\right)$$

3. **Travel Burden Factor ($\le 25$)**:
   $$\text{TravelBurdenFactor} = \min\left(25, \; \frac{\Delta \text{Latency}_{\text{avg}}}{12} \times 25\right)$$
   *(where $\Delta \text{Latency}_{\text{avg}}$ is the average transit delay increase in minutes across zones)*

4. **Zone Breach Factor ($\le 25$)**:
   $$\text{ZoneBreachFactor} = \min\left(25, \; \frac{Z_{\text{breaching}}}{Z_{\text{total}}} \times 25\right)$$
   *(where $Z_{\text{breaching}}$ is the number of zones with ambulance latency $> 12$ minutes, and $Z_{\text{total}} = 4$)*

### Baseline & Intervention Mitigation
- If no roads are disabled ($N_{\text{failed}} = 0$), $\text{RawScore} = 6$.
- When interventions are applied, the score is mitigated by the total intervention impact reduction percentage ($\sum \text{ImpactReductionPercent}$):
  $$\text{FinalScore} = \max\left(8, \; \text{round}\left(\text{RawScore} \times \left(1 - \min(0.85, \; \frac{\sum \text{Reduction}}{100})\right)\right)\right)$$

### Scale & Categories
- **70 – 100**: `SEVERE` (Critical systemic cascade, emergency access breached)
- **50 – 69**: `HIGH` (Widespread saturation across major arterials)
- **25 – 49**: `MODERATE` (Localized bottlenecking on adjacent streets)
- **0 – 24**: `LOW` (Stable or fully mitigated operations)

---

## 13. Bottleneck & Criticality Analysis

### Bottleneck Identification Mechanism
Bottlenecks are identified at junction nodes connecting road links where volume exceeds capacity ($\text{V/C} \ge 1.05$) or approaches saturation ($\text{V/C} \ge 0.80$).

### Primary Failure vs. Secondary Bottlenecks
- **Primary Failure**: The physical damage or environmental closure at the root asset (e.g., Central Silk Board Underpass submerged under 1.1m water).
- **Secondary Bottleneck**: Saturated intersections miles away (e.g., Agara Junction, Madiwala Checkpost) that did not suffer physical flooding, but fail due to diverging diverted traffic.

### Asset Inspector
Clicking on any road link, junction node, or hospital marker opens the [AssetInspector.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/AssetInspector.tsx) popover displaying:
- Asset name, infrastructure type, and physical length.
- Volume-to-Capacity ratio gauge (e.g., 1.34) and hourly flow numbers.
- Calculated delay increase percentage.
- Active failure simulation buttons ("Simulate Failure", "Restore Corridor").
- Alternative route breakdown showing which adjoining roads absorb traffic when this link is severed.

---

## 14. Hospital Accessibility

The hospital accessibility subsystem is implemented in [src/components/Panels/HospitalAccessView.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/HospitalAccessView.tsx) and [src/data/networkData.ts](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/data/networkData.ts).

### Medical Facilities
1. **St. John’s Medical College Hospital**: 1,350 beds, 24 trauma bays, 12-minute threshold (Primary Trauma Center anchor).
2. **Manipal Hospital Sarjapur Road**: 180 beds, 10 trauma bays, 15-minute threshold (Trauma Center).
3. **Greenview Medical Hospital (HSR Layout Sector 5)**: 85 beds, 6 trauma bays, 15-minute threshold (Community Clinic).
4. **Sri Jayadeva Institute of Cardiovascular Sciences (BTM)**: 1,150 beds, 20 trauma bays, 12-minute threshold (EMS Station).

### Residential Catchment Zones
- **HSR Layout (Sectors 1–7)**: Population 98,500; normal transit: 6.8 min.
- **BTM Layout (1st & 2nd Stage)**: Population 86,000; normal transit: 7.2 min.
- **Koramangala South**: Population 64,000; normal transit: 5.4 min.
- **Bommanahalli**: Population 72,000; normal transit: 8.5 min.
- **Total Catchment Population**: 320,500 residents (184,500 in the primary severed zones of HSR Layout and BTM Layout).

### Clinical "Golden Hour" Trauma Benchmark
In emergency medicine, the "Golden Hour" dictates that trauma patients who reach definitive surgical care within a critical window (calibrated to **12 minutes** for high-density urban transit) exhibit dramatically higher survival rates.

### Latency Progression Under Cascade
When Silk Board Underpass is severed:
- HSR Layout latency jumps from **6.8 min to 28.5 min (+319%)**.
- BTM Layout latency jumps from **7.2 min to 29.8 min (+314%)**.
- Bommanahalli latency jumps from **8.5 min to 26.5 min (+212%)**.
- **Result**: 3 out of 4 zones breach the 12-minute survival window, placing 184,500 residents at acute medical risk.

> **Operational Distinction**: *The platform models simulated roadway travel latency to hospital emergency gates. It does NOT track live in-hospital emergency room occupancy or ICU bed telemetry.*

---

## 15. Intervention Engine

The intervention system is implemented in [src/components/Panels/InterventionPlanner.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/InterventionPlanner.tsx).

### Pre-Engineered Intervention Options
The platform includes 4 pre-engineered counter-measures with strict budget unit costs:

| ID | Intervention Name | Type | Cost | Speed | Target Corridors | Key Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INT_SILK_BOARD_SUMP` | Deploy Stormwater Sump & Rapid Flood Gates | `PROTECT_ROUTE` | 1 unit | 30 min | `R_SILK_BOARD_JUNCTION` | **Prevents failure**; keeps 1 lane open (+45% cap); -50% ripple score |
| `INT_ELEVATED_EMERGENCY_LANE` | Designate Elevated Expressway as Emergency Lifeline | `OPERATIONAL_PRIORITY` | 1 unit | 15 min | `R_ELEVATED_EXPRESSWAY`, `R_ST_JOHNS_LIFELINE` | **Opens bypass**; flood-immune viaduct; +92% hospital access; -44% ripple |
| `INT_AGARA_KALUVE_DESILTING` | Rapid Desilting & Diversion Bunds on Agara Canal | `REINFORCE_CORRIDOR` | 1 unit | 45 min | `R_ORR_AGARA_CORRIDOR`, `R_SARJAPUR_AGARA_LINK` | +40% capacity on ORR; prevents drain backflow; -38% ripple score |
| `INT_DYNAMIC_SIGNAL_HSR` | Dynamic Adaptive Signal Preemption on Detour Corridors | `INCREASE_CAPACITY` | 1 unit | 10 min | `R_HSR_27TH_MAIN`, `R_SARJAPUR_AGARA_LINK`, `R_KORAMANGALA_100FT` | +35% capacity on bypass junctions; -32% ripple score |

### Emergency Budget Allocation & Optimization
- **Default Budget**: **3 resource units**.
- **Automated Recommendation Engine** (`getRecommendedIntervention` in [src/engine/simulationEngine.ts:797-832](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/engine/simulationEngine.ts#L797-L832)):
  - Evaluates all available interventions that fit within remaining budget.
  - Computes Resilience ROI:
    $$\text{ROI} = \frac{\text{ImpactReductionPercent}}{\text{CostUnits}}$$
  - Ranks and recommends the optimal action (e.g., `INT_SILK_BOARD_SUMP` with 50% reduction per unit).

---

## 16. Before vs. After Comparison

Implemented in [src/components/Panels/BeforeAfterComparison.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/BeforeAfterComparison.tsx).

### Comparative Metric Matrix
The Before vs. After panel directly benchmarks the **Unmitigated Peak Cascade State** (Step 4/5) against the **Mitigated Intervention State** when the optimal strategy (`INT_SILK_BOARD_SUMP` + `INT_ELEVATED_EMERGENCY_LANE`) is applied:

| Metric | Unmitigated Cascade (Before) | Mitigated Strategy (After) | Direction & Net Delta | Metric Origin |
| :--- | :--- | :--- | :--- | :--- |
| **Ripple Impact Score** | **86 / 100** (SEVERE) | **24 / 100** (LOW) | ↓ **-72% reduction** | Prototype composite metric |
| **Severed Primary Corridors** | 1 corridor | 0 corridors | ↓ **1 corridor restored** | Deterministic simulation output |
| **Secondary Bottlenecks** | 6 junctions | 1 junction | ↓ **-5 bottlenecks cleared** | Deterministic simulation output |
| **Avg Hospital Access Latency**| 26.8 minutes | 7.8 minutes | ↓ **-19.0 min saved** | Deterministic simulation output |
| **Zones Breaching 12m Window** | 3 of 4 zones | 0 of 4 zones | ↓ **100% zones protected** | Deterministic simulation output |
| **Catchment Population at Risk**| 184,500 residents | 0 residents | ↓ **-184,500 protected** | Scenario demographic assumption |
| **Displaced Overflow Traffic** | 3,100 vph | 0 vph | ↓ **-3,100 vph contained** | Scenario baseline assumption |
| **Peak Corridor V/C Stress** | 1.34 (134% capacity) | 0.88 (88% capacity) | ↓ **-34% saturation relief** | Deterministic calculation |

### Interactive Map Preview Toggle
Users can toggle between `UNMITIGATED` and `MITIGATED` views on the live map to visually observe the road network turn from severe rose/amber back to operational emerald and cyan.

---

## 17. Multi-Corridor Analysis

Implemented in [src/components/Panels/MultiCorridorAnalysisView.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/MultiCorridorAnalysisView.tsx).

### Purpose & Scope
While the Cascade Simulator traces the temporal evolution of a single initial failure (Silk Board), **Multi-Corridor Analysis** evaluates simultaneous multi-point failures and compound stress across intersecting corridors.

### Three Analysis Tabs
1. **Multi-Corridor Compare (`MULTI_CORRIDOR_COMPARE`)**:
   - Compares 2 to 5 corridors simultaneously in a structured comparison matrix.
   - Evaluates base volume, diverted flow, effective capacity, V/C ratio, delay increase, and current state.
2. **Compound Scenarios (`COMPOUND_SCENARIOS`)**:
   - Evaluates 4 pre-calibrated multi-corridor disruption scenarios:
     - **Scenario A**: Central Silk Board Underpass Submersion (3,100 vph displaced, RIS: 86)
     - **Scenario B**: Agara Lake Raja Kaluve Breach (2,750 vph displaced, RIS: 78)
     - **Scenario C**: Hosur Road Bommanahalli Inundation (2,300 vph displaced, RIS: 72)
     - **Scenario D**: Compound Cascade: Silk Board + Agara Breach (5,850 vph displaced, RIS: 95)
3. **Custom Interactive Network Builder (`INTERACTIVE_BUILDER`)**:
   - Allows users to interactively toggle any combination of the 12 corridors to inject custom disruptions.

---

## 18. Custom Cascade / User Scenarios

### Implementation Verification Status
- **Standalone Navigation Tab**: *Not implemented as a standalone top-level tab.*
- **Integrated Custom Disruption Functionality**: **IMPLEMENTED** across two primary areas of the codebase:
  1. **Tab 3 of Multi-Corridor View ("Custom Corridor Failure Injector")**: Users can toggle any combination of road corridors, observe live recalculated metrics, and click **"Apply Custom Disruption to Map"** ([MultiCorridorAnalysisView.tsx:714-807](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/MultiCorridorAnalysisView.tsx#L714-L807)).
  2. **Interactive Map Asset Inspector**: Clicking any road on the Leaflet map opens the Asset Inspector, allowing the user to click **"Simulate Failure"** on that specific link. In `App.tsx`, this sets `customDisabledRoadIds`, recalculates the entire network state via `runResilientCascadeSimulation`, updates the map, and reveals a **"Reset Custom"** button in the timeline bar.

---

## 19. Proactive Stress-Testing

Implemented in [src/components/Panels/StressTestView.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/StressTestView.tsx) and `runProactiveStressTest` in [src/engine/simulationEngine.ts:694-734](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/engine/simulationEngine.ts#L694-L734).

### Mechanism
The proactive stress-test engine does not wait for a cloudburst scenario. Instead, it systematically iterates through every link in the road network graph, simulates an isolated failure on that single link, runs `calculateDynamicCascade([road.id])`, and compiles a **Single Point of Failure (SPOF) Ranking**.

### Top Ranked Single Points of Failure
1. **Rank 1: Central Silk Board Underpass (`R_SILK_BOARD_JUNCTION`)**:
   - Ripple Impact Score: **86 / 100** (SEVERE)
   - Secondary Bottlenecks: 6 | Hospital Latency Delay: +19.6 min | Zones Breaching: 3
   - Vulnerability Factor: Primary nexus of Hosur Road & Outer Ring Road; failure severs east-west transit and displaces 3,100 vph into residential corridors.
2. **Rank 2: Outer Ring Road Agara Corridor (`R_ORR_AGARA_CORRIDOR`)**:
   - Ripple Impact Score: **78 / 100** (SEVERE)
   - Secondary Bottlenecks: 4 | Hospital Latency Delay: +13.5 min | Zones Breaching: 2
   - Vulnerability Factor: Critical 6-lane tech corridor connecting Silk Board to Bellandur; vulnerable to Agara Raja Kaluve drain backflow.
3. **Rank 3: Hosur Road Surface Arterial (`R_HOSUR_RD_SURFACE`)**:
   - Ripple Impact Score: **72 / 100** (SEVERE)
   - Secondary Bottlenecks: 3 | Hospital Latency Delay: +11.2 min | Zones Breaching: 2
   - Vulnerability Factor: Main southern arterial into Bengaluru; ground-level inundation at Bommanahalli blocks heavy freight and bus fleets.
4. **Rank 4: St. John’s Trauma Emergency Lifeline (`R_ST_JOHNS_LIFELINE`)**:
   - Ripple Impact Score: **68 / 100** (HIGH)
   - Secondary Bottlenecks: 2 | Hospital Latency Delay: +18.4 min | Zones Breaching: 3
   - Vulnerability Factor: Dedicated trauma approach corridor to St. John’s Hospital Emergency Resuscitation Gate; failure directly threatens critical patients.

---

## 20. Guided Demo Story

The guided demonstration workflow is implemented in [src/components/Demo/GuidedDemoBar.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Demo/GuidedDemoBar.tsx). It provides an automated or manual **14-step judging script**:

1. **Step 1: Healthy Baseline Network** $\rightarrow$ Step index 0, mode `CASCADE_SIMULATION`.
2. **Step 2: Introduce Urban Flooding / Hazard** $\rightarrow$ Step index 1, shows flood polygon.
3. **Step 3: Initial Failed Infrastructure Asset** $\rightarrow$ Highlights Silk Board, opens Asset Inspector.
4. **Step 4: Advance the Cascade Timeline** $\rightarrow$ Step index 2, displaced flow begins outward surge.
5. **Step 5: Traffic Redistribution & Secondary Bottlenecks** $\rightarrow$ Step index 3, ORR Agara and HSR 27th Main choke.
6. **Step 6: Hospital & Emergency Accessibility Impact** $\rightarrow$ Mode switches to `HOSPITAL_ACCESS`, showing trauma delay surge.
7. **Step 7: Inspect Critical Infrastructure Asset** $\rightarrow$ Mode `CASCADE_SIMULATION`, inspector displays asset parameters.
8. **Step 8: Why It Is Disproportionately Important** $\rightarrow$ Alternative route capacity exhaustion explained.
9. **Step 9: Open Intervention Engine** $\rightarrow$ Mode `INTERVENTION_PLANNER`, reviews 3 budget units.
10. **Step 10: Compare Possible Interventions** $\rightarrow$ Reviews trade-offs between physical sumps and signal preemption.
11. **Step 11: Apply the Strongest Intervention** $\rightarrow$ Deploys Sump (`INT_SILK_BOARD_SUMP`) + Elevated Lane (`INT_ELEVATED_EMERGENCY_LANE`).
12. **Step 12: Show Before vs. After** $\rightarrow$ Mode `BEFORE_AFTER_COMPARISON`, benchmarks 72% RIS reduction.
13. **Step 13: Run Proactive Stress-Test** $\rightarrow$ Mode `PROACTIVE_STRESS_TEST`, reviews mathematical SPOF ranking.
14. **Step 14: Scan Another Critical Asset Before Failure** $\rightarrow$ Highlights ORR Agara as Rank #2 vulnerability.

---

## 21. Gemini Integration

### Architectural Isolation & Secret Protection
- **Client Safety**: The browser application has **zero access** to `GEMINI_API_KEY`. The key is stored exclusively on the server in `.env`.
- **SDK Execution**: `@google/genai` is imported and instantiated **only** in `server.ts`.
- **Client Communication**: The frontend calls internal proxy routes (`/api/ai/*`) via `aiService.ts`.

### Gemini Models in Code
As defined in `server.ts:43`, models are ordered from primary to resilient fallbacks:
1. `gemini-3.8-flash` (Primary fast reasoning model)
2. `gemini-3.1-flash-lite` (Secondary fallback)
3. `gemini-flash-latest` (Tertiary fallback)

### Resilience & 503 Spike Handling
In `generateContentWithFallback` ([server.ts:36-74](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/server.ts#L36-L74)):
- Checks an in-memory `aiCache: Map<string, string>`.
- If an API call fails with status `503`, `UNAVAILABLE`, or high demand, the server waits 350ms and retries before falling back to the next model.
- If all models fail or `GEMINI_API_KEY` is not configured, the endpoint returns `{ success: false, isAiGenerated: false, explanation: fallbackText }`.

---

## 22. API Reference

All endpoints are hosted in `server.ts`:

| Method | Endpoint | Purpose | Request Body | Response Body | Frontend Consumer | Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/status` | Safe AI status probe | None | `{ configured: boolean, model: string, statusMessage: string }` | [Header.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Header.tsx) | Returns `configured: false` |
| `POST` | `/api/ai/explain-cascade` | Explains timeline cascade step | `{ stepTitle, stepPhase, disruptedRoads, rippleScore, bottleneckCount, hospitalDelayMinutes, summaryBlock }` | `{ success: boolean, isAiGenerated: boolean, explanation: string }` | [CascadeMap.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Map/CascadeMap.tsx) | Returns `summaryBlock.cascadeEffect` |
| `POST` | `/api/ai/explain-bottleneck` | Explains corridor bottleneck | `{ roadName, vToCRatio, delayIncrease, addedDivertedVolume, failedRoadName }` | `{ success: boolean, isAiGenerated: boolean, explanation: string }` | [aiService.ts](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/services/aiService.ts) | Returns computed string |
| `POST` | `/api/ai/hospital-brief` | Medical trauma access brief | `{ hospitalName, baselineLatency, currentLatency, delayMinutes, severedRoutes, affectedPopulation }` | `{ success: boolean, isAiGenerated: boolean, explanation: string }` | [HospitalAccessView.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/HospitalAccessView.tsx) | Returns deterministic brief |
| `POST` | `/api/ai/compare-interventions` | Intervention trade-off assessment | `{ activeInterventions, availableBudget, remainingBudget, currentRippleScore }` | `{ success: boolean, isAiGenerated: boolean, explanation: string }` | [InterventionPlanner.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/InterventionPlanner.tsx), [BeforeAfterComparison.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/BeforeAfterComparison.tsx) | Returns rule-based appraisal |
| `POST` | `/api/ai/explain-multi-corridor` | Multi-corridor cascade synthesis | `{ scenarioName, failedCorridors, displacedVolumeVph, rippleScore, secondaryBottlenecks, hospitalImpact, comparedScenarios }` | `{ success: boolean, isAiGenerated: boolean, explanation: string }` | [MultiCorridorAnalysisView.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/MultiCorridorAnalysisView.tsx) | Returns scenario narrative |
| `GET` | `/health` / `/api/health` | Container liveness probe | None | `{ status: "ok", app: "Cascade Shield Server", timestamp: string }` | Load balancers / PaaS probes | Returns HTTP 200 JSON |
| `GET` | `*` | Production SPA catch-all | None | HTML file (`dist/index.html`) | Browser clients | Serves SPA shell |

---

## 23. Environment Variables

| Variable | Required? | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Optional** *(Required for live AI explanations; optional for deterministic simulation)* | Server-side only (`server.ts`) | Authenticates calls to Google Gemini models via `@google/genai`. |
| `NODE_ENV` | **Required in Production** | Server-side runtime | When set to `"production"`, Express serves static assets from `dist/` instead of mounting Vite middleware. |
| `PORT` | Deployment-dependent | Server-side runtime | Server listening port. *(Currently hardcoded to 3000 in `server.ts:11`; see Deployment section)* |
| `DISABLE_HMR` | Optional | Build / Dev (`vite.config.ts`) | If set to `'true'`, disables Vite HMR and file watching to conserve CPU in cloud containers. |
| `APP_URL` | Optional | Documentation / `.env.example` | Metadata declaration of application deployment URL. |

---

## 24. Data Sources & Provenance

Cascade Shield explicitly structures its data into **4 distinct layers** disclosed in [DataProvenanceModal.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Panels/DataProvenanceModal.tsx):

```
Layer 1: Real / Open GIS Baseline Data (OpenStreetMap road alignments, coordinates)
                                 │
Layer 2: Scenario Assumptions & Hazard Inputs (110mm rain, 3,100 vph baseline, 12m trauma window)
                                 │
Layer 3: Deterministic Simulation Engine (Mathematical graph calculations, V/C ratios, RIS)
                                 │
Layer 4: AI Decision-Support Layer (Gemini operational explanations grounded in Layer 3 numbers)
```

---

## 25. Data Provenance & Assumptions Table

| Layer | Source | Nature | Purpose in Platform |
| :--- | :--- | :--- | :--- |
| **Road Geometries & Junctions** | OpenStreetMap (OSM) contributors | Real GIS Baseline | Precise lat/lng vectors, road types, and physical connectivity. |
| **Hospital Coordinates & Beds** | Public hospital records (St. John's, Manipal, Jayadeva) | Real GIS Baseline | Emergency trauma gate anchors and designated emergency thresholds. |
| **Residential Ward Boundaries** | BBMP Ward Boundaries (HSR, BTM, Koramangala) | Real GIS Baseline | Catchment zone polygons, centroids, and demographic scale. |
| **Hazard & Rainfall Surge** | IMD cloudburst records / BBMP flood mapping | Scenario Assumption | 110mm rainfall in 2 hours; 1.1m underpass water depth. |
| **Traffic Demands & Capacities** | Urban traffic engineering estimates | Scenario Assumption | Baseline hourly volumes (e.g. 3,100 vph on Silk Board) and link capacities. |
| **Trauma Golden-Hour Benchmark** | Emergency medicine clinical standard | Scenario Assumption | 12-minute threshold for trauma resuscitation viability. |
| **V/C Ratios & Delay Curves** | Deterministic piecewise delay model | Derived Metric | Link saturation states, delay increases (+40%, +95%, +190%). |
| **Ripple Impact Score** | Prototype composite formulation | Derived Metric | Systemic 0–100 resilience score measuring network cascade severity. |
| **Executive Briefings** | Google Gemini 3.8 Flash | AI-Generated Explanation | Plain-language decision support translating derived metrics. |

---

## 26. Map System

- **Map Engine**: Leaflet 1.9.4 (`L.map`) wrapped in [src/components/Map/CascadeMap.tsx](file:///c:/Users/aksha/antigravity/CASCADE-SHIELD/src/components/Map/CascadeMap.tsx).
- **Basemap**: OpenStreetMap raster tile layer (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Attribution**: `&copy; OpenStreetMap contributors`.
- **Infrastructure Overlays**:
  - **Road Segments**: SVG polylines rendered with line-weight 4–6 and dynamic colors:
    - Normal: Emerald (`#10b981`)
    - High Pressure: Amber (`#f59e0b`)
    - At Risk: Orange (`#f97316`)
    - Failed: Rose (`#ef4444`, dashed)
    - Critical Access Impacted: Purple (`#c084fc`)
  - **Inundation Hazard Zone**: Semi-transparent blue polygon (`fillOpacity: 0.22`, dashed boundary) representing the Agara-Silk Board stormwater basin.
  - **Secondary Bottleneck Markers**: Pulsating circular markers positioned on congested junction nodes.
  - **Traffic Diversion Badges**: Floating directional pills displaying diverted volume additions (e.g., `+1,300 vph`).
  - **Barricade Markers**: Construction barrier icons placed on severed roadway portals.
  - **Hospital Markers**: Custom pulsing red/cyan markers displaying bed capacity and trauma bays.

---

## 27. Error Handling & Resilience

1. **Gemini API Failure**: Caught gracefully in `server.ts`. Endpoints return `{ success: false, isAiGenerated: false, explanation: fallbackText }`.
2. **Missing `GEMINI_API_KEY`**: Server detects missing key on startup, reports `configured: false` via `/api/ai/status`, and serves fallback summaries without error.
3. **503 High-Demand Spikes**: `server.ts` catches 503/UNAVAILABLE errors, waits 350ms, retries, and steps down to fallback models (`gemini-3.1-flash-lite`, `gemini-flash-latest`).
4. **Client Network Disconnection**: `aiService.ts` catches fetch rejections and returns pre-computed fallback narratives. The simulation continues uninterrupted.
5. **Simulation Math Exception**: `runResilientCascadeSimulation` in `simulationEngine.ts` wraps all calculations in a `try...catch` block. If an exception occurs, it falls back to a guaranteed baseline dataset (`PREBUILT_CASCADE_STEPS[1]`).

---

## 28. Security

- **Server-Side Key Isolation**: `GEMINI_API_KEY` is loaded into Node.js process memory via `dotenv`. It is never sent to the browser or bundled into static assets.
- **Client-Side Sanitation**: Client source files (`src/`) contain zero API keys or secret references.
- **Git Protection**: `.gitignore` explicitly excludes `.env*`, preserving only `.env.example`.
- **Safe Status Disclosure**: `/api/ai/status` returns a boolean flag (`configured: true/false`) and model name; it never echoes any portion of the secret key.

---

## 29. Performance & Scalability

### Current Prototype Performance
- **Client Execution**: In-browser graph calculations run in $< 5\text{ ms}$ for the 12-node, 12-link network.
- **Zero Frame Drops**: Leaflet DOM vector rendering updates instantaneously on timeline scrubs.
- **Memory Footprint**: Client bundle size is under 500 KB compressed.

### Scalability Considerations for City-Scale Extension
- **Current Network Scope**: 12 nodes, 12 roads, 4 zones, 4 hospitals.
- **City-Scale Scaling (10,000+ Links)**:
  - Browser-side calculations would require WebAssembly (Wasm) or migration to a backend graph database (e.g., pgRouting, Neo4j).
  - Leaflet vector layers would require Canvas or WebGL rendering (e.g., MapLibre GL, Deck.gl) to handle tens of thousands of links simultaneously.

---

## 30. Deployment

### Commands
- **Production Build**:
  ```bash
  npm run build
  ```
  *(Runs `vite build` to generate `dist/`, then runs `esbuild` to bundle `server.ts` into `dist/server.cjs`)*
- **Production Start**:
  ```bash
  npm run start
  ```
  *(Executes `node dist/server.cjs`)*

### Deployment Observations & Limitations
1. **Dynamic Port Binding in `server.ts`**:
   - Currently, line 11 of `server.ts` has a hardcoded port: `const PORT = 3000;`.
   - On container platforms (Google Cloud Run, AWS App Runner, Heroku, Render), the host dynamically assigns a port via the `PORT` environment variable (e.g., Cloud Run uses `PORT=8080`).
   - *Production adaptation required*: Change `const PORT = 3000;` to `const PORT = parseInt(process.env.PORT || '3000', 10);`.
2. **Cross-Platform Script in `package.json`**:
   - The `"clean"` script uses `rm -rf dist server.js`, which fails in default Windows `cmd.exe` (though it succeeds in bash and PowerShell).
3. **Static Hosting vs. Full-Stack Hosting**:
   - If deployed to a static-only CDN (GitHub Pages, Vercel Static), the frontend runs in offline deterministic fallback mode.
   - For full AI functionality, deployment to a Node.js container or PaaS host is required.

---

## 31. Running the Project Locally

### Prerequisites
- **Node.js**: Version 18.0 or higher (Node 20 or 22 recommended).
- **npm**: Version 9.0 or higher.
- **OS**: Windows, macOS, or Linux.

### Step-by-Step Setup

1. **Open Workspace Directory**:
   ```bash
   cd c:\Users\aksha\antigravity\CASCADE-SHIELD
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Open `.env` and add your Google Gemini API key:
     ```env
     GEMINI_API_KEY="your_actual_gemini_api_key_here"
     ```
   *(Note: The app will run in deterministic fallback mode if this key is omitted)*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   - Open your browser to: `http://localhost:3000`

### Troubleshooting Common Issues
- **Port 3000 In Use (`EADDRINUSE`)**:
  - Check process: `netstat -ano | findstr :3000`
  - Terminate conflicting process: `taskkill /PID <PID> /F`
- **Missing Gemini API Key**:
  - The header badge will indicate `AI Engine: Fallback`. The simulation remains 100% operational using local engineering briefs.

---

## 32. Demo Flow (Hackathon Presentation)

1. **Establish Healthy Baseline**:
   - Open app on `http://localhost:3000`. Show the green network map and normal 6.8 min transit to St. John's Hospital.
2. **Trigger Monsoon Inundation**:
   - Scrub timeline to **T+12m (Step 1)**. Point out the flood polygon and the red `FAILED` Central Silk Board Underpass.
3. **Demonstrate Network Redistribution**:
   - Scrub to **T+25m (Step 2)**. Point out 3,100 vph surging into ORR Agara and HSR 27th Main.
4. **Highlight Secondary Bottlenecks**:
   - Scrub to **T+40m (Step 3)**. Show pulsating bottlenecks at Agara and Madiwala junctions (V/C > 125%).
5. **Show Trauma Golden-Hour Breach**:
   - Switch to **Hospital Access View**. Show ambulance transit exploding to 28.5 min (+319%), isolating 184,500 residents.
6. **Inspect Critical Asset**:
   - Click Central Silk Board on the map. Show Asset Inspector with capacity metrics and alternative route breakdown.
7. **Open Intervention Planner**:
   - Switch to **Interventions**. Show 3 budget units. Review recommended Stormwater Sump and Elevated Viaduct Lifeline.
8. **Demonstrate Before vs. After**:
   - Switch to **Before vs. After**. Show the 72% reduction in Ripple Impact Score (86 $\rightarrow$ 24) and restoration of all hospital access.
9. **Run Proactive Stress-Test**:
   - Switch to **Stress-Test**. Show the SPOF ranking proving that Silk Board and Agara Corridor are mathematical single points of failure before disaster strikes.
10. **Explain AI Decision-Support Role**:
    - Highlight the Gemini badge: explain that numbers are computed mathematically and Gemini acts as an explainable tactical advisor.

---

## 33. Important Claims & Claim Discipline

### "What Cascade Shield Does NOT Claim"

To maintain scientific integrity during judging and technical presentations, Cascade Shield explicitly states what it does **not** do:

1. **NOT a Flood Forecasting System**: Cascade Shield does not compute hydrological precipitation-runoff equations or predict rainfall depths. It uses scenario-based flood assumptions.
2. **NOT a Live Telematics Feed**: The current prototype does not ingest live GPS probes from Google Maps, TomTom, or city CCTV cameras. Traffic numbers are scenario-calibrated baseline models.
3. **NOT an Official Government Index**: The Ripple Impact Score (0–100) is a prototype decision-support metric; it is not an Indian Road Congress (IRC) or NDMA regulatory standard.
4. **NOT a Live Hospital Telemetry System**: The platform does not read live emergency room triage beds or operating theatre availability; it calculates physical transit travel times to hospital gates.
5. **NOT an AI Black-Box Simulator**: Machine learning and LLMs do not calculate simulation numbers. Calculations are deterministic; Gemini translates results into operational language.

---

## 34. Current Implementation Status

| Feature / Component | Status | Evidence / File | Notes |
| :--- | :--- | :--- | :--- |
| **Cascade Simulator** | **IMPLEMENTED** | `src/components/Timeline/RippleTimeline.tsx` | 6 calibrated timeline steps with automatic playback |
| **Multi-Corridor Analysis**| **IMPLEMENTED** | `src/components/Panels/MultiCorridorAnalysisView.tsx` | Matrix compare, 4 preset compound scenarios, and custom failure toggles |
| **Hospital Access View** | **IMPLEMENTED** | `src/components/Panels/HospitalAccessView.tsx` | 4 hospitals, 4 zones, golden-hour thresholds, latency meters |
| **Intervention Engine** | **IMPLEMENTED** | `src/components/Panels/InterventionPlanner.tsx` | 4 counter-measures, budget allocator, automated ROI ranking |
| **Before vs. After** | **IMPLEMENTED** | `src/components/Panels/BeforeAfterComparison.tsx` | Full delta matrix and interactive map preview toggle |
| **Proactive Stress-Test** | **IMPLEMENTED** | `src/components/Panels/StressTestView.tsx` | 12-road SPOF ranking, stress table, detour alternatives |
| **Guided Demo Engine** | **IMPLEMENTED** | `src/components/Demo/GuidedDemoBar.tsx` | 14-step automated and manual judging script |
| **Custom Failure Injection**| **IMPLEMENTED** | Tab 3 of `MultiCorridorAnalysisView.tsx` & map click in `App.tsx` | Implemented via Custom Corridor Failure Injector and Asset Inspector |
| **Gemini Integration** | **IMPLEMENTED** | `server.ts` & `src/services/aiService.ts` | 5 endpoints with fallback models and in-memory cache |
| **OpenStreetMap Integration**| **IMPLEMENTED**| `src/components/Map/CascadeMap.tsx` | Leaflet raster tiles with full attribution |
| **Deterministic Fallback** | **IMPLEMENTED** | `src/engine/simulationEngine.ts` | Complete local execution without external API dependencies |
| **Production Build** | **IMPLEMENTED** | `package.json` (`npm run build`) | Combines `vite build` and `esbuild` server bundle |
| **Deployment Readiness** | **PARTIALLY IMPLEMENTED**| `server.ts` | Works in container; needs `process.env.PORT` dynamic binding |

---

## 35. Known Limitations

### Current Prototype Limitations
1. **Network Scope**: Encompasses 12 nodes and 12 road corridors covering the Central Silk Board and HSR Layout nexus. It is not yet a city-wide model for all of Bengaluru.
2. **Hardcoded Server Port**: `server.ts` hardcodes `PORT = 3000`, requiring modification for dynamic-port cloud providers (e.g., Cloud Run).
3. **Static Traffic Demand Calibration**: Displaced traffic volumes are scenario-calibrated approximations rather than origin-destination (O-D) survey matrices.
4. **Single-Hazard Focus**: Models pluvial urban flooding. Does not currently simulate earthquakes, bridge structural collapses, or electrical grid blackouts.

---

## 36. Future Extensions

1. **City-Scale Network Expansion**: Ingest BBMP/OpenStreetMap road networks for the entire 800 km² Bengaluru metropolitan area using WebAssembly graph engines.
2. **Live Sensor & Telematics Integration**: Ingest real-time road speed feeds (e.g., OpenTraffic, Google Distance Matrix API) and BBMP flood sensor alerts.
3. **Multi-Infrastructure Coupling**: Model interdependencies between road flooding, power sub-station inundation (BESCOM), and telecommunication tower outages.
4. **Dynamic Hydrological Modeling**: Connect directly to rainfall radar feeds and hydrodynamic surface runoff models (e.g., SWMM).
5. **Historical Model Calibration**: Calibrate redistribution split factors against observed traffic patterns during historical Bengaluru monsoon flood events (e.g., September 2022).

---

## 37. Research & Technical Foundations

- **Bureau of Public Roads (BPR) Delay Functions**: Federal Highway Administration standard modeling travel time increases as a function of Volume-to-Capacity ratios.
- **Shortest Path & Alternative Apportionment**: Network graph theory allocating diverted flow across parallel non-saturated edges.
- **Clinical Golden-Hour Emergency Trauma Principles**: Trauma system design prioritizing definitive medical resuscitation within 12–15 minutes of acute injury.
- **OpenStreetMap (OSM)**: Open-access geographic data foundation ([OpenStreetMap](https://www.openstreetmap.org/)).
- **Leaflet GIS Library**: Industry-standard open-source interactive mapping library ([Leaflet](https://leafletjs.com/)).

---

## 38. Hackathon Pitch

### One-Sentence Explanation
> "Cascade Shield is a resilience decision-support platform that models how localized infrastructure disruptions propagate into cascading city-wide gridlock, quantifies the threat to emergency hospital access, and lets planners test and compare interventions before disaster strikes."

### 30-Second Pitch
> "When Central Silk Board floods during a Bengaluru monsoon cloudburst, the problem isn’t just water on one road. 3,100 vehicles per hour divert into residential HSR Layout, triggering six secondary bottlenecks and pushing ambulance travel times to St. John’s Hospital from 6 minutes to 28 minutes—breaching the trauma survival window for 184,500 people. Cascade Shield models this network ripple, identifies the critical assets amplifying the failure, and proves that deploying a high-capacity sump and elevated emergency lane clears five bottlenecks and cuts the Ripple Impact Score by 72%."

### 60-Second Pitch
> "Most disaster management tools only tell you where the water is. But in connected cities, one failure becomes many. Cascade Shield represents infrastructure as a living network graph. When we simulate a 110mm cloudburst at Central Silk Board, our deterministic engine calculates how displaced traffic overloads alternative corridors using Volume-to-Capacity delay curves. We track emergency access latencies to regional trauma centers, showing exactly when neighbourhood wards breach clinical golden-hour thresholds. Then, our Intervention Engine lets municipal coordinators allocate emergency budgets across physical dewatering, canal desilting, and elevated expressways—benchmarking Before vs. After results side-by-side. Finally, server-side Google Gemini models translate complex mathematical metrics into clear tactical briefings. With Cascade Shield, cities stop reacting to disasters and start seeing the ripple before the next failure happens."

### 2-Minute Technical Pitch
> "Cascade Shield addresses the hackathon challenge of cascading infrastructure failure with a four-layer architecture. 
> 
> Layer 1 is a verified GIS baseline from OpenStreetMap representing the Central Silk Board, Outer Ring Road, and HSR Layout corridor in Bengaluru. 
> 
> Layer 2 defines calibrated scenario inputs: a 110mm cloudburst causing Raja Kaluve stormwater overflow, submerging the underpass under 1.1 meters of runoff.
> 
> Layer 3 is our deterministic simulation engine running entirely in TypeScript. When the underpass fails, the engine apportions 3,100 vehicles per hour across alternative routes based on topology. Using piecewise congestion delay curves calibrated to Volume-to-Capacity ratios, it identifies secondary intersection choke points and tracks ambulance transit times to St. John’s Medical College Hospital. We compute a composite Ripple Impact Score from 0 to 100 weighting route saturation, bottlenecks, and trauma delays. Planners can allocate emergency budget units to counter-measures like stormwater sumps and emergency viaduct lanes, benchmarking unmitigated vs. mitigated network states in a Before vs. After comparison.
> 
> Layer 4 is our AI decision-support layer. Using the `@google/genai` SDK on an Express backend with resilient model cascading and prompt caching, Gemini translates computed numbers into operational briefings for incident commanders. The API key is strictly server-side, and if the API is offline, our deterministic engine ensures zero loss of functionality. Cascade Shield brings mathematical rigor and explainability to infrastructure resilience."

---

## 39. Judge / Viva Questions & Answers

### 1. Why this problem?
Because traditional monitoring monitors assets in silos. In reality, infrastructure operates as an interdependent network where localized failures amplify into systemic crises.

### 2. Why Bengaluru?
Bengaluru’s Central Silk Board and Outer Ring Road is one of the world's most congested transit corridors, situated in a low-elevation lake catchment prone to monsoon flash flooding.

### 3. Is this AI disaster prediction?
No. This is a **scenario-based resilience decision-support system**. Quantitative numbers are computed deterministically using network graph algorithms. Gemini generates natural language explanations of those numbers.

### 4. Where does the data come from?
Road alignments, coordinates, and hospital locations come from real OpenStreetMap GIS data. Rainfall depths, hourly traffic volumes, and clinical golden-hour thresholds are calibrated scenario assumptions.

### 5. How is the Ripple Impact Score calculated?
It is a composite 0–100 score combining four sub-factors capped at 25 points each: affected route percentage, active bottleneck junctions, average trauma latency delay, and zones breaching emergency thresholds, mitigated by active intervention percentages.

### 6. What happens if the Gemini API key is missing or invalid?
The system operates flawlessly in deterministic fallback mode. Pre-computed engineering explanations are displayed, and all interactive map controls, timelines, and calculations remain 100% functional.

### 7. How are interventions evaluated?
Each intervention has a budget cost, capacity boost percentage, and impact reduction percentage. The engine calculates resilience ROI ($\text{Reduction} / \text{Cost}$) and computes the net mitigated network state.

### 8. How is the Gemini API key secured?
The key is stored exclusively on the server in `.env` and accessed via `process.env.GEMINI_API_KEY`. The client communicates with internal Express proxy routes (`/api/ai/*`) and never receives the key.

### 9. Can this scale to an entire city?
Yes. The mathematical graph model scales to thousands of nodes. For city-wide scale (e.g., 50,000 links), the client-side simulation would be compiled to WebAssembly (Wasm) or hosted as a backend routing service.

---

## 40. Team Technical Cheat Sheet

| Topic | Key Facts / Pointers |
| :--- | :--- |
| **Project Definition** | Resilience decision-support platform modeling cascading infrastructure failures and interventions. |
| **Tagline** | *"See the ripple before the next failure happens."* |
| **Study Area** | Central Silk Board & HSR Layout, Bengaluru, Karnataka, India (Agara-Bellandur catchment). |
| **Hazard Scenario** | 110mm Monsoon Cloudburst; 1.1m underpass water depth; Raja Kaluve drain surge. |
| **Frontend Stack** | React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4, Leaflet 1.9, Lucide React, Motion. |
| **Backend Stack** | Node.js, Express 4, `@google/genai` (Gemini 3.8 Flash), `dotenv`, `esbuild`. |
| **Simulation Truth** | **100% Deterministic TypeScript** (`src/engine/simulationEngine.ts`). Gemini is strictly an explainer. |
| **Map Layer** | Leaflet with OpenStreetMap raster tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). |
| **Primary Hospital** | St. John’s Medical College Hospital (1,350 beds, 24 trauma bays, 12m golden-hour window). |
| **Core Formula** | $\text{RIS} = \min(25, \text{Routes}) + \min(25, \text{Bottlenecks}) + \min(25, \text{Latency}) + \min(25, \text{Zones})$. |
| **App Modes** | `CASCADE_SIMULATION`, `MULTI_CORRIDOR_ANALYSIS`, `HOSPITAL_ACCESS`, `INTERVENTION_PLANNER`, `BEFORE_AFTER_COMPARISON`, `PROACTIVE_STRESS_TEST`. |
| **Key Commands** | Dev: `npm run dev` \| Build: `npm run build` \| Start: `npm run start`. |
| **Most Critical Files**| `server.ts`, `src/engine/simulationEngine.ts`, `src/data/networkData.ts`, `src/App.tsx`. |

---

## 41. Final Summary

**Cascade Shield** moves disaster management from simply observing infrastructure failures toward understanding how failures propagate through interconnected networks and comparing possible interventions before a cascade becomes a crisis.

By grounding its physical network in real OpenStreetMap GIS data, executing transparent deterministic traffic redistribution calculations, tracking clinical trauma survival latencies, and pairing these analytics with an isolated, explainable Gemini AI decision-support layer, Cascade Shield delivers a realistic, actionable operational intelligence platform for municipal resilience planning.
