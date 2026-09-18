import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Header } from './components/Header';
import { SourcesSection } from './components/SourcesSection';
import { QuestionsSection } from './components/QuestionsSection';
import { TeamSection } from './components/TeamSection';
import { AdvancedSection } from './components/AdvancedSection';
import { AgentDrawer } from './components/AgentDrawer';
import { ResourcePreviewModal } from './components/ResourcePreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar } from './components/HistorySidebar';
import { LiveExecutionView } from './components/Execution/LiveExecutionView';
import { ReportViewer } from './components/Report/ReportViewer';

import type { 
  ResearchConfig, 
  ResearcherRole, 
  SourceItem, 
  AppSettings, 
  ResearchSession, 
  ResearchStatus, 
  AgentLog 
} from './types';
import { DEFAULT_RESEARCHERS } from './data/presets';
import { 
  loadSettings, 
  saveSettings, 
  loadSessions, 
  saveSession, 
  deleteSession,
  generateId 
} from './utils/storage';
import { ResearchEngine } from './services/researchEngine';

const INITIAL_TOPIC = 'Enterprise multi-agent LLM orchestration & production trade-offs in 2026';

const INITIAL_REQUIREMENTS = 
  'Emphasize real-world benchmark data, latency and token costs, reliability differences between monolithic and specialized agent architectures, verification strategies, and production failure modes.';

const INITIAL_QUESTIONS = [
  'How do latency and token costs scale across multi-agent topologies?',
  'Which verification mechanisms prevent cascading hallucinations?',
  'When does model tiering actually reduce production cost?'
];

const INITIAL_SOURCES: SourceItem[] = [
  {
    id: 'src-1',
    name: 'multi-agent-benchmarks-2026.pdf',
    type: 'pdf',
    size: 2400000,
    addedAt: '10:00 AM',
    content: `Empirical benchmarks comparing monolithic zero-shot prompts against modular 3-4 agent specialist teams across 1,200 multi-step engineering tasks. Multi-agent topologies demonstrated a 41.2% reduction in catastrophic premise errors, with a 2.1x increase in initial execution latency.`
  },
  {
    id: 'src-2',
    name: 'architecture-notes.md',
    type: 'markdown',
    addedAt: '10:05 AM',
    content: `Internal architecture specifications: asynchronous message passing between supervisor and worker nodes reduces cold-start blocking by 65%.`
  }
];

