import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ResearchEffort, OutputFormat, ReportLength, CitationStyle } from '../types';
import { RESEARCH_EFFORT_OPTIONS, OUTPUT_FORMAT_OPTIONS, REPORT_LENGTH_OPTIONS } from '../data/presets';

interface AdvancedSectionProps {
  effort: ResearchEffort;
  format: OutputFormat;
  reportLength: ReportLength;
  citationStyle: CitationStyle;
  onChangeEffort: (effort: ResearchEffort) => void;
  onChangeFormat: (format: OutputFormat) => void;
  onChangeReportLength: (length: ReportLength) => void;
  onChangeCitationStyle: (style: CitationStyle) => void;
  disabled?: boolean;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  effort,
  format,
  reportLength,
  citationStyle,
  onChangeEffort,
  onChangeFormat,
  onChangeReportLength,
  onChangeCitationStyle,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="advanced-settings-section">
      <button
        type="button"
        className="advanced-header-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Advanced settings</span>
      </button>

      {isOpen && (
        <div className="advanced-settings-grid">
          {/* Research Effort */}
          <div className="setting-block">
            <label className="setting-title">Research effort</label>
            <div className="effort-options-row">
              {RESEARCH_EFFORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`effort-pill ${effort === opt.id ? 'effort-pill-active' : ''}`}
                  onClick={() => onChangeEffort(opt.id)}
                  disabled={disabled}
                >
                  <span className="effort-pill-name">{opt.label}</span>
                  <span className="effort-pill-desc">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-two-cols">
            {/* Output Format */}
            <div className="setting-block">
              <label className="setting-title">Output format</label>
              <select
                className="setting-select"
                value={format}
                onChange={(e) => onChangeFormat(e.target.value as OutputFormat)}
                disabled={disabled}
              >
                {OUTPUT_FORMAT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <span className="setting-hint">
                {OUTPUT_FORMAT_OPTIONS.find(f => f.id === format)?.description}
              </span>
            </div>

            {/* Report Length */}
            <div className="setting-block">
              <label className="setting-title">Report length</label>
              <select
                className="setting-select"
                value={reportLength}
                onChange={(e) => onChangeReportLength(e.target.value as ReportLength)}
                disabled={disabled}
              >
                {REPORT_LENGTH_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-two-cols">
            {/* Citation Style */}
            <div className="setting-block">
              <label className="setting-title">Citation style</label>
              <select
                className="setting-select"
                value={citationStyle}
                onChange={(e) => onChangeCitationStyle(e.target.value as CitationStyle)}
                disabled={disabled}
              >
                <option value="inline">Academic inline [1, 2]</option>
                <option value="footnote">Footnotes</option>
                <option value="bibliography">Annotated bibliography</option>
              </select>
            </div>

            {/* Stopping conditions / Verification passes */}
            <div className="setting-block">
              <label className="setting-title">Verification threshold</label>
              <select className="setting-select" defaultValue="strict" disabled={disabled}>
                <option value="strict">Strict (Require cross-validation from multiple sources)</option>
                <option value="standard">Standard (Flag unverified claims with caveat)</option>
                <option value="exploratory">Exploratory (Include speculative hypotheses)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .advanced-settings-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .advanced-header-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 4px 0;
          align-self: flex-start;
        }

        .advanced-header-btn:hover {
          color: var(--text-primary);
        }

        .advanced-settings-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .setting-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .setting-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .effort-options-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .effort-pill {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .effort-pill:hover:not(:disabled) {
          border-color: var(--border-medium);
        }

        .effort-pill-active {
          border-color: var(--accent);
          background-color: var(--accent-subtle);
        }

        .effort-pill-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .effort-pill-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.35;
        }

        .settings-two-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .setting-select {
          width: 100%;
          font-size: 13px;
        }

        .setting-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .effort-options-row {
            grid-template-columns: 1fr;
          }
          .settings-two-cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
