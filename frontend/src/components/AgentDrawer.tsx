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
            <span className="drawer-title">Cấu hình Tác tử AI</span>
            <span className="drawer-subtitle">{agent.role}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="drawer-body">
          {/* Role */}
          <div className="form-item">
            <label className="input-label">Tên vai trò (Role)</label>
            <input
              type="text"
              className="drawer-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ví dụ: Technical Analyst"
              required
            />
          </div>

          {/* Model */}
          <div className="form-item">
            <label className="input-label">Mô hình AI (LLM)</label>
            <ModelPicker value={model} onChange={setModel} />
          </div>

          {/* Instructions */}
          <div className="form-item">
            <label className="input-label">Chỉ thị & Hướng dẫn hành động (Prompt Instructions)</label>
            <textarea
              className="drawer-textarea"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Mô tả cụ thể nhiệm vụ phân tích, góc nhìn chuyên môn và yêu cầu đầu ra..."
            />
          </div>

          {/* Capabilities */}
          <div className="form-item">
            <label className="input-label">Quyền hạn & Khả năng của Tác tử</label>
            <div className="capabilities-list">
              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                />
                <span>Tìm kiếm Web mở (Web Grounding)</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={readSources}
                  onChange={(e) => setReadSources(e.target.checked)}
                />
                <span>Đọc & Bóc tách tài liệu đính kèm (Source Ingestion)</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={reviewPeers}
                  onChange={(e) => setReviewPeers(e.target.checked)}
                />
                <span>Phản biện & Kiểm tra chéo tác tử khác (Peer Review)</span>
              </label>

              <label className="capability-row">
                <input
                  type="checkbox"
                  checked={codeExecution}
                  onChange={(e) => setCodeExecution(e.target.checked)}
                />
                <span>Thực thi mã tính toán / Benchmark (Code Execution)</span>
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
              {isAdvancedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>Tham số Suy luận Nâng cao</span>
            </button>

            {isAdvancedOpen && (
              <div className="advanced-content">
                <div className="form-item">
                  <div className="label-with-value">
                    <label className="input-label">Độ ngẫu nhiên (Temperature)</label>
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
                  <span className="field-hint">Giá trị thấp (0.1 - 0.3) giúp câu trả lời xác thực, chính xác và bám sát chứng cứ hơn.</span>
                </div>

                <div className="form-item">
                  <label className="input-label">Mức độ suy luận (Reasoning Effort)</label>
                  <select
                    className="drawer-input"
                    value={reasoningEffort}
                    onChange={(e) => setReasoningEffort(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Thấp (Phản hồi nhanh)</option>
                    <option value="medium">Trung bình (Tiêu chuẩn)</option>
                    <option value="high">Cao (Suy luận chuỗi CoT sâu)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="drawer-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>Lưu tác tử</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .drawer-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-surface-subtle);
        }

        .drawer-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drawer-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .drawer-subtitle {
          font-size: 13.5px;
          color: var(--accent);
          font-weight: 600;
        }

        .drawer-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 22px;
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

        .label-with-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value-label {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--accent);
          font-weight: 700;
        }

        .drawer-input {
          width: 100%;
          font-size: 15px;
        }

        .drawer-textarea {
          width: 100%;
          font-size: 14.5px;
          resize: vertical;
          line-height: 1.55;
        }

        .capabilities-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 6px 0;
        }

        .capability-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14.5px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .capability-row input {
          width: 17px;
          height: 17px;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .advanced-section {
          border-top: 1px solid var(--border-subtle);
          padding-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
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
          gap: 18px;
          padding-left: 14px;
          border-left: 2px solid var(--accent);
        }

        .slider-input {
          width: 100%;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .field-hint {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .drawer-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
};
