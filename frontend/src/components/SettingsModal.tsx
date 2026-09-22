import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey);
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey);
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.customBaseUrl);
  const [isSimulation, setIsSimulation] = useState(settings.isSimulationMode);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim(),
      customBaseUrl: customBaseUrl.trim(),
      isSimulationMode: isSimulation
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div className="modal-title-group">
            <span className="modal-title">System Settings & API Keys</span>
            <span className="modal-subtitle">Manage model connections and execution mode</span>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          {/* Simulation Toggle */}
          <div className="setting-row">
            <div className="setting-labels">
              <span className="setting-name">Simulation Mode</span>
              <span className="setting-desc">
                Generates realistic multi-agent research traces and Obsidian vaults immediately without consuming live API tokens.
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isSimulation}
                onChange={(e) => setIsSimulation(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Gemini API Key */}
          <div className="form-item">
            <label className="input-label">Google Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="mono-input"
            />
            <span className="field-hint">
              Used for Gemini 2.5 Pro, 2.5 Flash, and Gemini 2.0 Thinking models.
            </span>
          </div>

          {/* OpenAI API Key */}
          <div className="form-item">
            <label className="input-label">OpenAI API Key (Optional)</label>
            <input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="mono-input"
            />
          </div>

          {/* Custom Base URL */}
          <div className="form-item">
            <label className="input-label">Local LLM / Custom Endpoint URL (Optional)</label>
            <input
              type="url"
              placeholder="http://localhost:11434/v1"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
            />
            <span className="field-hint">
              Connect to Ollama, vLLM, or OpenAI-compatible custom servers.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {saved ? <Check size={16} /> : null}
              <span>{saved ? 'Saved' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-top {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-surface-subtle);
        }

        .modal-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          gap: 20px;
        }

        .setting-labels {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .setting-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: var(--bg-surface-active);
          border: 1px solid var(--border-medium);
          border-radius: 24px;
          transition: all var(--transition-fast);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-muted);
          border-radius: 50%;
          transition: transform var(--transition-fast);
        }

        input:checked + .toggle-slider {
          background-color: var(--accent);
          border-color: var(--accent);
        }

        input:checked + .toggle-slider:before {
          background-color: #ffffff;
          transform: translateX(20px);
        }

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .field-hint {
          font-size: 13px;
          color: var(--text-muted);
        }

        .mono-input {
          font-family: var(--font-mono);
          font-size: 14px;
        }

        .modal-actions {
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};
