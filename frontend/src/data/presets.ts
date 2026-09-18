import type { ModelInfo, ResearcherRole, ResearchEffort, OutputFormat, ReportLength } from '../types';

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    tag: 'High reasoning · High context',
    description: 'Flagship reasoning and multi-hop synthesis across vast source materials.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    tag: 'Fast · Lower cost',
    description: 'Rapid information retrieval, entity extraction, and web grounding.'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    tag: 'Real-time latency',
    description: 'High-throughput tool execution and rapid factual validation.'
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    tag: 'Step-by-step reasoning',
    description: 'Explicit chain of thought for counter-analysis and premise validation.'
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
    description: 'Fast lightweight processing for quick filtering passes.'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    tag: 'Open reasoning',
    description: 'Deep mathematical and algorithmic verification.'
  }
];

export const DEFAULT_RESEARCHERS: ResearcherRole[] = [
  {
    id: 'lead-researcher',
    role: 'Lead researcher',
    model: 'gemini-2.5-pro',
    instructions: 'Plans the investigation, challenges findings, and synthesizes the report.',
    enabled: true,
    capabilities: {
      webSearch: true,
      readSources: true,
      reviewPeers: true,
      codeExecution: false
    },
    advanced: {
      temperature: 0.3,
      reasoningEffort: 'high'
    }
  },
  {
    id: 'web-researcher',
    role: 'Web researcher',
    model: 'gemini-2.5-flash',
    instructions: 'Searches the web and extracts evidence from relevant sources.',
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
    role: 'Technical analyst',
    model: 'gemini-2.5-pro',
    instructions: 'Evaluates architecture, benchmarks, technical claims and trade-offs.',
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
    role: 'Fact checker',
    model: 'gemini-2.0-flash-thinking-exp',
    instructions: 'Validates claims against primary sources, identifies inconsistencies, and flags uncertainties.',
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
  }
];

export const RESEARCH_EFFORT_OPTIONS: { id: ResearchEffort; label: string; description: string }[] = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Faster investigation using fewer searches and verification passes.'
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced research, cross-checking and source coverage.'
  },
  {
    id: 'extensive',
    label: 'Extensive',
    description: 'Broader evidence gathering, deeper verification and counter-analysis.'
  }
];

export const OUTPUT_FORMAT_OPTIONS: { id: OutputFormat; label: string; description: string }[] = [
  {
    id: 'report',
    label: 'Comprehensive report',
    description: 'Thorough, structured document with executive summary, empirical analysis, and references.'
  },
  {
    id: 'executive',
    label: 'Executive briefing',
    description: 'High-density synthesis focused on core decisions, risk trade-offs, and actionable findings.'
  },
  {
    id: 'whitepaper',
    label: 'Technical whitepaper',
    description: 'Detailed system architecture, quantitative benchmarks, and implementation trade-offs.'
  },
  {
    id: 'academic',
    label: 'Academic review',
    description: 'Literature matrix with methodology review, evidentiary scrutiny, and taxonomy.'
  }
];

export const REPORT_LENGTH_OPTIONS: { id: ReportLength; label: string }[] = [
  { id: 'concise', label: 'Concise (~1,500 words)' },
  { id: 'standard', label: 'Standard (~3,500 words)' },
  { id: 'exhaustive', label: 'In-depth (~6,000+ words)' }
];
