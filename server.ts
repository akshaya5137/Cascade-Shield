import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialization of Gemini client using server-side environment variable only
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // In-memory cache to reduce API calls and prevent redundant model load
  const aiCache = new Map<string, string>();
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to generate content with graceful model fallback and 503 retry handling
  async function generateContentWithFallback(ai: GoogleGenAI, prompt: string): Promise<string | null> {
    const cached = aiCache.get(prompt);
    if (cached) {
      return cached;
    }

    // Models ordered from primary to resilient fallbacks per gemini-api guidelines
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

    for (const model of modelsToTry) {
      // Allow up to 2 attempts for transient 503 high-demand spikes
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });
          const text = response.text?.trim();
          if (text) {
            aiCache.set(prompt, text);
            return text;
          }
        } catch (err: any) {
          const status = err?.status || err?.code || (err?.error && err.error.code);
          const isHighDemand = status === 503 || status === 'UNAVAILABLE' || (err?.message && String(err.message).includes('high demand'));

          // If high demand spike on attempt 0, wait briefly and retry or advance to next model
          if (isHighDemand && attempt === 0) {
            await sleep(350);
            continue;
          }
          // Advance to next fallback model
          break;
        }
      }
    }

    return null;
  }

  // AI Configuration Status Endpoint (Returns safe boolean flag, NEVER exposes secret keys)
  app.get("/api/ai/status", (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    res.json({
      configured: hasKey,
      model: "gemini-3.8-flash (with resilient fallback: gemini-3.1-flash-lite)",
      statusMessage: hasKey
        ? "Gemini Decision-Support Engine Connected"
        : "Deterministic simulation active (AI explanation in fallback mode)"
    });
  });

  // 1. Plain-Language Cascade Failure Explanation
  app.post("/api/ai/explain-cascade", async (req, res) => {
    try {
      const { stepTitle, stepPhase, disruptedRoads, rippleScore, bottleneckCount, hospitalDelayMinutes, summaryBlock } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: summaryBlock?.cascadeEffect || "Stormwater inundation at Central Silk Board underpass forces heavy traffic redistribution across Outer Ring Road and HSR Layout arterials, saturating secondary nodes.",
          reason: "API_KEY_NOT_CONFIGURED"
        });
      }

      const prompt = `You are the AI Decision-Support Intelligence module for Cascade Shield, an urban infrastructure resilience platform for Bengaluru, India.

Context from deterministic simulation:
- Phase: "${stepTitle || 'Cascade Phase'}" (${stepPhase || 'SIMULATION'})
- Primary Disrupted Corridors: ${(disruptedRoads || []).join(', ') || 'Central Silk Board Underpass'}
- Deterministic Ripple Impact Score: ${rippleScore || 0}/100
- Active Secondary Bottlenecks: ${bottleneckCount || 0}
- St. John's Hospital Delay Latency: +${hospitalDelayMinutes || 0} minutes
- Initial Disruption: ${summaryBlock?.initialFailure || 'Submerged underpass due to 110mm cloudburst'}
- Observed Network Effect: ${summaryBlock?.cascadeEffect || 'Spillback across arterial corridors'}

Provide a clear, plain-language decision-support explanation (2 to 3 concise sentences maximum).
Explain:
1. Why this cascade happened based on the physical flow bottleneck.
2. The specific secondary pressure on alternative corridors.
3. The direct emergency accessibility impact on St. John's Hospital.

Rules:
- Keep the language professional, operational, and objective.
- Do NOT hallucinate unverified data. Base strictly on the provided simulation parameters.
- Do NOT claim to be predicting real-time live events.`;

      const text = await generateContentWithFallback(ai, prompt);

      if (text) {
        return res.json({
          success: true,
          isAiGenerated: true,
          explanation: text
        });
      } else {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: summaryBlock?.cascadeEffect || "Stormwater inundation at key corridors triggers rapid queue spillbacks into arterial bypass routes.",
          reason: "MODEL_HIGH_DEMAND_FALLBACK"
        });
      }
    } catch {
      return res.json({
        success: false,
        isAiGenerated: false,
        explanation: req.body.summaryBlock?.cascadeEffect || "Stormwater inundation at key corridors triggers rapid queue spillbacks into arterial bypass routes.",
        reason: "SIMULATION_FALLBACK"
      });
    }
  });

  // 2. Corridor Bottleneck Specific Explanation
  app.post("/api/ai/explain-bottleneck", async (req, res) => {
    try {
      const { roadName, vToCRatio, delayIncrease, addedDivertedVolume, failedRoadName } = req.body;
      const fallbackText = `${roadName || 'Corridor'} absorbed ${addedDivertedVolume || 0} vph of diverted traffic from ${failedRoadName || 'disrupted sections'}, reaching ${((vToCRatio || 0.85) * 100).toFixed(0)}% capacity with +${delayIncrease || 20}% delay.`;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "API_KEY_NOT_CONFIGURED"
        });
      }

      const prompt = `You are an urban traffic resilience analyst for Cascade Shield.
Corridor Analyzed: "${roadName}"
Volume-to-Capacity Ratio: ${vToCRatio}
Calculated Delay Increase: +${delayIncrease}%
Displaced Diverted Flow Absorbed: ${addedDivertedVolume} vehicles/hour
Trigger Disruption Source: ${failedRoadName || 'Central Silk Board Underpass'}

In 2 concise sentences, explain in plain language why this specific corridor is choking, how the diversion created this bottleneck, and what immediate queue spillback is occurring. Base strictly on provided numbers.`;

      const text = await generateContentWithFallback(ai, prompt);

      if (text) {
        return res.json({
          success: true,
          isAiGenerated: true,
          explanation: text
        });
      } else {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "MODEL_HIGH_DEMAND_FALLBACK"
        });
      }
    } catch {
      return res.json({
        success: false,
        isAiGenerated: false,
        explanation: `${req.body.roadName || 'Corridor'} is experiencing severe volume-capacity saturation due to redirected traffic.`,
        reason: "SIMULATION_FALLBACK"
      });
    }
  });

  // 3. Hospital Accessibility & Golden-Hour Impact Brief
  app.post("/api/ai/hospital-brief", async (req, res) => {
    try {
      const { hospitalName, baselineLatency, currentLatency, delayMinutes, severedRoutes, affectedPopulation } = req.body;
      const fallbackText = `Ambulance transit to ${hospitalName || "St. John's Hospital"} escalated from ${baselineLatency || 12} min to ${currentLatency || 38} min (+${delayMinutes || 26} min delay). Severed routes include ${(severedRoutes || []).join(', ') || 'Silk Board Underpass'}, jeopardizing the 12-minute trauma golden window for ~${affectedPopulation?.toLocaleString() || '184,500'} residents.`;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "API_KEY_NOT_CONFIGURED"
        });
      }

      const prompt = `You are the Emergency Medical Services (EMS) coordinator evaluating disaster cascade metrics for Cascade Shield.
Hospital Facility: ${hospitalName || "St. John's Medical College Hospital"}
Baseline Access Latency: ${baselineLatency} minutes
Current Post-Disruption Latency: ${currentLatency} minutes (+${delayMinutes} min delay)
Severed Access Links: ${(severedRoutes || []).join(', ') || 'Central Silk Board Underpass'}
Impacted Catchment Population: ${affectedPopulation?.toLocaleString() || '184,500'} residents

Generate a 2-sentence medical response brief explaining the clinical urgency of this delay (golden-hour window breach) and actionable routing insight. Base strictly on provided numbers.`;

      const text = await generateContentWithFallback(ai, prompt);

      if (text) {
        return res.json({
          success: true,
          isAiGenerated: true,
          explanation: text
        });
      } else {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "MODEL_HIGH_DEMAND_FALLBACK"
        });
      }
    } catch {
      return res.json({
        success: false,
        isAiGenerated: false,
        explanation: `Emergency access to ${req.body.hospitalName || "St. John's Hospital"} has reached critical delay thresholds.`,
        reason: "SIMULATION_FALLBACK"
      });
    }
  });

  // 4. Intervention Strategy Trade-off Assessment
  app.post("/api/ai/compare-interventions", async (req, res) => {
    try {
      const { activeInterventions, availableBudget, remainingBudget, currentRippleScore } = req.body;
      const fallbackText = `Current active interventions utilize ${(availableBudget || 100) - (remainingBudget || 35)} of ${availableBudget || 100} budget units. Targeted dewatering and dynamic bypass gates provide the highest ripple reduction per unit.`;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "API_KEY_NOT_CONFIGURED"
        });
      }

      const prompt = `You are the Infrastructure Disaster Command Advisor for Cascade Shield.
Emergency Budget: ${availableBudget} units total (${remainingBudget} remaining).
Network Ripple Score: ${currentRippleScore}/100.
Deployed Interventions:
${(activeInterventions || []).map((i: any) => `- ${i.name} (Cost: ${i.costUnits} units, Impact Reduction: -${i.impactReductionPercent}%, Targets: ${i.targetRoadIds?.join(', ')})`).join('\n') || 'None currently deployed.'}

In 2 to 3 sentences, provide an executive appraisal of the intervention trade-offs: evaluating whether current deployments adequately protect the hospital corridor and which remaining intervention yields optimal resilience return on budget. Base strictly on provided parameters.`;

      const text = await generateContentWithFallback(ai, prompt);

      if (text) {
        return res.json({
          success: true,
          isAiGenerated: true,
          explanation: text
        });
      } else {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "MODEL_HIGH_DEMAND_FALLBACK"
        });
      }
    } catch {
      return res.json({
        success: false,
        isAiGenerated: false,
        explanation: "Intervention strategy assessment active under deterministic simulation metrics.",
        reason: "SIMULATION_FALLBACK"
      });
    }
  });

  // 5. Multi-Corridor Cascade Synthesis & Trade-off Analysis
  app.post("/api/ai/explain-multi-corridor", async (req, res) => {
    try {
      const { scenarioName, failedCorridors, displacedVolumeVph, rippleScore, secondaryBottlenecks, hospitalImpact, comparedScenarios } = req.body;
      const fallbackText = `${scenarioName || 'Multi-corridor disruption'} displaces ${displacedVolumeVph?.toLocaleString() || '3,100'} vph across parallel arterials, generating ${secondaryBottlenecks || 3} secondary bottlenecks with Ripple Score ${rippleScore || 86}/100. ${hospitalImpact || "Hospital access is significantly degraded."}`;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "API_KEY_NOT_CONFIGURED"
        });
      }

      const prompt = `You are the Urban Network Resilience Director analyzing multi-corridor cascade trade-offs for Cascade Shield (Bengaluru, India).

Simulation Data:
- Active Scenario: ${scenarioName || 'Multi-Corridor Cascade'}
- Disrupted Corridors: ${(failedCorridors || []).join(', ') || 'Central Silk Board Underpass'}
- Total Displaced Arterial Flow: ${displacedVolumeVph?.toLocaleString() || 3100} vehicles/hour
- Deterministic Ripple Impact Score: ${rippleScore}/100
- Secondary Chokepoint Junctions: ${secondaryBottlenecks}
- Critical Trauma Access Impact: ${hospitalImpact || 'St. John’s Hospital access delayed'}
${comparedScenarios ? `- Comparison Context: ${JSON.stringify(comparedScenarios)}` : ''}

In 2 to 3 concise, highly readable sentences:
1. Explain why this specific combination of corridor disruptions creates compound strain rather than an isolated delay.
2. State clearly which detour corridor experiences the highest risk of secondary failure.
3. Provide a crisp tactical conclusion for traffic management control.
Rules: Base strictly on provided simulation numbers. Do not invent unverified metrics.`;

      const text = await generateContentWithFallback(ai, prompt);

      if (text) {
        return res.json({
          success: true,
          isAiGenerated: true,
          explanation: text
        });
      } else {
        return res.json({
          success: false,
          isAiGenerated: false,
          explanation: fallbackText,
          reason: "MODEL_HIGH_DEMAND_FALLBACK"
        });
      }
    } catch {
      return res.json({
        success: false,
        isAiGenerated: false,
        explanation: `${req.body.scenarioName || 'This scenario'} creates substantial systemic strain across alternative Bengaluru routes.`,
        reason: "SIMULATION_FALLBACK"
      });
    }
  });

  // Liveness and health check probes (Cloud Run / load balancers)
  app.get(["/health", "/api/health"], (_req, res) => {
    res.json({
      status: "ok",
      app: "Cascade Shield Server",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware setup (development vs production)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Robust resolution of dist directory across production working directories
    const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    const candidatePaths = [
      path.resolve(process.cwd(), 'dist'),
      path.resolve('/app/applet/dist'),
      path.resolve(process.cwd(), 'applet', 'dist'),
      path.resolve(currentDir, '.'),
      path.resolve(currentDir, 'dist')
    ];
    const distPath = candidatePaths.find(candidate => fs.existsSync(path.join(candidate, 'index.html'))) || path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("<!DOCTYPE html><html><head><title>CASCADE SHIELD</title></head><body><div id='root'></div><script>location.reload();</script></body></html>");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CASCADE SHIELD] Full-stack application running on port ${PORT}`);
  });
}

startServer();
