import React from 'react';
import { Settings, ArrowLeft, BrainCircuit } from 'lucide-react';
import type { ResearchStatus } from '../types';

interface HeaderProps {
  status: ResearchStatus;
  activeView: 'config' | 'progress' | 'report';
  onOpenSettings: () => void;
  onBackToConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeView,
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
              <ArrowLeft size={17} />
              <span>Back</span>
            </button>
          )}
          <div className="brand-logo-title" onClick={onBackToConfig} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box">
              <BrainCircuit size={20} className="brand-icon" />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">Deep Research AI</span>
              <span className="brand-badge">Multi-Agents & Obsidian</span>
            </div>
          </div>
          {isRunning && (
            <span className="running-indicator">
              <span className="running-dot" />
              <span>Researching...</span>
            </span>
          )}
        </div>

        <div className="header-utilities">
          <button
            type="button"
            className="btn-ghost utility-btn"
            onClick={onOpenSettings}
            title="System Settings & API Keys"
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <style>{`
        .site-header {
          border-bottom: 1px solid var(--border-medium);
          background-color: var(--bg-surface);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(8px);
        }

        .header-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .brand-logo-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon-box {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
        }

        .brand-icon {
          color: #ffffff;
        }

        .brand-text-col {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .brand-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .brand-badge {
          font-size: 11px;
          font-weight: 600;
          color: #c084fc;
          letter-spacing: 0.02em;
        }

        .back-nav-btn {
          padding: 6px 10px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .running-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: #a5b4fc;
          padding: 4px 12px;
          border-radius: 20px;
          background-color: var(--accent-subtle);
          border: 1px solid var(--accent-border);
        }

        .running-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.6; transform: scale(0.9); }
        }

        .header-utilities {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .utility-btn {
          font-size: 14px;
          font-weight: 500;
          padding: 7px 12px;
        }
      `}</style>
    </header>
  );
};
