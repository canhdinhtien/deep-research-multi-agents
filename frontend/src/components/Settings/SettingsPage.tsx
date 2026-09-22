import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Bot, 
  Sliders, 
  Key, 
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import type { AppSettings, ResearchEffort, OutputFormat, ReportLength, CitationStyle } from '../../types';
import { AVAILABLE_MODELS, DEFAULT_RESEARCHERS } from '../../data/presets';
import { DEFAULT_SETTINGS } from '../../utils/storage';
import { InciteLogo } from '../Brand/InciteLogo';

interface SettingsPageProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

type TabType = 'apikeys' | 'models' | 'scope';

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onBack }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('apikeys');
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    onSave(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings to default values?')) {
      setFormData({ ...DEFAULT_SETTINGS });
      onSave({ ...DEFAULT_SETTINGS });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const updateAgentModel = (agentId: string, modelId: string) => {
    setFormData(prev => ({
      ...prev,
      agentModels: {
        ...prev.agentModels,
        [agentId]: modelId
      }
    }));
  };

  return (
    <div className="settings-page-wrapper">
      {/* Header */}
      <header className="settings-header">
        <div className="settings-header-left">
          <button type="button" className="back-btn" onClick={onBack} title="Back to Research">
            <ArrowLeft size={18} />
            <span>Back to Research</span>
          </button>
          <div className="settings-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InciteLogo size={20} showText={true} badgeText="Settings" />
            </div>
            <p className="settings-subtitle">Configure API keys, model assignments, and deep research criteria.</p>
          </div>
        </div>

        <div className="settings-header-actions">
          <button type="button" className="btn-secondary" onClick={handleResetDefaults}>
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {savedToast ? <Check size={16} /> : <ShieldCheck size={16} />}
            <span>{savedToast ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      {/* Main Body with Tab Navigation */}
      <div className="settings-body-layout">
        {/* Left Navigation Tabs */}
        <aside className="settings-nav-sidebar">
          <button
            type="button"
            className={`settings-nav-tab ${currentTab === 'apikeys' ? 'tab-active' : ''}`}
            onClick={() => setCurrentTab('apikeys')}
          >
            <Key size={18} />
            <div className="tab-text">
              <span className="tab-name">API Keys & Endpoints</span>
              <span className="tab-desc">Gemini, OpenAI, Proxy</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-tab ${currentTab === 'models' ? 'tab-active' : ''}`}
            onClick={() => setCurrentTab('models')}
          >
            <Bot size={18} />
            <div className="tab-text">
              <span className="tab-name">Agent Models</span>
              <span className="tab-desc">Assign LLMs to roles</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-tab ${currentTab === 'scope' ? 'tab-active' : ''}`}
            onClick={() => setCurrentTab('scope')}
          >
            <Sliders size={18} />
            <div className="tab-text">
              <span className="tab-name">Scope & Criteria</span>
              <span className="tab-desc">Effort, format & guidelines</span>
            </div>
          </button>
        </aside>

        {/* Content Container */}
        <main className="settings-content-panel">
          {/* TAB 1: API KEYS */}
          {currentTab === 'apikeys' && (
            <div className="settings-section-pane">
              <div className="section-pane-header">
                <h2>API Keys & Execution Mode</h2>
                <p>Configure provider API keys to power multi-agent live deep research. Keys are encrypted and stored locally in your browser.</p>
              </div>

              {/* Simulation Mode Switch */}
              <div className="card-box">
                <div className="switch-row">
                  <div className="switch-info">
                    <div className="switch-title">
                      <span>Simulation Mode</span>
                      <span className="badge-demo">Demo Mode</span>
                    </div>
                    <p className="switch-desc">
                      Generate realistic multi-agent research traces and synthesize reports without consuming external API credits.
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.isSimulationMode}
                      onChange={(e) => setFormData({ ...formData, isSimulationMode: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* API Key Fields */}
              <div className="card-box">
                <h3 className="card-box-title">
                  <Key size={16} />
                  <span>Model Provider Keys</span>
                </h3>

                {/* Google Gemini */}
                <div className="field-group">
                  <div className="field-label-row">
                    <label className="field-label">Google Gemini API Key</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="field-link"
                    >
                      <span>Get Gemini Key</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={formData.geminiApiKey}
                      onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <span className="field-hint">Used for Gemini 2.5 Pro, Flash Thinking, and fast web intelligence.</span>
                </div>

                {/* OpenAI */}
                <div className="field-group">
                  <div className="field-label-row">
                    <label className="field-label">OpenAI API Key (Optional)</label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="field-link"
                    >
                      <span>Get OpenAI Key</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={formData.openaiApiKey}
                      onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <span className="field-hint">Used if you assign GPT-4o or o3-mini models to specialist agents.</span>
                </div>

                {/* Custom Base URL */}
                <div className="field-group">
                  <label className="field-label">Custom API / Proxy Base URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://api.openai.com/v1 or local LLM proxy"
                    value={formData.customBaseUrl}
                    onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                    className="form-input"
                  />
                  <span className="field-hint">Override default endpoints when using local proxies or corporate gateways.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT MODELS */}
          {currentTab === 'models' && (
            <div className="settings-section-pane">
              <div className="section-pane-header">
                <h2>Agent Model Assignments</h2>
                <p>Assign specialized large language models to distinct multi-agent research roles.</p>
              </div>

              <div className="agent-models-grid">
                {DEFAULT_RESEARCHERS.map(agent => {
                  const currentModelId = formData.agentModels[agent.id] || agent.model;
                  const currentModel = AVAILABLE_MODELS.find(m => m.id === currentModelId);

                  return (
                    <div key={agent.id} className="agent-model-card">
                      <div className="agent-card-header">
                        <div className="agent-avatar-icon">
                          <Bot size={18} />
                        </div>
                        <div className="agent-info">
                          <span className="agent-role-title">{agent.role}</span>
                          <span className="agent-id-tag">ID: {agent.id}</span>
                        </div>
                      </div>

                      <p className="agent-instructions-snippet">{agent.instructions}</p>

                      <div className="agent-model-picker">
                        <label className="picker-label">Assigned Model:</label>
                        <select
                          value={currentModelId}
                          onChange={(e) => updateAgentModel(agent.id, e.target.value)}
                          className="model-select-dropdown"
                        >
                          {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.provider} — {m.tag})
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentModel && (
                        <div className="model-desc-badge">
                          <Sparkles size={13} />
                          <span>{currentModel.description}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCOPE & CRITERIA */}
          {currentTab === 'scope' && (
            <div className="settings-section-pane">
              <div className="section-pane-header">
                <h2>Research Scope & Synthesis Criteria</h2>
                <p>Establish default standards for investigation depth, synthesis format, and verification rigour.</p>
              </div>

              <div className="card-box">
                {/* Research Effort */}
                <div className="field-group">
                  <label className="field-label">Default Research Effort</label>
                  <div className="radio-cards-grid">
                    {[
                      { id: 'quick', title: 'Quick Scan', desc: '1-2 rounds of search, concise synthesis.' },
                      { id: 'standard', title: 'Standard Investigation', desc: '3-5 rounds of peer-verified queries.' },
                      { id: 'extensive', title: 'Extensive Multi-Hop', desc: 'Deep recursive search and exhaustive cross-analysis.' }
                    ].map(opt => (
                      <label 
                        key={opt.id} 
                        className={`radio-card ${formData.defaultEffort === opt.id ? 'radio-card-active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="effort"
                          value={opt.id}
                          checked={formData.defaultEffort === opt.id}
                          onChange={(e) => setFormData({ ...formData, defaultEffort: e.target.value as ResearchEffort })}
                          style={{ display: 'none' }}
                        />
                        <span className="radio-card-title">{opt.title}</span>
                        <span className="radio-card-desc">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Output Format & Report Length */}
                <div className="grid-two-col">
                  <div className="field-group">
                    <label className="field-label">Default Output Format</label>
                    <select
                      value={formData.defaultFormat}
                      onChange={(e) => setFormData({ ...formData, defaultFormat: e.target.value as OutputFormat })}
                      className="form-select"
                    >
                      <option value="report">Comprehensive Markdown Report</option>
                      <option value="executive">Executive Summary & Key Takeaways</option>
                      <option value="whitepaper">Technical Whitepaper</option>
                      <option value="academic">Academic Literature Survey</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Target Report Length</label>
                    <select
                      value={formData.defaultReportLength}
                      onChange={(e) => setFormData({ ...formData, defaultReportLength: e.target.value as ReportLength })}
                      className="form-select"
                    >
                      <option value="concise">Concise (~1,500 words)</option>
                      <option value="standard">Standard (~3,000 - 5,000 words)</option>
                      <option value="exhaustive">Exhaustive Deep Dive (6,000+ words)</option>
                    </select>
                  </div>
                </div>

                {/* Citation & Verification */}
                <div className="grid-two-col">
                  <div className="field-group">
                    <label className="field-label">Citation Format</label>
                    <select
                      value={formData.defaultCitationStyle}
                      onChange={(e) => setFormData({ ...formData, defaultCitationStyle: e.target.value as CitationStyle })}
                      className="form-select"
                    >
                      <option value="inline">Inline Hyperlinks [1], [2]</option>
                      <option value="footnote">Footnote Annotations</option>
                      <option value="bibliography">Full Bibliography at End</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Verification Threshold</label>
                    <select
                      value={formData.defaultVerificationThreshold}
                      onChange={(e) => setFormData({ ...formData, defaultVerificationThreshold: e.target.value as 'strict' | 'standard' | 'exploratory' })}
                      className="form-select"
                    >
                      <option value="strict">Strict (Require 2+ Independent Source Confirmations)</option>
                      <option value="standard">Standard (Reputable Primary Sources)</option>
                      <option value="exploratory">Exploratory (Include Emerging / Pre-print Hypotheses)</option>
                    </select>
                  </div>
                </div>

                {/* Default Custom Instructions */}
                <div className="field-group">
                  <div className="field-label-row">
                    <label className="field-label">Global Research Directives & Requirements</label>
                    <span className="field-hint-inline">Applies to all new research prompts</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="E.g., Prioritize peer-reviewed academic papers after 2024; provide statistical data in markdown tables; avoid vague marketing fluff..."
                    value={formData.defaultRequirements || ''}
                    onChange={(e) => setFormData({ ...formData, defaultRequirements: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .settings-page-wrapper {
          min-height: 100vh;
          background-color: var(--bg-main);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        /* HEADER */
        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background-color: var(--bg-sidebar);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .settings-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          transition: all 150ms ease;
        }

        .back-btn:hover {
          color: #ffffff;
          border-color: var(--border-strong);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .settings-title-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .settings-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .settings-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          background-color: transparent;
          transition: all 150ms ease;
        }

        .btn-secondary:hover {
          color: #ffffff;
          background-color: var(--bg-surface);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          background-color: var(--accent-blue);
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transition: all 150ms ease;
        }

        .btn-primary:hover {
          background-color: var(--accent-cyan);
        }

        /* BODY LAYOUT */
        .settings-body-layout {
          display: flex;
          flex: 1;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 24px;
          gap: 32px;
        }

        /* LEFT NAVIGATION TABS */
        .settings-nav-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-nav-tab {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background-color: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          text-align: left;
          transition: all 150ms ease;
        }

        .settings-nav-tab:hover {
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .settings-nav-tab.tab-active {
          background-color: var(--bg-surface);
          border-color: rgba(6, 182, 212, 0.4);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .settings-nav-tab.tab-active svg {
          color: var(--accent-cyan);
        }

        .tab-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tab-name {
          font-size: 14px;
          font-weight: 600;
        }

        .tab-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* MAIN CONTENT PANEL */
        .settings-content-panel {
          flex: 1;
          min-width: 0;
        }

        .settings-section-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-pane-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .section-pane-header p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .card-box {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .card-box-title {
          font-size: 15px;
          font-weight: 600;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .field-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--accent-cyan);
          text-decoration: none;
        }

        .field-link:hover {
          text-decoration: underline;
        }

        .field-hint {
          font-size: 12px;
          color: var(--text-muted);
        }

        .field-hint-inline {
          font-size: 12px;
          color: var(--text-muted);
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 150ms ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-input {
          padding-left: 36px;
        }

        /* TOGGLE SWITCH */
        .switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .switch-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .switch-title {
          font-size: 14px;
          font-weight: 600;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge-demo {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .switch-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
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
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          transition: .2s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #94a3b8;
          transition: .2s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
          background-color: #ffffff;
        }

        /* AGENT MODELS GRID */
        .agent-models-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 16px;
        }

        .agent-model-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .agent-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .agent-avatar-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .agent-info {
          display: flex;
          flex-direction: column;
        }

        .agent-role-title {
          font-size: 14px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .agent-id-tag {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
        }

        .agent-instructions-snippet {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        .agent-model-picker {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .picker-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .model-select-dropdown {
          width: 100%;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
        }

        .model-desc-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border-subtle);
        }

        /* SCOPE & CRITERIA */
        .radio-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .radio-card {
          padding: 12px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 120ms ease;
        }

        .radio-card:hover {
          border-color: var(--border-strong);
        }

        .radio-card-active {
          border-color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.08);
        }

        .radio-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .radio-card-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .grid-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 860px) {
          .settings-body-layout {
            flex-direction: column;
          }
          .settings-nav-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
          }
          .radio-cards-grid, .grid-two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
