import React from 'react';
import { History, Settings, ArrowLeft } from 'lucide-react';
import type { ResearchStatus } from '../types';

interface HeaderProps {
  status: ResearchStatus;
  historyCount: number;
  activeView: 'config' | 'progress' | 'report';
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onBackToConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  historyCount,
  activeView,
  onOpenHistory,
  onOpenSettings,
  onBackToConfig
}) => {
  const isRunning = status !== 'idle' && status !== 'completed' && status !== 'error';

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          {activeView !== 'config' && (
            <button
              type="button"
              className="btn-ghost back-nav-btn"
              onClick={onBackToConfig}
              title="Return to configuration"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
          <span className="brand-title">Deep Research</span>
          {isRunning && (
            <span className="running-indicator">
              <span className="running-dot" />
              <span>Running</span>
            </span>
          )}
        </div>

        <div className="header-utilities">
          <button
            type="button"
            className="btn-ghost utility-btn"
            onClick={onOpenHistory}
            title="Past research sessions"
          >
            <History size={15} />
            <span>History</span>
            {historyCount > 0 && <span className="quiet-counter">{historyCount}</span>}
          </button>

          <button
            type="button"
            className="btn-ghost utility-btn"
            onClick={onOpenSettings}
            title="Settings and API keys"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <style>{`
        .site-header {
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-app);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-inner {
          max-width: 980px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .back-nav-btn {
          padding: 4px 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .running-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          padding-left: 8px;
          border-left: 1px solid var(--border-medium);
        }

        .running-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent);
        }

        .header-utilities {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .utility-btn {
          font-size: 13px;
          padding: 5px 10px;
        }

        .quiet-counter {
          font-size: 11px;
          color: var(--text-muted);
          background-color: var(--bg-surface-subtle);
          padding: 1px 6px;
          border-radius: 10px;
          margin-left: 2px;
        }
      `}</style>
    </header>
  );
};
