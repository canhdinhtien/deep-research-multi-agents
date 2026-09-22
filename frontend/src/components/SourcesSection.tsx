import React, { useState, useRef } from 'react';
import { Plus, X, Upload, FileText, Globe, Eye, Link as LinkIcon } from 'lucide-react';
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
        content = `[Tài liệu đính kèm: ${file.name} — Dung lượng: ${formatFileSize(file.size)}]`;
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
        content: `[Liên kết nguồn tham khảo: ${formatted}]`,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setUrlInput('');
      setIsUrlInputOpen(false);
    } catch {
      alert('Vui lòng nhập đường dẫn URL hợp lệ.');
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
    if (source.type === 'web') return 'Web URL';
    return 'Văn bản Text';
  };

  const hasSources = sources.length > 0;

  return (
    <section className="sources-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <h2 className="section-heading">Tài liệu & Nguồn dữ liệu đính kèm</h2>
          <span className="section-subheading">
            Tải lên tài liệu PDF, DOCX, Markdown hoặc liên kết web để các Agents đối soát dữ liệu thực tế.
          </span>
        </div>
        <div className="section-actions">
          <button
            type="button"
            className="btn-action-inline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Plus size={16} />
            <span>Thêm tệp</span>
          </button>
          <button
            type="button"
            className="btn-action-inline"
            onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
            disabled={disabled}
          >
            <LinkIcon size={16} />
            <span>Thêm liên kết URL</span>
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
            placeholder="Nhập đường dẫn URL (ví dụ: https://example.com/paper hoặc arxiv.org/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="url-inline-input"
            autoFocus
            disabled={disabled}
          />
          <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} disabled={disabled || !urlInput.trim()}>
            Thêm
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIsUrlInputOpen(false)}
          >
            Hủy
          </button>
        </form>
      )}

      {/* Sources list */}
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
                  {source.type === 'web' ? <Globe size={18} /> : <FileText size={18} />}
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
                  title="Xem trước nội dung"
                >
                  <Eye size={16} />
                  <span>Xem</span>
                </button>
                <button
                  type="button"
                  className="source-delete-btn"
                  onClick={() => onRemoveSource(source.id)}
                  disabled={disabled}
                  title="Xóa tài liệu"
                >
                  <X size={16} />
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
          <div className="drop-icon-box">
            <Upload size={22} className="drop-icon" />
          </div>
          <div className="drop-text-col">
            <span className="drop-title">Kéo thả tệp PDF, DOCX, Markdown hoặc TXT vào đây</span>
            <span className="drop-hint">Hoặc nhấn để chọn tài liệu từ máy tính của bạn</span>
          </div>
        </div>
      )}

      <style>{`
        .sources-section {
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

        .section-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .url-inline-form {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .url-inline-input {
          flex: 1;
          font-size: 14.5px;
          padding: 8px 12px;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background-color: var(--bg-surface);
        }

        .sources-dragging {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .source-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
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
          gap: 12px;
          min-width: 0;
          cursor: pointer;
        }

        .source-icon {
          color: var(--accent);
          display: flex;
          align-items: center;
        }

        .source-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .source-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .source-type-tag {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          background-color: var(--bg-surface-subtle);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .source-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          padding: 5px 8px;
          font-size: 13px;
          border-radius: var(--radius-sm);
        }

        .source-preview-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-active);
        }

        .source-delete-btn {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 5px;
          border-radius: var(--radius-sm);
        }

        .source-delete-btn:hover {
          color: var(--status-danger);
          background-color: rgba(239, 68, 68, 0.15);
        }

        .empty-sources-drop {
          border: 2px dashed var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          cursor: pointer;
          transition: all var(--transition-fast);
          background-color: var(--bg-surface);
        }

        .empty-sources-drop:hover, .drop-active {
          border-color: var(--accent);
          background-color: var(--accent-subtle);
        }

        .drop-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-icon {
          color: var(--accent);
        }

        .drop-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }

        .drop-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .drop-hint {
          font-size: 13.5px;
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
};
