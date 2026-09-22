import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sliders } from 'lucide-react';
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
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <Sliders size={16} />
        <span>Cấu hình nghiên cứu chuyên sâu & Định dạng xuất</span>
      </button>

      {isOpen && (
        <div className="advanced-settings-grid">
          {/* Research Effort */}
          <div className="setting-block">
            <label className="setting-title">Mức độ đào sâu (Research Depth & Effort)</label>
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
              <label className="setting-title">Định dạng báo cáo chính</label>
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
              <label className="setting-title">Dung lượng / Độ dài tài liệu</label>
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
              <label className="setting-title">Quy cách trích dẫn nguồn</label>
              <select
                className="setting-select"
                value={citationStyle}
                onChange={(e) => onChangeCitationStyle(e.target.value as CitationStyle)}
                disabled={disabled}
              >
                <option value="inline">Trích dẫn học thuật trong văn bản [1, 2] + Obsidian Wikilinks</option>
                <option value="footnote">Chú thích chân trang (Footnotes)</option>
                <option value="bibliography">Thư mục tham khảo có chú giải (Annotated bibliography)</option>
              </select>
            </div>

            {/* Verification threshold */}
            <div className="setting-block">
              <label className="setting-title">Ngưỡng kiểm định & Chống ảo giác (Verification)</label>
              <select className="setting-select" defaultValue="strict" disabled={disabled}>
                <option value="strict">Nghiêm ngặt (Bắt buộc đối soát chéo nhiều nguồn)</option>
                <option value="standard">Tiêu chuẩn (Gắn cờ cảnh báo cho luận điểm chưa đủ chứng cứ)</option>
                <option value="exploratory">Mở rộng (Bao gồm các giả thuyết thăm dò)</option>
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
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 6px 0;
          align-self: flex-start;
          transition: color var(--transition-fast);
        }

        .advanced-header-btn:hover {
          color: var(--text-primary);
        }

        .advanced-settings-grid {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 22px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
        }

        .setting-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .effort-options-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .effort-pill {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .effort-pill:hover:not(:disabled) {
          border-color: var(--border-strong);
          background-color: var(--bg-surface-hover);
        }

        .effort-pill-active {
          border-color: var(--accent);
          background-color: var(--accent-subtle);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .effort-pill-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .effort-pill-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .settings-two-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .setting-select {
          width: 100%;
          font-size: 14.5px;
        }

        .setting-hint {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
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
