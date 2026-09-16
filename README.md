<div align="center">

<img width="1200" height="475" alt="Cascade Shield Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

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

```text
                ┌──────────────────────┐
                │   Failure Scenario   │
                └──────────┬───────────┘
                           ↓
                ┌──────────────────────┐
                │ Flow Redistribution  │
                └──────────┬───────────┘
                           ↓
                ┌──────────────────────┐
                │   Secondary Stress   │
                └──────────┬───────────┘
                           ↓
                ┌──────────────────────┐
                │ Critical Access      │
                │ Impact               │
                └──────────┬───────────┘
                           ↓
                ┌──────────────────────┐
                │ Intervention Engine  │
                └──────────┬───────────┘
                           ↓
                ┌──────────────────────┐
                │ Before vs. After     │
                └──────────────────────┘