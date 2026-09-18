import React from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';
import type { ResearchSession } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ResearchSession[];
  onSelectSession: (session: ResearchSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <span className="drawer-title">Research history</span>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-empty">No previous research runs recorded yet.</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="history-item"
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
              >
                <div className="history-item-top">
                  <span className="history-topic" title={session.topic}>
                    {session.topic}
                  </span>
                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="history-item-meta">
                  <span>{session.createdAt}</span>
                  <span className="meta-dot">·</span>
                  <span>{session.config.sources.length} sources</span>
                  <span className="meta-dot">·</span>
                  <span>{session.config.researchers.filter(r => r.enabled).length} researchers</span>
                  <ArrowRight size={12} className="history-arrow" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .history-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          flex: 1;
        }

        .history-empty {
          color: var(--text-muted);
          font-size: 13px;
          text-align: center;
          padding: 32px 16px;
        }

        .history-item {
          padding: 12px 14px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .history-item:hover {
          border-color: var(--border-medium);
          background-color: var(--bg-surface-hover);
        }

        .history-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .history-topic {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .history-delete-btn {
          color: var(--text-muted);
          padding: 3px;
          border-radius: var(--radius-sm);
        }

        .history-delete-btn:hover {
          color: var(--status-danger);
        }

        .history-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .history-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .history-item:hover .history-arrow {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
