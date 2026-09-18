import React, { useState, useEffect, useRef } from 'react';
import { Square, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  { id: 'planning', label: 'Planning' },
  { id: 'gathering', label: 'Gathering sources' },
  { id: 'analyzing', label: 'Cross-analyzing' },
  { id: 'synthesizing', label: 'Synthesizing report' },
  { id: 'completed', label: 'Completed' }
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
          <h1 className="exec-topic-heading">{topic}</h1>
          <div className="exec-sub-meta">
            <span className="meta-time">{formatElapsed(elapsed)} elapsed</span>
            <span className="meta-dot">·</span>
            <span>{researchers.filter(r => r.enabled).length} researchers</span>
            <span className="meta-dot">·</span>
            <span>{logs.length} events recorded</span>
          </div>
        </div>

        <div className="exec-action">
          {!isCompleted ? (
            <button type="button" className="btn-secondary exec-btn" onClick={onCancel}>
              <Square size={13} />
              <span>Cancel run</span>
            </button>
          ) : (
            <button type="button" className="btn-primary exec-btn" onClick={onViewReport}>
              <span>View research dossier</span>
              <ArrowRight size={14} />
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
                {isPassed ? <CheckCircle2 size={12} /> : idx + 1}
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
                    ? latestLog.content.substring(0, 48) + '...'
                    : isCompleted ? 'Finished' : 'Waiting for handoff'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Stream */}
      <div className="logs-panel">
        <div className="logs-header">
          <span className="logs-title">Research stream</span>
          <div className="logs-filters">
            {(['all', 'thought', 'action', 'finding', 'critique', 'synthesis'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`log-filter-btn ${filter === f ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="logs-feed">
          {filteredLogs.length === 0 ? (
            <div className="logs-empty">Initializing research orchestration...</div>
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
          max-width: 980px;
          margin: 0 auto;
          padding: 32px 24px 64px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .exec-top-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .exec-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .exec-topic-heading {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .exec-sub-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .meta-dot {
          color: var(--border-medium);
        }

        .exec-btn {
          font-size: 13px;
          padding: 8px 14px;
        }

        /* Timeline Stepper */
        .stages-stepper {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .stage-marker {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-family: var(--font-mono);
        }

        .stage-current {
          color: var(--text-primary);
          font-weight: 500;
        }

        .stage-current .stage-marker {
          background-color: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
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
          height: 1px;
          background-color: var(--border-subtle);
          margin: 0 12px;
        }

        /* Researchers Strip */
        .researchers-strip {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }

        .researcher-status-pill {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 10px 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .status-orb {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-muted);
          margin-top: 5px;
          flex-shrink: 0;
        }

        .orb-busy {
          background-color: var(--accent);
          box-shadow: 0 0 6px var(--accent);
        }

        .pill-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pill-role {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pill-activity {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Stream logs */
        .logs-panel {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background-color: var(--bg-surface);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .logs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface-subtle);
        }

        .logs-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .logs-filters {
          display: flex;
          gap: 4px;
        }

        .log-filter-btn {
          font-size: 11px;
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .log-filter-btn:hover {
          color: var(--text-primary);
        }

        .filter-btn-active {
          background-color: var(--bg-surface-active);
          color: var(--text-primary);
          font-weight: 500;
        }

        .logs-feed {
          height: 480px;
          overflow-y: auto;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logs-empty {
          color: var(--text-muted);
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .log-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .log-row:last-child {
          border-bottom: none;
        }

        .log-left {
          width: 140px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .log-role {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .log-time {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .log-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .log-type-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          align-self: flex-start;
        }

        .tag-critique { color: var(--status-warning); }
        .tag-finding { color: var(--status-success); }
        .tag-thought { color: #a5b4fc; }
        .tag-synthesis { color: #f43f5e; }

        .log-text {
          font-size: 13px;
          line-height: 1.55;
          color: #d1d5db;
          white-space: pre-wrap;
        }

        .log-citations-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .citation-tag {
          font-size: 11px;
          color: var(--text-muted);
          background-color: var(--bg-input);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
      `}</style>
    </div>
  );
};
