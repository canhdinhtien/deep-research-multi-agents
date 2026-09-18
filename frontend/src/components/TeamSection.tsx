import React from 'react';
import { Plus, X } from 'lucide-react';
import type { ResearcherRole } from '../types';
import { AVAILABLE_MODELS } from '../data/presets';

interface TeamSectionProps {
  researchers: ResearcherRole[];
  onChange: (researchers: ResearcherRole[]) => void;
  onEditResearcher: (researcher: ResearcherRole) => void;
  onAddResearcher: () => void;
  disabled?: boolean;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  researchers,
  onChange,
  onEditResearcher,
  onAddResearcher,
  disabled
}) => {
  const handleToggle = (id: string) => {
    onChange(
      researchers.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleRemove = (id: string) => {
    onChange(researchers.filter(r => r.id !== id));
  };

  const getModelName = (modelId: string) => {
    return AVAILABLE_MODELS.find(m => m.id === modelId)?.name || modelId;
  };

  return (
    <section className="team-section">
      <div className="section-header">
        <h2 className="section-heading">Research team</h2>
        <button
          type="button"
          className="btn-action-inline"
          onClick={onAddResearcher}
          disabled={disabled}
        >
          <Plus size={14} />
          <span>Add researcher</span>
        </button>
      </div>

      <div className="researchers-list">
        {researchers.map((researcher) => (
          <div
            key={researcher.id}
            className={`researcher-row ${!researcher.enabled ? 'researcher-disabled' : ''}`}
          >
            {/* Left toggle / indicator */}
            <label className="researcher-toggle-label" title={researcher.enabled ? 'Enabled' : 'Disabled'}>
              <input
                type="checkbox"
                checked={researcher.enabled}
                onChange={() => handleToggle(researcher.id)}
                disabled={disabled}
              />
            </label>

            {/* Main info */}
            <div className="researcher-info" onClick={() => onEditResearcher(researcher)}>
              <div className="researcher-top-line">
                <span className="researcher-role">{researcher.role}</span>
                <span className="researcher-model">{getModelName(researcher.model)}</span>
              </div>
              <p className="researcher-instructions">{researcher.instructions}</p>
            </div>

            {/* Right action */}
            <div className="researcher-actions">
              <button
                type="button"
                className="btn-ghost edit-btn"
                onClick={() => onEditResearcher(researcher)}
                disabled={disabled}
              >
                Edit
              </button>
              {researchers.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemove(researcher.id)}
                  disabled={disabled}
                  title="Remove researcher"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .team-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-heading {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .researchers-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-surface);
        }

        .researcher-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          transition: background-color var(--transition-fast);
        }

        .researcher-row:last-child {
          border-bottom: none;
        }

        .researcher-row:hover {
          background-color: var(--bg-surface-hover);
        }

        .researcher-disabled {
          opacity: 0.45;
        }

        .researcher-toggle-label {
          display: flex;
          align-items: center;
          padding-top: 2px;
          cursor: pointer;
        }

        .researcher-toggle-label input {
          accent-color: var(--accent);
          cursor: pointer;
        }

        .researcher-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          cursor: pointer;
        }

        .researcher-top-line {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .researcher-role {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .researcher-model {
          font-size: 12px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .researcher-instructions {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .researcher-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 1px;
        }

        .edit-btn {
          font-size: 12px;
          padding: 3px 8px;
          color: var(--text-secondary);
        }

        .edit-btn:hover {
          color: var(--text-primary);
        }

        .remove-btn {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: var(--radius-sm);
        }

        .remove-btn:hover:not(:disabled) {
          color: var(--status-danger);
        }
      `}</style>
    </section>
  );
};
