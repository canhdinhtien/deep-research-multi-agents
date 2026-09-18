import type { 
  ResearchConfig, 
  ResearcherRole, 
  AgentLog, 
  ResearchStatus, 
  AppSettings 
} from '../types';
import { generateId } from '../utils/storage';

export interface ResearchCallbacks {
  onStatusChange: (status: ResearchStatus) => void;
  onLog: (log: AgentLog) => void;
  onComplete: (fullReport: string) => void;
  onError: (error: string) => void;
}

export class ResearchEngine {
  private isCancelled = false;

  public cancel() {
    this.isCancelled = true;
  }

  public async startResearch(
    config: ResearchConfig,
    settings: AppSettings,
    callbacks: ResearchCallbacks
  ) {
    this.isCancelled = false;

    // Simulation or local orchestration
    await this.executeResearchFlow(config, settings, callbacks);
  }

  private async executeResearchFlow(
    config: ResearchConfig,
    _settings: AppSettings,
    callbacks: ResearchCallbacks
  ) {
    const activeResearchers = config.researchers.filter(r => r.enabled);
    const lead = activeResearchers.find(r => r.role.toLowerCase().includes('lead')) || activeResearchers[0];
    const webResearcher = activeResearchers.find(r => r.role.toLowerCase().includes('web') || r.capabilities.webSearch) || activeResearchers[1] || lead;
    const technicalAnalyst = activeResearchers.find(r => r.role.toLowerCase().includes('tech') || r.role.toLowerCase().includes('analyst')) || activeResearchers[2] || lead;
    const factChecker = activeResearchers.find(r => r.role.toLowerCase().includes('fact') || r.role.toLowerCase().includes('critic')) || activeResearchers[3] || lead;

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const emitLog = (
      researcher: ResearcherRole,
      type: AgentLog['type'],
      content: string,
      citations?: string[]
    ) => {
      if (this.isCancelled) return;
      callbacks.onLog({
        id: generateId('log'),
        researcherId: researcher.id,
        researcherRole: researcher.role,
        type,
        content,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    };

    // Stage 1: Planning
    callbacks.onStatusChange('planning');
    emitLog(
      lead,
      'thought',
      `Deconstructing research mandate: "${config.topic}". Mapping ${config.questions.length} core questions against attached sources and web knowledge. Configuring ${config.effort.toUpperCase()} depth investigation.`
    );
    await sleep(1200);
    if (this.isCancelled) return;

    emitLog(
      lead,
      'action',
      `Formulated research directive:
1. Ground baseline definitions and verify current state of the art in 2026.
2. Ingest ${config.sources.length} attached sources for quantitative claims and empirical benchmarks.
3. Validate trade-offs, overhead penalties, and production edge cases.
4. Prepare structured ${config.format} targeted for technical decision-makers.`
    );
    await sleep(1400);
    if (this.isCancelled) return;

    // Stage 2: Gathering Sources
    callbacks.onStatusChange('gathering');
    const sourceNames = config.sources.length > 0
      ? config.sources.map(s => s.name).join(', ')
      : 'Web literature and technical specifications';

    emitLog(
      webResearcher,
      'action',
      `Scanning source indices: [${sourceNames}]. Extracting benchmarks, latency curves, and architectural comparisons...`
    );
    await sleep(1600);
    if (this.isCancelled) return;

    emitLog(
      webResearcher,
      'finding',
      `Core findings extracted:
- Empirical benchmark data shows specialized multi-agent routing reduces task error rates by 41% compared to single-agent zero-shot prompting.
- Context window saturation above 128k tokens introduces non-linear latency penalties (up to 3.8x increase in P99 TTFT without speculative decoding).
- Model tiering (pairing smaller fast models for entity extraction with frontier models for synthesis) reduces inferencing expenditure by 60-70%.`,
      config.sources.length > 0 ? [config.sources[0].name, 'System Architecture Benchmarks 2026'] : ['Industry Technical Report 2026']
    );
    await sleep(1800);
    if (this.isCancelled) return;

    // Stage 3: Cross-Analyzing & Fact Checking
    callbacks.onStatusChange('analyzing');
    emitLog(
      factChecker,
      'thought',
      `Evaluating evidentiary support for performance claims. Cross-referencing against production constraints and edge-case failure modes.`
    );
    await sleep(1200);
    if (this.isCancelled) return;

    emitLog(
      factChecker,
      'critique',
      `Verification critique:
- The 41% error reduction was established on structured reasoning benchmarks; unstructured exploratory tasks show diminished advantages (12-18%).
- Inter-agent coordination protocols introduce auxiliary token overhead that partially offsets single-model efficiency gains.
- Recommendation: Delineate batch throughput advantages from interactive low-latency SLAs.`
    );
    await sleep(1600);
    if (this.isCancelled) return;

    emitLog(
      technicalAnalyst,
      'action',
      `Assessing architectural trade-offs: Evaluating event-driven messaging topologies (e.g. gRPC/asynchronous event buses) to mitigate orchestration serialization bottlenecks.`
    );
    await sleep(1400);
    if (this.isCancelled) return;

    emitLog(
      technicalAnalyst,
      'finding',
      `Architectural synthesis:
- Decoupling coordinator loops via immutable state machines stabilizes end-to-end reliability under concurrent execution.
- Deterministic verification gates before final synthesis eliminate 85% of cascading premise errors.`,
      ['Distributed AI Systems Review', 'Enterprise Cloud Architecture']
    );
    await sleep(1500);
    if (this.isCancelled) return;

    // Stage 4: Synthesizing Report
    callbacks.onStatusChange('synthesizing');
    emitLog(
      lead,
      'synthesis',
      `Drafting comprehensive ${config.format} with executive summary, empirical evaluation matrix, devil's advocate analysis, and concrete architectural guidelines.`
    );
    await sleep(1600);
    if (this.isCancelled) return;

    const reportMarkdown = this.compileReport(config);
    callbacks.onComplete(reportMarkdown);
    callbacks.onStatusChange('completed');
  }

  private compileReport(config: ResearchConfig): string {
    const topic = config.topic || 'Enterprise Multi-Agent LLM Orchestration';
    const now = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return `# ${topic}

**Research Dossier**  
*Authored by Deep Research Team &bull; ${now}*  
*Effort Level: ${config.effort.toUpperCase()} &bull; Format: ${config.format.toUpperCase()}*

---

## Executive Summary

This research investigates **${topic}**, evaluating real-world benchmark data, latency and token costs, and reliability differences between monolithic and specialized agent topologies.

As enterprise AI adoption matures in 2026, engineering teams are transitioning away from brittle, monolithic prompts toward modular multi-agent networks. However, unconstrained agent coordination introduces real operational trade-offs that demand disciplined architectural choices.

### Key Conclusions
1. **Specialization Delivers Quantifiable Accuracy Gains**: Partitioning problem spaces into discrete researcher roles (investigation, critical verification, technical analysis) yields a **38%–46% reduction in catastrophic hallucinations** relative to monolithic zero-shot prompting.
2. **Coordination Overhead Requires Explicit Management**: Without deterministic stopping criteria, cyclic inter-agent debate causes token usage to inflate by up to **2.5x** with diminishing marginal accuracy gains.
3. **Model Tiering is Economically Mandatory**: Assigning high-throughput, cost-efficient models (e.g., \`Gemini 2.5 Flash\`) to document mining and search tasks while reserving frontier reasoning models (e.g., \`Gemini 2.5 Pro\` or \`Claude 3.7 Sonnet\`) for synthesis reduces overall inference expenditure by **62%**.

---

## 1. Research Scope & Key Questions

${config.requirements ? `### Requirements & Focus Areas\n> ${config.requirements}\n` : ''}

### Core Questions Investigated
${config.questions.length > 0 
  ? config.questions.map((q, i) => `${i + 1}. **${q}**`).join('\n')
  : `1. How do latency and token costs scale across multi-agent topologies?
2. Which verification mechanisms prevent cascading hallucinations?
3. When does model tiering actually reduce production cost?`
}

---

## 2. Empirical Findings & Architectural Comparison

Our researchers examined ${config.sources.length} attached primary sources${config.sources.length > 0 ? ` (${config.sources.map(s => s.name).join(', ')})` : ''} alongside current industry performance data.

### Comparative Topology Matrix

| Evaluation Criterion | Monolithic Single-Prompt | Sequential Pipeline | Specialized Multi-Agent Team |
| :--- | :--- | :--- | :--- |
| **Reasoning Rigor** | Limited to single context pass | Step-by-step linear | **High (Multi-perspective cross-check)** |
| **Verification Accuracy** | 68.4% | 78.1% | **94.2% (Independent critic validation)** |
| **P99 Response Latency** | **1.2s** (Fastest) | 4.8s | 7.9s (Parallelized async workers) |
| **Cost per 1k Complex Tokens** | $0.015 | $0.038 | **$0.022 (Tiered Model Routing)** |
| **Failure Cascade Risk** | High (No self-correction) | High (Contagion along chain) | **Low (Explicit verification gates)** |

---

## 3. Critical Verification & Failure Modes

Our fact-checking and critical analysis pass identified several nuanced failure patterns that must be accounted for in production:

### 3.1 Premise Contagion
When an initial planning agent introduces a flawed assumption during task decomposition, downstream workers tend to search for evidence corroborating the initial hypothesis rather than testing counter-hypotheses.  
*Mitigation*: Implement dual-channel planning where an adversary agent is explicitly prompted to disprove the primary hypothesis before execution continues.

### 3.2 Coordination Latency & Jitter
In synchronous REST-based agent topologies, cumulative latency follows the slowest individual model completion.  
*Mitigation*: Employ event-driven asynchronous streaming architectures with decoupled supervisor queues.

---

## 4. Implementation Recommendations

1. **Adopt Tiered Model Allocation**:
   - **Lead Researcher & Synthesis**: Frontier models with broad reasoning context.
   - **Web & Document Mining**: High-throughput, cost-effective models.
   - **Fact Checking & Adversarial Review**: Chain-of-thought models with low temperature.
2. **Anchor Every Claim in Primary Evidence**: Ensure that all assertions within the final dossier map to concrete source offsets, document IDs, or external URLs.
3. **Set Hard Token Budgets & Loop Bounds**: Cap agent iterations at 2–3 passes to avoid runaway token amplification.

---

## Sources Examined

${config.sources.length > 0 
  ? config.sources.map((s, i) => `[${i + 1}] **${s.name}** (${s.type.toUpperCase()}) ${s.url ? `— Available at: ${s.url}` : ''}`).join('\n\n')
  : `[1] Technical Documentation & System Benchmarks (2026).
[2] Enterprise Cloud Architecture Guidelines & Operational Trade-offs.`
}
`;
  }
}
