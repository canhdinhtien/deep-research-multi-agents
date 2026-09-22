import React, { useState, useEffect, useRef } from 'react';
import { Square, ArrowRight, CheckCircle2, Clock, Activity, Sparkles, BrainCircuit } from 'lucide-react';
import type { ResearcherRole, AgentLog, ResearchStatus, LogType } from '../../types';

interface LiveExecutionViewProps {
  status: ResearchStatus;
  topic: string;
  researchers: ResearcherRole[];
  logs: AgentLog[];
  onCancel: () => void;
  onViewReport: () => void;
}

const STAGES: { id: ResearchStatus; label: string }[] = [
  { id: 'planning', label: '1. Planning' },
  { id: 'gathering', label: '2. Gathering Sources' },
  { id: 'analyzing', label: '3. Deep Analysis & Scrutiny' },
  { id: 'synthesizing', label: '4. Obsidian Knowledge Synthesis' },
  { id: 'completed', label: '5. Completed' }
];

export const LiveExecutionView: React.FC<LiveExecutionViewProps> = ({
  status,
  topic,
  researchers,
  logs,
  onCancel,
  onViewReport
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [filter, setFilter] = useState<LogType | 'all'>('all');
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'completed' || status === 'error' || status === 'idle') return;
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredLogs = logs.filter(l => (filter === 'all' ? true : l.type === filter));

  const isCompleted = status === 'completed';

  const getStageIndex = (s: ResearchStatus) => {
    return STAGES.findIndex(item => item.id === s);
  };

  const currentStageIdx = getStageIndex(status);

  return (
    <div className="execution-layout">
      {/* Top Bar */}
      <div className="exec-top-bar">
        <div className="exec-meta">
          <div className="exec-badge-row">
            <span className="live-pulse-badge">
              <span className="live-dot" />
              <span>Multi-Agent Research Stream</span>
            </span>
          </div>
          <h1 className="exec-topic-heading">{topic}</h1>
          <div className="exec-sub-meta">
            <span className="meta-time">
              <Clock size={15} />
              <span>{formatElapsed(elapsed)} elapsed</span>
            </span>
            <span className="meta-dot">·</span>
            <span>{researchers.filter(r => r.enabled).length} agents active</span>
            <span className="meta-dot">·</span>
            <span>{logs.length} events recorded</span>
          </div>
        </div>

        <div className="exec-action">
          {!isCompleted ? (
            <button type="button" className="btn-secondary exec-btn" onClick={onCancel}>
              <Square size={15} />
              <span>Cancel Run</span>
            </button>
          ) : (
            <button type="button" className="btn-primary exec-btn" onClick={onViewReport}>
              <Sparkles size={16} />
              <span>View Knowledge Tree & Report</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Clean Timeline Stepper */}
      <div className="stages-stepper">
        {STAGES.map((stage, idx) => {
          const isPassed = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;

          return (
            <div
              key={stage.id}
              className={`stage-item ${isCurrent ? 'stage-current' : ''} ${isPassed ? 'stage-passed' : ''}`}
            >
              <div className="stage-marker">
                {isPassed ? <CheckCircle2 size={15} /> : idx + 1}
              </div>
              <span className="stage-label">{stage.label}</span>
              {idx < STAGES.length - 1 && <div className="stage-connector" />}
            </div>
          );
        })}
      </div>

      {/* Active Researchers Status Strip */}
      <div className="researchers-strip">
        {researchers.filter(r => r.enabled).map((r) => {
          const latestLog = logs.slice().reverse().find(l => l.researcherRole === r.role);
          const isWorking = !isCompleted && latestLog;

          return (
            <div key={r.id} className="researcher-status-pill">
              <span className={`status-orb ${isWorking ? 'orb-busy' : ''}`} />
              <div className="pill-content">
                <span className="pill-role">{r.role}</span>
                <span className="pill-activity">
                  {isWorking
                    ? latestLog.content.substring(0, 56) + '...'
                    : isCompleted ? 'Task completed' : 'Waiting for handoff'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Stream */}
      <div className="logs-panel">
        <div className="logs-header">
          <div className="logs-title-wrap">
            <Activity size={16} className="logs-icon" />
            <span className="logs-title">Live Agent Activity Stream</span>
          </div>
          <div className="logs-filters">
            {[
              { id: 'all', label: 'All' },
              { id: 'thought', label: 'Thought' },
              { id: 'action', label: 'Action' },
              { id: 'finding', label: 'Finding' },
              { id: 'critique', label: 'Critique' },
              { id: 'synthesis', label: 'Synthesis' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`log-filter-btn ${filter === f.id ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter(f.id as any)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="logs-feed">
          {filteredLogs.length === 0 ? (
            <div className="logs-empty">
              <BrainCircuit size={28} className="empty-spinner" />
              <span>Initializing multi-agent research stream...</span>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="log-row">
                <div className="log-left">
                  <span className="log-role">{log.researcherRole}</span>
                  <span className="log-time">{log.timestamp}</span>
                </div>
                <div className="log-body">
                  <span className={`log-type-tag tag-${log.type}`}>{log.type}</span>
                  <div className="log-text">{log.content}</div>
                  {log.citations && log.citations.length > 0 && (
                    <div className="log-citations-list">
                      {log.citations.map((c, i) => (
                        <span key={i} className="citation-tag">[{i + 1}] {c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={feedEndRef} />
        </div>
      </div>

      <style>{`
        .execution-layout {
          max-width: 1080px;
          margin: 0 auto;
          padding: 36px 24px 80px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .exec-top-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .exec-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .exec-badge-row {
          display: flex;
          align-items: center;
        }

        .live-pulse-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent);
          background-color: var(--accent-subtle);
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid var(--accent-border);
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 6px var(--accent);
        }

        .exec-topic-heading {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .exec-sub-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .meta-time {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .meta-dot {
          color: var(--border-medium);
        }

        .exec-btn {
          font-size: 14.5px;
          padding: 10px 18px;
          flex-shrink: 0;
        }

        /* Timeline Stepper */
        .stages-stepper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow-x: auto;
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 14px;
          white-space: nowrap;
        }

        .stage-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .stage-current {
          color: var(--text-primary);
          font-weight: 700;
        }

        .stage-current .stage-marker {
          background-color: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .stage-passed {
          color: var(--text-secondary);
        }

        .stage-passed .stage-marker {
          color: var(--status-success);
          border-color: var(--status-success);
        }

        .stage-connector {
          width: 32px;
          height: 2px;
          background-color: var(--border-subtle);
          margin: 0 12px;
        }

        /* Researchers Strip */
        .researchers-strip {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }

        .researcher-status-pill {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .status-orb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-muted);
          margin-top: 5px;
          flex-shrink: 0;
        }

        .orb-busy {
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .pill-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .pill-role {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .pill-activity {
          font-size: 12.5px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Stream logs */
        .logs-panel {
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          background-color: var(--bg-surface);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .logs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-medium);
          background-color: var(--bg-surface-subtle);
          gap: 14px;
          flex-wrap: wrap;
        }

        .logs-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logs-icon {
          color: var(--accent);
        }

        .logs-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .logs-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .log-filter-btn {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }

        .log-filter-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        .filter-btn-active {
          background-color: var(--accent);
          color: #ffffff !important;
          font-weight: 600;
        }

        .logs-feed {
          height: 520px;
          overflow-y: auto;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .logs-empty {
          color: var(--text-muted);
          font-size: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
        }

        .empty-spinner {
          color: var(--accent);
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .log-row {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .log-row:last-child {
          border-bottom: none;
        }

        .log-left {
          width: 170px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .log-role {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .log-time {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .log-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .log-type-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          align-self: flex-start;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface-subtle);
        }

        .tag-critique { color: #f59e0b; background-color: rgba(245, 158, 11, 0.12); }
        .tag-finding { color: #10b981; background-color: rgba(16, 185, 129, 0.12); }
        .tag-thought { color: #a5b4fc; background-color: rgba(165, 180, 252, 0.12); }
        .tag-synthesis { color: #f43f5e; background-color: rgba(244, 63, 94, 0.12); }

        .log-text {
          font-size: 15px;
          line-height: 1.65;
          color: #e2e8f0;
          white-space: pre-wrap;
        }

        .log-citations-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }

        .citation-tag {
          font-size: 12.5px;
          color: var(--text-secondary);
          background-color: var(--bg-input);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-medium);
        }
      `}</style>
    </div>
  );
};
