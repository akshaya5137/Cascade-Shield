<div align="center">
   
# Cascade Shield

### Resilience Decision Support for Cascading Infrastructure Failures

> *"See the ripple before the next failure happens."*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)

</div>

---

## Overview

**Cascade Shield** is a resilience decision-support system that models how infrastructure failures propagate through connected networks, identifies the assets that amplify those failures, and lets planners compare interventions before a cascade becomes a crisis.

Instead of looking only at the asset that has failed, Cascade Shield focuses on the **ripple effect**:

**Failure → Flow Redistribution → Secondary Stress → Critical Access Impact → Intervention**

> **Important:** Cascade Shield is a **scenario-based decision-support prototype**, not an AI disaster prediction system. Network flows, capacity stress, delays, hospital-access latency, and resilience metrics are calculated by a deterministic simulation engine. Gemini is used only as an optional explanation layer.

---

# The Problem

### Cascading Failure: When One Failure Becomes Many

Urban infrastructure works as a connected network. When a critical road or corridor becomes unavailable, the consequences can spread to other parts of the network.

A single disruption can cause:

1. **Flow Redistribution**  
   Displaced traffic moves onto alternative corridors.

2. **Capacity Overload**  
   Alternate routes can approach or exceed their modeled capacity.

3. **Secondary Bottlenecks**  
   Junctions and corridors receiving diverted traffic can become highly stressed.

4. **Critical Access Impact**  
   Increased travel times can affect access to important facilities such as hospitals.

5. **Loss of Network Redundancy**  
   If another important corridor fails at the same time, the remaining network has fewer alternatives to absorb the disruption.

Traditional asset-focused monitoring can show that a road has failed, but it does not necessarily show **how that failure propagates through the connected network**.

---

# The Solution

Cascade Shield represents the road system as a network graph and simulates how disruption moves through that network.

**Failure → Flow Redistribution → Secondary Stress → Critical Access Impact → Intervention → Before vs After**

The system allows users to:

- Simulate infrastructure failures over time
- Analyze secondary bottlenecks and overloaded corridors
- Compare multiple simultaneous failures
- Measure simulated hospital accessibility
- Calculate a Ripple Impact Score (RIS)
- Test resilience interventions
- Compare network conditions before and after mitigation
- Stress-test roads to identify potential single points of failure

---

## Key Features

| Feature | Purpose |
|---|---|
| **Cascade Simulator** | Shows how one failure propagates through the network over time |
| **Multi-Corridor Analysis** | Simulates and compares simultaneous corridor failures |
| **Hospital Access** | Measures simulated travel latency to critical hospital access points |
| **Intervention Engine** | Tests protection, diversion and capacity interventions |
| **Before vs After** | Compares network conditions before and after mitigation |
| **Proactive Stress-Test** | Identifies vulnerable single points of failure |
| **Custom Failure Injection** | Allows users to create their own failure combinations |
| **Interactive Map** | Visualizes roads, failures, bottlenecks and critical facilities |
| **Guided Demo** | Provides a structured walkthrough of the prototype |
| **Gemini Explanations** | Converts simulation results into operational explanations |

---

## Project Structure

```text
CASCADE-SHIELD/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   ├── Panels/
│   │   └── Timeline/
│   ├── data/
│   │   └── networkData.ts
│   ├── engine/
│   │   └── simulationEngine.ts
│   ├── services/
│   │   └── aiService.ts
│   ├── App.tsx
│   └── main.tsx
├── server.ts
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Screenshots
**Cascade Simulator**
<img width="1917" height="863" alt="image" src="https://github.com/user-attachments/assets/9b69d473-1ca6-4ba2-8cc9-d839b898c915" />

**Multi-Corridor Analysis**
<img width="1917" height="866" alt="image" src="https://github.com/user-attachments/assets/3695d4d0-a4f8-4db0-81a1-2b55c70d3f6b" />

**Hospital Access**
<img width="1917" height="872" alt="image" src="https://github.com/user-attachments/assets/fef36caf-aa77-4f8c-b5ab-bf9e21cf005c" />

**Intervention Engine**
<img width="1916" height="860" alt="image" src="https://github.com/user-attachments/assets/6aaf5c8c-82c4-45dd-9c7f-ec8dabdd4b8f" />

**Before vs After**
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/f20a6346-2fa8-44a9-be5b-d269241698b5" />

**Proactive Stress-Test**
<img width="1917" height="857" alt="image" src="https://github.com/user-attachments/assets/e1d374b0-9908-44f7-b108-59c3f4aa241e" />

---

## Architecture

```text
                Cascade Shield
                      |
        +-------------+-------------+
        |                           |
   React / TypeScript          Express Server
        |                           |
        |                    Optional Gemini API
        |                           |
        +-------------+-------------+
                      |
            Deterministic Engine
                      |
        +-------------+-------------+
        |             |             |
   Network Model  Cascade Logic  Interventions
        |             |             |
        +-------------+-------------+
                      |
             Simulation Results
                      |
       +--------------+--------------+
       |              |              |
    Network       Hospital          RIS
     Impact        Access