export const App: React.FC = () => {
  // Primary Research Configuration
  const [topic, setTopic] = useState(INITIAL_TOPIC);
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);
  const [sources, setSources] = useState<SourceItem[]>(INITIAL_SOURCES);
  const [questions, setQuestions] = useState<string[]>(INITIAL_QUESTIONS);
  const [researchers, setResearchers] = useState<ResearcherRole[]>(DEFAULT_RESEARCHERS);
  const [effort, setEffort] = useState<ResearchConfig['effort']>('standard');
  const [format, setFormat] = useState<ResearchConfig['format']>('report');
  const [reportLength, setReportLength] = useState<ResearchConfig['reportLength']>('standard');
  const [citationStyle, setCitationStyle] = useState<ResearchConfig['citationStyle']>('inline');

  // App Settings & Sessions
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [sessions, setSessions] = useState<ResearchSession[]>(loadSessions());

  // Views & Execution State
  const [activeView, setActiveView] = useState<'config' | 'progress' | 'report'>('config');
  const [status, setStatus] = useState<ResearchStatus>('idle');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingResearcher, setEditingResearcher] = useState<ResearcherRole | null>(null);
  const [previewingSource, setPreviewingSource] = useState<SourceItem | null>(null);

  const engineRef = useRef<ResearchEngine>(new ResearchEngine());

  const currentConfig: ResearchConfig = {
    topic,
    requirements,
    sources,
    questions,
    researchers,
    effort,
    format,
    reportLength,
    citationStyle
  };

  const handleStartResearch = () => {
    if (!topic.trim()) {
      alert('Please define what you want to research.');
      return;
    }

    const enabledResearchers = researchers.filter(r => r.enabled);
    if (enabledResearchers.length === 0) {
      alert('Please enable at least one researcher role.');
      return;
    }

    setLogs([]);
    setReportMarkdown('');
    setStatus('planning');
    setActiveView('progress');

    const sessionId = generateId('run');

    engineRef.current.startResearch(
      currentConfig,
      settings,
      {
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        },
        onLog: (newLog) => {
          setLogs(prev => [...prev, newLog]);
        },
        onComplete: (markdown) => {
          setReportMarkdown(markdown);
          setStatus('completed');

          const newSession: ResearchSession = {
            id: sessionId,
            topic,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            config: { ...currentConfig },
            logs,
            reportMarkdown: markdown
          };

          saveSession(newSession);
          setSessions(loadSessions());
        },
        onError: (err) => {
          setStatus('error');
          alert('Research run failed: ' + err);
        }
      }
    );
  };

  const handleCancel = () => {
    engineRef.current.cancel();
    setStatus('idle');
    setActiveView('config');
  };

  const handleNewResearch = () => {
    setTopic('');
    setRequirements('');
    setSources([]);
    setQuestions([]);
    setStatus('idle');
    setActiveView('config');
  };

  const handleSelectSession = (session: ResearchSession) => {
    setTopic(session.config.topic);
    setRequirements(session.config.requirements);
    setSources(session.config.sources);
    setQuestions(session.config.questions);
    setResearchers(session.config.researchers);
    setEffort(session.config.effort);
    setFormat(session.config.format);
    setReportMarkdown(session.reportMarkdown || '');
    setLogs(session.logs || []);
    setStatus('completed');
    setActiveView('report');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = deleteSession(sessionId);
    setSessions(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveResearcher = (updated: ResearcherRole) => {
    setResearchers(prev => {
      const exists = prev.some(r => r.id === updated.id);
      if (exists) {
        return prev.map(r => (r.id === updated.id ? updated : r));
      }
      return [...prev, updated];
    });
  };

  const handleAddResearcher = () => {
    const newRole: ResearcherRole = {
      id: generateId('role'),
      role: 'Specialist analyst',
      model: 'gemini-2.5-flash',
      instructions: 'Investigates specialized domain aspects and analyzes technical documentation.',
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
    };
    setEditingResearcher(newRole);
  };

  const enabledCount = researchers.filter(r => r.enabled).length;
  const isRunning = status !== 'idle' && status !== 'completed' && status !== 'error';

  return (
    <div className="workspace-root">
      <Header
        status={status}
        historyCount={sessions.length}
        activeView={activeView}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBackToConfig={() => setActiveView('config')}
      />

      {/* VIEW 1: Primary Configuration Flow (Centered Single-Column) */}
      {activeView === 'config' && (
        <main className="workspace-main">
          <div className="research-config-flow">
            {/* Page Title */}
            <div className="page-title-row">
              <h1 className="page-title">New research</h1>
            </div>

            {/* SECTION 1 — RESEARCH QUESTION */}
            <section className="section-block">
              <div className="form-group-prominent">
                <label className="field-label-large">
                  What do you want to research?
                </label>
                <input
                  type="text"
                  className="topic-primary-input"
                  placeholder="e.g. Enterprise multi-agent LLM orchestration & production trade-offs in 2026"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isRunning}
                  autoFocus
                />
              </div>

              <div className="form-group-sub">
                <label className="field-label-secondary">
                  What should the research cover?
                </label>
                <textarea
                  className="requirements-textarea"
                  rows={4}
                  placeholder="Detailed requirements, scope, constraints, desired benchmarks, technical comparisons..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  disabled={isRunning}
                />
              </div>
            </section>

            <hr className="section-divider" />

            {/* SECTION 2 — SOURCES */}
            <SourcesSection
              sources={sources}
              onAddSource={(s) => setSources(prev => [...prev, s])}
              onRemoveSource={(id) => setSources(prev => prev.filter(s => s.id !== id))}
              onPreviewSource={setPreviewingSource}
              disabled={isRunning}
            />

            <hr className="section-divider" />

            {/* SECTION 3 — RESEARCH QUESTIONS */}
            <QuestionsSection
              questions={questions}
              onChange={setQuestions}
              disabled={isRunning}
            />

            <hr className="section-divider" />

            {/* SECTION 4 — RESEARCH TEAM */}
            <TeamSection
              researchers={researchers}
              onChange={setResearchers}
              onEditResearcher={setEditingResearcher}
              onAddResearcher={handleAddResearcher}
              disabled={isRunning}
            />

            <hr className="section-divider" />

            {/* SECTION 5 — ADVANCED SETTINGS (Collapsed by default) */}
            <AdvancedSection
              effort={effort}
              format={format}
              reportLength={reportLength}
              citationStyle={citationStyle}
              onChangeEffort={setEffort}
              onChangeFormat={setFormat}
              onChangeReportLength={setReportLength}
              onChangeCitationStyle={setCitationStyle}
              disabled={isRunning}
            />

            <hr className="section-divider" />

            {/* PRIMARY ACTION */}
            <div className="launch-footer">
              <div className="launch-summary-meta">
                <span>{effort.charAt(0).toUpperCase() + effort.slice(1)} research</span>
                <span className="meta-dot">·</span>
                <span>{enabledCount} {enabledCount === 1 ? 'researcher' : 'researchers'}</span>
                {sources.length > 0 && (
                  <>
                    <span className="meta-dot">·</span>
                    <span>{sources.length} sources</span>
                  </>
                )}
              </div>

              <button
                type="button"
                className="btn-primary start-research-btn"
                onClick={handleStartResearch}
                disabled={isRunning || !topic.trim()}
              >
                <span>Start deep research</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 2: Clean Progress View */}
      {activeView === 'progress' && (
        <main className="workspace-main">
          <LiveExecutionView
            status={status}
            topic={topic}
            researchers={researchers}
            logs={logs}
            onCancel={handleCancel}
            onViewReport={() => setActiveView('report')}
          />
        </main>
      )}

      {/* VIEW 3: Clean Markdown Report View */}
      {activeView === 'report' && (
        <main className="workspace-main">
          <ReportViewer
            topic={topic}
            markdown={reportMarkdown}
            sources={sources}
            config={currentConfig}
            onBackToConfig={handleNewResearch}
          />
        </main>
      )}

      {/* Modals & Drawers */}
      <AgentDrawer
        agent={editingResearcher}
        isOpen={!!editingResearcher}
        onClose={() => setEditingResearcher(null)}
        onSave={handleSaveResearcher}
      />

      <ResourcePreviewModal
        source={previewingSource}
        onClose={() => setPreviewingSource(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <style>{`
        .workspace-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-app);
        }

        .workspace-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Centered single-column primary flow */
        .research-config-flow {
          width: 100%;
          max-width: 880px;
          margin: 0 auto;
          padding: 40px 24px 80px 24px;
          display: flex;
          flex-direction: column;
        }

        .page-title-row {
          margin-bottom: 28px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group-prominent {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label-large {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .topic-primary-input {
          font-size: 17px;
          font-weight: 500;
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          line-height: 1.4;
        }

        .topic-primary-input:focus {
          border-color: var(--border-focus);
        }

        .form-group-sub {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label-secondary {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .requirements-textarea {
          font-size: 14px;
          line-height: 1.6;
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          resize: vertical;
        }

        /* Launch Footer */
        .launch-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
        }

        .launch-summary-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .meta-dot {
          color: var(--border-medium);
        }

        .start-research-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .launch-footer {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          .start-research-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
