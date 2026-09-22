import React from 'react';
import { Plus, X, Settings2, CheckSquare, Square } from 'lucide-react';
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
        <div className="section-title-wrap">
          <h2 className="section-heading">Đội ngũ Tác tử AI (Multi-Agent Team)</h2>
          <span className="section-subheading">
            Cấu hình các chuyên gia AI đảm nhiệm từng vai trò: Lập kế hoạch, Thu thập dữ liệu, Phân tích kỹ thuật, Phản biện và Kiến trúc Cây tri thức Obsidian.
          </span>
        </div>
        <button
          type="button"
          className="btn-action-inline"
          onClick={onAddResearcher}
          disabled={disabled}
        >
          <Plus size={16} />
          <span>Thêm tác tử</span>
        </button>
      </div>

      <div className="researchers-list">
        {researchers.map((researcher) => (
          <div
            key={researcher.id}
            className={`researcher-row ${!researcher.enabled ? 'researcher-disabled' : ''}`}
          >
            {/* Left toggle / indicator */}
            <div 
              className="researcher-checkbox-col" 
              onClick={() => !disabled && handleToggle(researcher.id)}
              title={researcher.enabled ? 'Đang kích hoạt' : 'Đã tắt'}
            >
              {researcher.enabled ? (
                <CheckSquare size={19} className="chk-active" />
              ) : (
                <Square size={19} className="chk-inactive" />
              )}
            </div>

            {/* Main info */}
            <div className="researcher-info" onClick={() => onEditResearcher(researcher)}>
              <div className="researcher-top-line">
                <span className="researcher-role">{researcher.role}</span>
                <span className="researcher-model-badge">{getModelName(researcher.model)}</span>
              </div>
              <p className="researcher-instructions">{researcher.instructions}</p>
            </div>

            {/* Right action */}
            <div className="researcher-actions">
              <button
                type="button"
                className="btn-secondary edit-btn"
                onClick={() => onEditResearcher(researcher)}
                disabled={disabled}
              >
                <Settings2 size={14} />
                <span>Cấu hình</span>
              </button>
              {researchers.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemove(researcher.id)}
                  disabled={disabled}
                  title="Xóa tác tử"
                >
                  <X size={16} />
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
          gap: 14px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .section-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-heading {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .section-subheading {
          font-size: 14px;
          color: var(--text-muted);
        }

        .researchers-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background-color: var(--bg-surface);
        }

        .researcher-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 18px;
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

        .researcher-checkbox-col {
          display: flex;
          align-items: center;
          padding-top: 3px;
          cursor: pointer;
        }

        .chk-active {
          color: var(--accent);
        }

        .chk-inactive {
          color: var(--text-muted);
        }

        .researcher-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
        }

        .researcher-top-line {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .researcher-role {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .researcher-model-badge {
          font-size: 12.5px;
          color: #a5b4fc;
          background-color: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .researcher-instructions {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .researcher-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 2px;
        }

        .edit-btn {
          font-size: 13.5px;
          padding: 6px 12px;
        }

        .remove-btn {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: var(--radius-sm);
        }

        .remove-btn:hover:not(:disabled) {
          color: var(--status-danger);
          background-color: rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </section>
  );
};
