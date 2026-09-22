import type { ModelInfo, ResearcherRole, ResearchEffort, OutputFormat, ReportLength } from '../types';

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    tag: 'High reasoning · 1M+ context',
    description: 'Flagship reasoning, deep multi-hop synthesis, and knowledge graph mapping across vast source materials.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    tag: 'Fast · Low latency',
    description: 'Rapid information retrieval, entity extraction, and broad web grounding.'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    tag: 'Real-time throughput',
    description: 'High-throughput tool execution and rapid factual validation.'
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    tag: 'Explicit Chain of Thought',
    description: 'Deep deductive verification, counter-argument analysis, and claim scrutiny.'
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    tag: 'Hybrid reasoning',
    description: 'Exceptional structural clarity, technical nuance, and balanced critique.'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tag: 'High general reasoning',
    description: 'Reliable general-purpose analysis and structured reporting.'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    tag: 'Economical',
    description: 'Lightweight processing for quick filtering passes.'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    tag: 'Open reasoning',
    description: 'Deep algorithmic and mathematical verification.'
  }
];

export const DEFAULT_RESEARCHERS: ResearcherRole[] = [
  {
    id: 'lead-researcher',
    role: 'Lead Strategist',
    model: 'gemini-2.5-pro',
    instructions: 'Plans the research trajectory, decomposes criteria, directs specialist agents, and synthesizes the dossier.',
    enabled: true,
    capabilities: {
      webSearch: true,
      readSources: true,
      reviewPeers: true,
      codeExecution: false
    },
    advanced: {
      temperature: 0.25,
      reasoningEffort: 'high'
    }
  },
  {
    id: 'web-researcher',
    role: 'Web & Source Explorer',
    model: 'gemini-2.5-flash',
    instructions: 'Conducts targeted searches, ingests attached documents, and extracts verified empirical findings.',
    enabled: true,
    capabilities: {
      webSearch: true,
      readSources: true,
      reviewPeers: false,
      codeExecution: false
    },
    advanced: {
      temperature: 0.2,
      reasoningEffort: 'medium'
    }
  },
  {
    id: 'technical-analyst',
    role: 'Deep Technical Analyst',
    model: 'gemini-2.5-pro',
    instructions: 'Analyzes system architecture, quantitative benchmarks, trade-offs, and operational limitations.',
    enabled: true,
    capabilities: {
      webSearch: true,
      readSources: true,
      reviewPeers: true,
      codeExecution: true
    },
    advanced: {
      temperature: 0.2,
      reasoningEffort: 'high'
    }
  },
  {
    id: 'fact-checker',
    role: 'Fact Checker & Critic',
    model: 'gemini-2.0-flash-thinking-exp',
    instructions: 'Cross-examines claims against primary sources, identifies inconsistencies, and prevents AI hallucinations.',
    enabled: true,
    capabilities: {
      webSearch: true,
      readSources: true,
      reviewPeers: true,
      codeExecution: false
    },
    advanced: {
      temperature: 0.1,
      reasoningEffort: 'high'
    }
  },
  {
    id: 'obsidian-architect',
    role: 'Obsidian Knowledge Architect',
    model: 'gemini-2.5-pro',
    instructions: 'Structures concepts into hierarchical notes, establishes bidirectional [[wikilinks]], and generates a cohesive Obsidian Vault.',
    enabled: true,
    capabilities: {
      webSearch: false,
      readSources: true,
      reviewPeers: true,
      codeExecution: false
    },
    advanced: {
      temperature: 0.2,
      reasoningEffort: 'high'
    }
  }
];

export const RESEARCH_EFFORT_OPTIONS: { id: ResearchEffort; label: string; description: string }[] = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Fast investigation covering key definitions, primary sources, and high-level synthesis.'
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced depth with multi-source validation, architectural comparisons, and full Obsidian tree.'
  },
  {
    id: 'extensive',
    label: 'Extensive',
    description: 'Exhaustive exploration with adversarial critique, deep empirical analysis, and rich cross-links.'
  }
];

export const OUTPUT_FORMAT_OPTIONS: { id: OutputFormat; label: string; description: string }[] = [
  {
    id: 'report',
    label: 'Comprehensive Report + Obsidian Vault',
    description: 'Complete structured dossier with executive summary, empirical evaluation matrix, and interconnected Obsidian notes.'
  },
  {
    id: 'executive',
    label: 'Executive Briefing',
    description: 'High-density synthesis focused on core strategic decisions, risk trade-offs, and actionable findings.'
  },
  {
    id: 'whitepaper',
    label: 'Technical Whitepaper',
    description: 'Detailed system architectures, benchmark comparisons, and practical deployment guidelines.'
  },
  {
    id: 'academic',
    label: 'Academic Review',
    description: 'Literature matrix with methodology scrutiny, theoretical taxonomy, and evidentiary citations.'
  }
];

export const REPORT_LENGTH_OPTIONS: { id: ReportLength; label: string }[] = [
  { id: 'concise', label: 'Concise (~1,500 words)' },
  { id: 'standard', label: 'Standard (~3,500 words)' },
  { id: 'exhaustive', label: 'Exhaustive (~6,000+ words)' }
];
