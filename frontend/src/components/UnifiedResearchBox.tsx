import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  Paperclip, 
  Link as LinkIcon, 
  X, 
  FileText, 
  Globe, 
  Sparkles, 
  Target, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import type { SourceItem, ResearchEffort, SourceType } from '../types';
import { generateId, formatFileSize } from '../utils/storage';

interface UnifiedResearchBoxProps {
  topic: string;
  requirements: string;
  sources: SourceItem[];
  questions: string[];
  effort: ResearchEffort;
  onTopicChange: (topic: string) => void;
  onRequirementsChange: (requirements: string) => void;
  onSourcesChange: (sources: SourceItem[]) => void;
  onQuestionsChange: (questions: string[]) => void;
  onEffortChange: (effort: ResearchEffort) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const UnifiedResearchBox: React.FC<UnifiedResearchBoxProps> = ({
  topic,
  requirements,
  sources,
  questions,
  effort,
  onTopicChange,
  onRequirementsChange,
  onSourcesChange,
  onQuestionsChange,
  onEffortChange,
  onSubmit,
  disabled
}) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [newCriterion, setNewCriterion] = useState('');
  const [isReqOpen, setIsReqOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newSources: SourceItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      let type: SourceType = 'text';
      if (ext === 'pdf') type = 'pdf';
      else if (ext === 'docx' || ext === 'doc') type = 'docx';
      else if (['md', 'markdown'].includes(ext)) type = 'markdown';

      let content = '';
      if (['txt', 'md', 'markdown', 'json', 'csv'].includes(ext)) {
        try {
          content = await file.text();
        } catch {
          content = '';
        }
      } else {
        content = `[Attached document: ${file.name} — Size: ${formatFileSize(file.size)}]`;
      }

      newSources.push({
        id: generateId('src-file'),
        name: file.name,
        type,
        size: file.size,
        content,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    onSourcesChange([...sources, ...newSources]);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let formatted = urlInput.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }

    try {
      const parsed = new URL(formatted);
      const displayName = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
      onSourcesChange([
        ...sources,
        {
          id: generateId('src-web'),
          name: displayName,
          type: 'web',
          url: formatted,
          content: `[Source reference link: ${formatted}]`,
          addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setUrlInput('');
      setIsUrlModalOpen(false);
    } catch {
      alert('Please enter a valid URL.');
    }
  };

  const handleRemoveSource = (id: string) => {
    onSourcesChange(sources.filter(s => s.id !== id));
  };

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    onQuestionsChange([...questions, newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (topic.trim()) onSubmit();
    }
  };

  return (
    <div className="unified-box-container">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.json"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Main Research Card Box */}
      <div 
        className={`unified-prompt-card ${isDragging ? 'box-dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
      >
        {/* Research Topic Main Textarea */}
        <div className="prompt-input-row">
          <textarea
            className="main-topic-input"
            rows={2}
            placeholder="What would you like to research? (e.g. Multi-agent orchestration paradigms, production benchmarks & failure modes in 2026...)"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoFocus
          />
        </div>

        {/* Optional Expanded Requirements Input */}
        {isReqOpen && (
          <div className="req-expand-box">
            <label className="req-label">Specific Scope & Requirements:</label>
            <textarea
              className="req-textarea"
              rows={3}
              placeholder="Specify desired benchmarks, architectural constraints, target depth, or key perspectives to explore..."
              value={requirements}
              onChange={(e) => onRequirementsChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}

        {/* Attached Sources & Criteria Badges Row */}
        {(sources.length > 0 || questions.length > 0) && (
          <div className="chips-wrapper">
            {/* Sources Chips */}
            {sources.map((s) => (
              <span key={s.id} className="chip-item chip-source">
                {s.type === 'web' ? <Globe size={13} /> : <FileText size={13} />}
                <span className="chip-name" title={s.name}>{s.name}</span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => handleRemoveSource(s.id)}
                  title="Remove document"
                >
                  <X size={13} />
                </button>
              </span>
            ))}

            {/* Criteria Chips */}
            {questions.map((q, idx) => (
              <span key={idx} className="chip-item chip-criteria">
                <Target size={13} />
                <span className="chip-name" title={q}>{q}</span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => handleRemoveCriterion(idx)}
                  title="Remove criterion"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Inline URL Input Form */}
        {isUrlModalOpen && (
          <form onSubmit={handleAddLink} className="inline-url-form">
            <Globe size={16} className="url-icon" />
            <input
              type="url"
              placeholder="Paste article or website URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="url-text-input"
              autoFocus
            />
            <button type="submit" className="btn-primary btn-mini" disabled={!urlInput.trim()}>
              Add
            </button>
            <button type="button" className="btn-ghost btn-mini" onClick={() => setIsUrlModalOpen(false)}>
              Cancel
            </button>
          </form>
        )}

        {/* Inline Criteria Input Form */}
        {isCriteriaOpen && (
          <div className="inline-criteria-form">
            <Target size={16} className="criteria-icon" />
            <input
              type="text"
              placeholder="Add specific research question or evaluation criterion..."
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCriterion();
                } else if (e.key === 'Escape') {
                  setIsCriteriaOpen(false);
                }
              }}
              className="criteria-text-input"
              autoFocus
            />
            <button 
              type="button" 
              className="btn-primary btn-mini" 
              onClick={handleAddCriterion}
              disabled={!newCriterion.trim()}
            >
              Add
            </button>
            <button 
              type="button" 
              className="btn-ghost btn-mini" 
              onClick={() => setIsCriteriaOpen(false)}
            >
              Close
            </button>
          </div>
        )}

        {/* Bottom Toolbar Row */}
        <div className="prompt-footer-row">
          <div className="footer-left-actions">
            {/* Attach File Button */}
            <button
              type="button"
              className="action-pill-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Attach PDF, DOCX, Markdown, or text files"
            >
              <Paperclip size={15} />
              <span>Attach files</span>
            </button>

            {/* Add Web Link Button */}
            <button
              type="button"
              className="action-pill-btn"
              onClick={() => setIsUrlModalOpen(!isUrlModalOpen)}
              disabled={disabled}
              title="Add article or documentation URL"
            >
              <LinkIcon size={15} />
              <span>Add Link</span>
            </button>

            {/* Add Criteria Button */}
            <button
              type="button"
              className="action-pill-btn"
              onClick={() => setIsCriteriaOpen(!isCriteriaOpen)}
              disabled={disabled}
              title="Add specific evaluation questions or focus criteria"
            >
              <Target size={15} />
              <span>Criteria</span>
            </button>

            {/* Add Detail Scope Button */}
            <button
              type="button"
              className={`action-pill-btn ${isReqOpen ? 'pill-active' : ''}`}
              onClick={() => setIsReqOpen(!isReqOpen)}
              disabled={disabled}
              title="Specify research constraints and scope"
            >
              <SlidersHorizontal size={15} />
              <span>Scope</span>
            </button>
          </div>

          <div className="footer-right-actions">
            {/* Depth Selector Pills */}
            <div className="depth-pills-group">
              {(['quick', 'standard', 'extensive'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`depth-btn ${effort === lvl ? 'depth-active' : ''}`}
                  onClick={() => onEffortChange(lvl)}
                  disabled={disabled}
                >
                  {lvl === 'quick' ? 'Quick' : lvl === 'standard' ? 'Standard' : 'Deep'}
                </button>
              ))}
            </div>

            {/* Single Primary Action Button */}
            <button
              type="button"
              className="btn-obsidian submit-research-btn"
              onClick={onSubmit}
              disabled={disabled || !topic.trim()}
            >
              <Sparkles size={16} />
              <span>Start Research</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle agent helper footnote */}
      <div className="unified-footnote">
        <div className="footnote-item">
          <Bot size={15} className="fn-icon" />
          <span><strong>5 Autonomous AI Agents</strong> collaborate to cross-verify claims and synthesize an <strong>Obsidian Knowledge Tree</strong>.</span>
        </div>
      </div>

      <style>{`
        .unified-box-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .unified-prompt-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
          transition: all var(--transition-fast);
        }

        .unified-prompt-card:focus-within {
          border-color: var(--accent);
          box-shadow: 0 14px 44px rgba(99, 102, 241, 0.22);
        }

        .box-dragging {
          border-color: var(--obsidian-purple) !important;
          background-color: var(--obsidian-purple-subtle) !important;
        }

        .prompt-input-row {
          display: flex;
          flex-direction: column;
        }

        .main-topic-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 500;
          line-height: 1.55;
          padding: 4px 0;
          resize: none;
          box-shadow: none !important;
        }

        .main-topic-input::placeholder {
          color: var(--text-placeholder);
          font-size: 17px;
        }

        .req-expand-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 14px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .req-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .req-textarea {
          font-size: 14.5px;
          background: transparent;
          border: none;
          padding: 4px 0;
          color: var(--text-primary);
          resize: vertical;
          box-shadow: none !important;
        }

        .chips-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 4px;
        }

        .chip-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          max-width: 260px;
        }

        .chip-source {
          background-color: var(--accent-subtle);
          color: #a5b4fc;
          border: 1px solid var(--accent-border);
        }

        .chip-criteria {
          background-color: var(--obsidian-purple-subtle);
          color: #d8b4fe;
          border: 1px solid var(--obsidian-purple-border);
        }

        .chip-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chip-remove {
          display: flex;
          align-items: center;
          color: inherit;
          opacity: 0.7;
          border-radius: 50%;
          padding: 1px;
        }

        .chip-remove:hover {
          opacity: 1;
        }

        .inline-url-form, .inline-criteria-form {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .url-icon { color: var(--accent); }
        .criteria-icon { color: #c084fc; }

        .url-text-input, .criteria-text-input {
          flex: 1;
          font-size: 14px;
          background: transparent;
          border: none;
          padding: 4px 6px;
          box-shadow: none !important;
        }

        .btn-mini {
          padding: 4px 10px;
          font-size: 12.5px;
        }

        .prompt-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-left-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .action-pill-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-strong);
          background-color: var(--bg-surface-hover);
        }

        .pill-active {
          color: #ffffff;
          border-color: var(--accent);
          background-color: var(--accent-subtle);
        }

        .footer-right-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .depth-pills-group {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 3px;
        }

        .depth-btn {
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .depth-btn:hover {
          color: var(--text-primary);
        }

        .depth-active {
          background-color: var(--accent);
          color: #ffffff !important;
        }

        .submit-research-btn {
          padding: 9px 18px;
          font-size: 14.5px;
          font-weight: 600;
        }

        .unified-footnote {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
        }

        .footnote-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .fn-icon {
          color: var(--accent);
        }

        .footnote-item strong {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .prompt-footer-row {
            flex-direction: column;
            align-items: stretch;
          }
          .footer-right-actions {
            justify-content: space-between;
          }
          .submit-research-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};
