import React from 'react';
import { X, Trash2, ArrowRight, Clock } from 'lucide-react';
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
          <div className="drawer-title-group">
            <span className="drawer-title">Lịch sử nghiên cứu</span>
            <span className="drawer-subtitle">{sessions.length} phiên đã lưu</span>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-empty">
              <Clock size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <span>Chưa có phiên nghiên cứu nào được lưu.</span>
            </div>
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
                    title="Xóa phiên này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="history-item-meta">
                  <span>{session.createdAt}</span>
                  <span className="meta-dot">·</span>
                  <span>{session.config.sources.length} tài liệu</span>
                  <span className="meta-dot">·</span>
                  <span>{session.config.researchers.filter(r => r.enabled).length} tác tử</span>
                  <ArrowRight size={14} className="history-arrow" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .drawer-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-surface-subtle);
        }

        .drawer-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drawer-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .drawer-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .history-list {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex: 1;
        }

        .history-empty {
          color: var(--text-muted);
          font-size: 15px;
          text-align: center;
          padding: 48px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .history-item {
          padding: 16px 18px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .history-item:hover {
          border-color: var(--accent);
          background-color: var(--bg-surface-hover);
          transform: translateX(-2px);
        }

        .history-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .history-topic {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .history-delete-btn {
          color: var(--text-muted);
          padding: 5px;
          border-radius: var(--radius-sm);
        }

        .history-delete-btn:hover {
          color: var(--status-danger);
          background-color: rgba(239, 68, 68, 0.15);
        }

        .history-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .history-arrow {
          margin-left: auto;
          color: var(--accent);
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
