/**
 * Cascade Shield - Decision-Support AI Service
 * 
 * Proxies all AI explanation requests through server-side endpoints (/api/ai/*).
 * Never exposes API keys or credentials in client-side code.
 * Provides transparent fallback to deterministic simulation summaries when AI is offline.
 */

export interface AiStatusResponse {
  configured: boolean;
  model: string;
  statusMessage: string;
}

export interface AiExplanationResponse {
  success: boolean;
  isAiGenerated: boolean;
  explanation: string;
  error?: string;
  reason?: string;
}

// Memory cache to prevent duplicate API requests for identical simulation states
const explanationCache = new Map<string, string>();

/**
 * Check if the server-side AI engine is configured and operational.
 */
export async function getAiEngineStatus(): Promise<AiStatusResponse> {
  try {
    const res = await fetch('/api/ai/status', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      configured: false,
      model: 'Deterministic Model',
      statusMessage: 'Deterministic simulation active (AI explanation offline)'
    };
  }
}

export const checkAiStatus = getAiEngineStatus;

/**
 * Explain a cascade step in plain language based strictly on deterministic simulation data.
 */
export async function fetchCascadeExplanation(params: {
  stepTitle: string;
  stepPhase?: string;
  disruptedRoads: string[];
  rippleScore: number;
  bottleneckCount: number;
  hospitalDelayMinutes: number;
  summaryBlock?: {
    initialFailure: string;
    cascadeEffect: string;
    criticalImpact: string;
  };
  fallbackText: string;
}): Promise<AiExplanationResponse> {
  const cacheKey = `cascade-${params.stepTitle}-${params.rippleScore}-${params.disruptedRoads.join(',')}`;
  if (explanationCache.has(cacheKey)) {
    return {
      success: true,
      isAiGenerated: true,
      explanation: explanationCache.get(cacheKey)!
    };
  }

  try {
    const res = await fetch('/api/ai/explain-cascade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AiExplanationResponse = await res.json();
    if (data.explanation) {
      explanationCache.set(cacheKey, data.explanation);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      isAiGenerated: false,
      explanation: params.fallbackText,
      error: err?.message
    };
  }
}

/**
 * Explain a specific corridor bottleneck.
 */
export async function fetchBottleneckExplanation(params: {
  roadName: string;
  vToCRatio: number;
  delayIncrease: number;
  addedDivertedVolume: number;
  failedRoadName?: string;
  fallbackText: string;
}): Promise<AiExplanationResponse> {
  const cacheKey = `bottleneck-${params.roadName}-${params.vToCRatio}`;
  if (explanationCache.has(cacheKey)) {
    return {
      success: true,
      isAiGenerated: true,
      explanation: explanationCache.get(cacheKey)!
    };
  }

  try {
    const res = await fetch('/api/ai/explain-bottleneck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AiExplanationResponse = await res.json();
    if (data.explanation) {
      explanationCache.set(cacheKey, data.explanation);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      isAiGenerated: false,
      explanation: params.fallbackText,
      error: err?.message
    };
  }
}

/**
 * Fetch hospital trauma accessibility medical brief.
 */
export async function fetchHospitalBrief(params: {
  hospitalName: string;
  baselineLatency: number;
  currentLatency: number;
  delayMinutes: number;
  severedRoutes: string[];
  affectedPopulation: number;
  fallbackText: string;
}): Promise<AiExplanationResponse> {
  const cacheKey = `hosp-${params.hospitalName}-${params.currentLatency}`;
  if (explanationCache.has(cacheKey)) {
    return {
      success: true,
      isAiGenerated: true,
      explanation: explanationCache.get(cacheKey)!
    };
  }

  try {
    const res = await fetch('/api/ai/hospital-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AiExplanationResponse = await res.json();
    if (data.explanation) {
      explanationCache.set(cacheKey, data.explanation);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      isAiGenerated: false,
      explanation: params.fallbackText,
      error: err?.message
    };
  }
}

/**
 * Fetch multi-corridor cascade synthesis.
 */
export async function fetchMultiCorridorExplanation(params: {
  scenarioName: string;
  failedCorridors: string[];
  displacedVolumeVph: number;
  rippleScore: number;
  secondaryBottlenecks: number;
  hospitalImpact: string;
  comparedScenarios?: any[];
  fallbackText: string;
}): Promise<AiExplanationResponse> {
  const cacheKey = `multi-${params.scenarioName}-${params.failedCorridors.join(',')}`;
  if (explanationCache.has(cacheKey)) {
    return {
      success: true,
      isAiGenerated: true,
      explanation: explanationCache.get(cacheKey)!
    };
  }

  try {
    const res = await fetch('/api/ai/explain-multi-corridor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AiExplanationResponse = await res.json();
    if (data.explanation) {
      explanationCache.set(cacheKey, data.explanation);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      isAiGenerated: false,
      explanation: params.fallbackText,
      error: err?.message
    };
  }
}

/**
 * Compare active intervention options.
 */
export async function fetchInterventionComparison(params: {
  activeInterventions: any[];
  availableBudget: number;
  remainingBudget: number;
  currentRippleScore: number;
  fallbackText: string;
}): Promise<AiExplanationResponse> {
  const cacheKey = `int-${params.activeInterventions.map(i => i.id).join(',')}-${params.currentRippleScore}`;
  if (explanationCache.has(cacheKey)) {
    return {
      success: true,
      isAiGenerated: true,
      explanation: explanationCache.get(cacheKey)!
    };
  }

  try {
    const res = await fetch('/api/ai/compare-interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AiExplanationResponse = await res.json();
    if (data.explanation) {
      explanationCache.set(cacheKey, data.explanation);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      isAiGenerated: false,
      explanation: params.fallbackText,
      error: err?.message
    };
  }
}
