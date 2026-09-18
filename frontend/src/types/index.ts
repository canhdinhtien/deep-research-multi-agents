export interface ResearcherCapabilities {
  webSearch: boolean;
  readSources: boolean;
  reviewPeers: boolean;
  codeExecution: boolean;
}

export interface ResearcherAdvanced {
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface ResearcherRole {
  id: string;
  role: string;
  model: string;
  instructions: string;
  enabled: boolean;
  capabilities: ResearcherCapabilities;
  advanced?: ResearcherAdvanced;
}

export type SourceType = 'pdf' | 'docx' | 'markdown' | 'text' | 'web';

export interface SourceItem {
  id: string;
  name: string;
  type: SourceType;
  size?: number;
  url?: string;
  content?: string;
  addedAt: string;
}

export type ResearchEffort = 'quick' | 'standard' | 'extensive';
export type OutputFormat = 'report' | 'executive' | 'whitepaper' | 'academic';
export type ReportLength = 'concise' | 'standard' | 'exhaustive';
export type CitationStyle = 'inline' | 'footnote' | 'bibliography';

export interface ResearchConfig {
  topic: string;
  requirements: string;
  sources: SourceItem[];
  questions: string[];
  researchers: ResearcherRole[];
  effort: ResearchEffort;
  format: OutputFormat;
  reportLength: ReportLength;
  citationStyle: CitationStyle;
}

export type LogType = 'thought' | 'action' | 'finding' | 'critique' | 'synthesis';
export type ResearchStatus = 'idle' | 'planning' | 'gathering' | 'analyzing' | 'synthesizing' | 'completed' | 'error';

export interface AgentLog {
  id: string;
  researcherId: string;
  researcherRole: string;
  type: LogType;
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface ResearchSession {
  id: string;
  topic: string;
  createdAt: string;
  status: ResearchStatus;
  config: ResearchConfig;
  logs: AgentLog[];
  reportMarkdown?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Local';
  tag: string;
  description: string;
}

export interface AppSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  customBaseUrl: string;
  isSimulationMode: boolean;
}
