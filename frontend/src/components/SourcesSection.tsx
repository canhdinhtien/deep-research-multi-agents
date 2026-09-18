import React, { useState, useRef } from 'react';
import { Plus, X, Upload, FileText, Globe, Eye } from 'lucide-react';
import type { SourceItem, SourceType } from '../types';
import { generateId, formatFileSize } from '../utils/storage';

interface SourcesSectionProps {
  sources: SourceItem[];
  onAddSource: (source: SourceItem) => void;
  onRemoveSource: (id: string) => void;
  onPreviewSource: (source: SourceItem) => void;
  disabled?: boolean;
}

export const SourcesSection: React.FC<SourcesSectionProps> = ({
  sources,
  onAddSource,
  onRemoveSource,
  onPreviewSource,
  disabled
}) => {
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

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
        content = `[Attached document: ${file.name} — ${formatFileSize(file.size)}]`;
      }

      onAddSource({
        id: generateId('src-file'),
        name: file.name,
        type,
        size: file.size,
        content,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
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
      onAddSource({
        id: generateId('src-web'),
        name: displayName,
        type: 'web',
        url: formatted,
        content: `[Source URL: ${formatted}]`,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setUrlInput('');
      setIsUrlInputOpen(false);
    } catch {
      alert('Please enter a valid URL.');
    }
  };

  const formatTypeLabel = (source: SourceItem) => {
    if (source.type === 'pdf') {
      return source.size ? `PDF · ${formatFileSize(source.size)}` : 'PDF';
    }
    if (source.type === 'docx') {
      return source.size ? `DOCX · ${formatFileSize(source.size)}` : 'DOCX';
    }
    if (source.type === 'markdown') return 'Markdown';
    if (source.type === 'web') return 'Web';
    return 'Text';
  };

  const hasSources = sources.length > 0;

  return (
    <section className="sources-section">
      <div className="section-header">
        <h2 className="section-heading">Sources</h2>
        <div className="section-actions">
          <button
            type="button"
            className="btn-action-inline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Plus size={14} />
            <span>Add files</span>
          </button>
          <button
            type="button"
            className="btn-action-inline"
            onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
            disabled={disabled}
          >
            <Plus size={14} />
            <span>Add links</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.json"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* URL Input Form */}
      {isUrlInputOpen && (
        <form onSubmit={handleAddLink} className="url-inline-form">
          <input
            type="url"
            placeholder="https://example.com/article or arxiv.org/abs/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="url-inline-input"
            autoFocus
            disabled={disabled}
          />
          <button type="submit" className="btn-secondary btn-sm" disabled={disabled || !urlInput.trim()}>
            Add
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => setIsUrlInputOpen(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Sources list (compact rows) */}
      {hasSources ? (
        <div
          className={`sources-list ${isDragging ? 'sources-dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled) handleFiles(e.dataTransfer.files);
          }}
        >
          {sources.map((source) => (
            <div key={source.id} className="source-row">
              <div className="source-main-info" onClick={() => onPreviewSource(source)}>
                <span className="source-icon">
                  {source.type === 'web' ? <Globe size={14} /> : <FileText size={14} />}
                </span>
                <span className="source-name" title={source.name}>
                  {source.name}
                </span>
              </div>

              <div className="source-meta">
                <span className="source-type-tag">{formatTypeLabel(source)}</span>
                <button
                  type="button"
                  className="source-preview-btn"
                  onClick={() => onPreviewSource(source)}
                  title="Preview extracted content"
                >
                  <Eye size={13} />
                </button>
                <button
                  type="button"
                  className="source-delete-btn"
                  onClick={() => onRemoveSource(source.id)}
                  disabled={disabled}
                  title="Remove source"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`empty-sources-drop ${isDragging ? 'drop-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} className="drop-icon" />
          <span>Drop PDFs, DOCX, Markdown, or text files here to ground the research</span>
        </div>
      )}

      <style>{`
        .sources-section {
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

        .section-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .url-inline-form {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .url-inline-input {
          flex: 1;
          font-size: 13px;
          padding: 5px 8px;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-surface);
        }

        .sources-dragging {
          border-color: var(--accent);
        }

        .source-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-bottom: 1px solid var(--border-subtle);
          transition: background-color var(--transition-fast);
        }

        .source-row:last-child {
          border-bottom: none;
        }

        .source-row:hover {
          background-color: var(--bg-surface-hover);
        }

        .source-main-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          cursor: pointer;
        }

        .source-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .source-name {
          font-size: 13px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .source-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .source-type-tag {
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .source-preview-btn, .source-delete-btn {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: var(--radius-sm);
        }

        .source-preview-btn:hover {
          color: var(--text-primary);
        }

        .source-delete-btn:hover {
          color: var(--status-danger);
        }

        .empty-sources-drop {
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .empty-sources-drop:hover, .drop-active {
          border-color: var(--accent);
          color: var(--text-secondary);
          background-color: var(--accent-subtle);
        }

        .drop-icon {
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
};
