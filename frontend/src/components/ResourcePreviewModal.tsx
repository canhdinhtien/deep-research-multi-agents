import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import type { SourceItem } from '../types';
import { formatFileSize } from '../utils/storage';

interface ResourcePreviewModalProps {
  source: SourceItem | null;
  onClose: () => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  source,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const handleCopy = () => {
    if (!source.content) return;
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="preview-top">
          <div className="preview-header-meta">
            <span className="preview-file-name" title={source.name}>
              {source.name}
            </span>
            <span className="preview-file-sub">
              {source.type.toUpperCase()}
              {source.size ? ` · ${formatFileSize(source.size)}` : ''}
              {source.addedAt ? ` · Added at ${source.addedAt}` : ''}
            </span>
          </div>

          <div className="preview-actions-row">
            {source.content && (
              <button type="button" className="btn-secondary" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="preview-body">
          {source.url && (
            <div className="preview-url-box">
              <span className="preview-url-label">Source Link:</span>
              <a href={source.url} target="_blank" rel="noreferrer" className="preview-url-link">
                <span>{source.url}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          <div className="preview-text-box">
            <pre className="preview-raw-text">
              {source.content || 'No extracted text content available for this item.'}
            </pre>
          </div>
        </div>
      </div>

      <style>{`
        .preview-dialog {
          max-width: 780px;
        }

        .preview-top {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background-color: var(--bg-surface-subtle);
        }

        .preview-header-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .preview-file-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-file-sub {
          font-size: 12.5px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .preview-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preview-body {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .preview-url-box {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          background-color: var(--bg-surface-subtle);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .preview-url-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .preview-url-link {
          color: var(--accent);
          text-decoration: underline;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preview-text-box {
          background-color: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 18px;
          overflow-x: auto;
        }

        .preview-raw-text {
          font-family: var(--font-mono);
          font-size: 13.5px;
          line-height: 1.65;
          color: #e2e8f0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};
