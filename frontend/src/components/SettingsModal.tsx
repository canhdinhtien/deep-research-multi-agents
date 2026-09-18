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
          <span className="modal-title">Settings</span>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          {/* Simulation Toggle */}
          <div className="setting-row">
            <div className="setting-labels">
              <span className="setting-name">Simulation mode</span>
              <span className="setting-desc">
                Generates realistic multi-agent research traces without making live API calls.
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
            <label className="input-label">Google Gemini API key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="mono-input"
            />
            <span className="field-hint">
              Used for Gemini 2.5 Pro, 2.5 Flash, and Gemini 2.0 models.
            </span>
          </div>

          {/* OpenAI API Key */}
          <div className="form-item">
            <label className="input-label">OpenAI API key (Optional)</label>
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
            <label className="input-label">Custom / Local API Base URL (Optional)</label>
            <input
              type="url"
              placeholder="http://localhost:11434/v1"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
            />
            <span className="field-hint">
              Point to Ollama, vLLM, or other OpenAI-compatible endpoints.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {saved ? <Check size={14} /> : null}
              <span>{saved ? 'Saved' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-top {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          gap: 16px;
        }

        .setting-labels {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .setting-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .setting-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.35;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 34px;
          height: 18px;
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
          border-radius: 18px;
          transition: background-color var(--transition-fast);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 12px;
          width: 12px;
          left: 2px;
          bottom: 2px;
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
          transform: translateX(16px);
        }

        .mono-input {
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .modal-actions {
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
