import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { ResearcherRole } from '../types';
import { ModelPicker } from './ModelPicker';

interface AgentDrawerProps {
  agent: ResearcherRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAgent: ResearcherRole) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agent,
  isOpen,
  onClose,
  onSave
}) => {
  const [role, setRole] = useState('');
  const [model, setModel] = useState('');
  const [instructions, setInstructions] = useState('');
  const [webSearch, setWebSearch] = useState(true);
  const [readSources, setReadSources] = useState(true);
  const [reviewPeers, setReviewPeers] = useState(false);
  const [codeExecution, setCodeExecution] = useState(false);

  // Advanced collapsible
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    if (agent) {
      setRole(agent.role);
      setModel(agent.model);
      setInstructions(agent.instructions);
      setWebSearch(agent.capabilities.webSearch);
      setReadSources(agent.capabilities.readSources);
      setReviewPeers(agent.capabilities.reviewPeers);
      setCodeExecution(agent.capabilities.codeExecution);
      setTemperature(agent.advanced?.temperature ?? 0.2);
      setMaxTokens(agent.advanced?.maxTokens);
      setReasoningEffort(agent.advanced?.reasoningEffort ?? 'high');
      setIsAdvancedOpen(false);
    }
  }, [agent, isOpen]);

  if (!isOpen || !agent) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...agent,
      role: role.trim() || agent.role,
      model,
      instructions: instructions.trim(),
      capabilities: {
        webSearch,
        readSources,
        reviewPeers,
        codeExecution
      },
      advanced: {
        temperature,
        maxTokens: maxTokens ? Number(maxTokens) : undefined,
        reasoningEffort
      }
    });
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-title">Configure researcher</span>
            <span className="drawer-subtitle">{agent.role}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="drawer-body">
          {/* Role */}
          <div className="form-item">
            <label className="input-label">Role</label>
            <input
              type="text"
              className="drawer-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Technical analyst"
              required
            />
          </div>

          {/* Model */}
          <div className="form-item">
            <label className="input-label">Model</label>
            <ModelPicker value={model} onChange={setModel} />
          </div>

          {/* Instructions */}
          <div className="form-item">
            <label className="input-label">Instructions</label>
            <textarea
              className="drawer-textarea"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Define specific analytical responsibilities, focus areas, and output requirements..."
            />
          </div>

          {/* Capabilities */}
          <div className="form-item">
            <label className="input-label">Capabilities</label>
            <div className="capabilities-list">
              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                />
                <span>Web search</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={readSources}
                  onChange={(e) => setReadSources(e.target.checked)}
                />
                <span>Read attached sources</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={reviewPeers}
                  onChange={(e) => setReviewPeers(e.target.checked)}
                />
                <span>Review other researchers</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={codeExecution}
                  onChange={(e) => setCodeExecution(e.target.checked)}
                />
                <span>Code execution</span>
              </label>
            </div>
          </div>

          {/* Advanced Collapsible */}
          <div className="advanced-section">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              {isAdvancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Advanced</span>
            </button>

            {isAdvancedOpen && (
              <div className="advanced-content">
                <div className="form-item">
                  <div className="label-with-value">
                    <label className="input-label">Temperature</label>
                    <span className="value-label">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="slider-input"
                  />
                  <span className="field-hint">Lower values produce more deterministic, factual output.</span>
                </div>

                <div className="form-item">
                  <label className="input-label">Reasoning effort</label>
                  <select
                    className="drawer-input"
                    value={reasoningEffort}
                    onChange={(e) => setReasoningEffort(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low (Fast)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Deep reasoning)</option>
                  </select>
                </div>

                <div className="form-item">
                  <label className="input-label">Token limit (Optional)</label>
                  <input
                    type="number"
                    className="drawer-input"
                    placeholder="e.g. 4096 (Default)"
                    value={maxTokens ?? ''}
                    onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="drawer-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14} />
              <span>Save researcher</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .drawer-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .drawer-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drawer-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .drawer-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .drawer-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .label-with-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .drawer-input {
          width: 100%;
          font-size: 13px;
        }

        .drawer-textarea {
          width: 100%;
          font-size: 13px;
          resize: vertical;
          line-height: 1.5;
        }

        .capabilities-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 6px 0;
        }

        .capability-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .capability-row input {
          accent-color: var(--accent);
          cursor: pointer;
        }

        .advanced-section {
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          align-self: flex-start;
          padding: 4px 0;
        }

        .advanced-toggle:hover {
          color: var(--text-primary);
        }

        .advanced-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-left: 12px;
          border-left: 2px solid var(--border-subtle);
        }

        .slider-input {
          width: 100%;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .field-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        .drawer-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};
