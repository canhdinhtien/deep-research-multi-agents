import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FolderTree, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  Folder,
  Layers,
  ChevronRight,
  Hash
} from 'lucide-react';
import type { KnowledgeTreeData, KnowledgeNode } from '../../types';

interface KnowledgeTreeViewerProps {
  knowledgeTree: KnowledgeTreeData;
  topic: string;
}

export const KnowledgeTreeViewer: React.FC<KnowledgeTreeViewerProps> = ({ knowledgeTree, topic }) => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(
    knowledgeTree.nodes[0] || null
  );
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Group vault files by folder
  const folders = React.useMemo(() => {
    const map: Record<string, typeof knowledgeTree.vaultFiles> = {};
    knowledgeTree.vaultFiles.forEach((file) => {
      const folderName = file.folder || 'Root';
      if (!map[folderName]) map[folderName] = [];
      map[folderName].push(file);
    });
    return map;
  }, [knowledgeTree.vaultFiles]);

  const handleCopyNodeContent = () => {
    if (!selectedNode?.content) return;
    navigator.clipboard.writeText(selectedNode.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVaultZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const vaultFolderName = `${topic.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-obsidian-vault`;
      const rootFolder = zip.folder(vaultFolderName) || zip;

      // Add each vault file to the ZIP
      knowledgeTree.vaultFiles.forEach((file) => {
        rootFolder.file(file.path, file.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vaultFolderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate vault zip:', err);
      alert('Failed to generate vault archive: ' + err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="tree-viewer-layout">
      {/* Top action header for Obsidian Knowledge Tree */}
      <div className="tree-top-banner">
        <div className="banner-info">
          <div className="banner-tag">
            <Sparkles size={14} />
            <span>Obsidian Knowledge Tree</span>
          </div>
          <h2 className="banner-title">Knowledge Tree & Obsidian Graph</h2>
          <p className="banner-desc">
            Synthesized insights are structured into modular conceptual notes, bidirectional <code>[[wikilinks]]</code>, and an Obsidian-ready folder hierarchy.
          </p>
        </div>

        <div className="banner-actions">
          <button 
            type="button" 
            className="btn-obsidian"
            onClick={handleDownloadVaultZip}
            disabled={isExporting}
          >
            <Download size={16} />
            <span>{isExporting ? 'Packaging Vault...' : 'Download Obsidian Vault (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main split view: Left Vault Explorer / Node Tree, Right Note Preview */}
      <div className="tree-split-grid">
        {/* Left Column: Interactive Tree & Vault Files */}
        <div className="tree-left-panel">
          <div className="panel-heading">
            <FolderTree size={16} />
            <span>Vault Folder Structure ({knowledgeTree.vaultFiles.length} files)</span>
          </div>

          <div className="vault-file-tree">
            {Object.entries(folders).map(([folderName, files]) => (
              <div key={folderName} className="vault-folder-group">
                <div className="vault-folder-header">
                  <Folder size={15} className="folder-icon" />
                  <span className="folder-name">{folderName}</span>
                  <span className="folder-badge">{files.length}</span>
                </div>

                <div className="vault-folder-files">
                  {files.map((file) => {
                    const matchedNode = knowledgeTree.nodes.find(n => n.filePath === file.path);
                    const isSelected = selectedNode?.filePath === file.path;

                    return (
                      <div
                        key={file.path}
                        className={`vault-file-item ${isSelected ? 'vault-file-active' : ''}`}
                        onClick={() => {
                          if (matchedNode) {
                            setSelectedNode(matchedNode);
                          } else {
                            setSelectedNode({
                              id: file.path,
                              title: file.name,
                              category: file.folder,
                              summary: 'Extracted source reference note.',
                              links: [topic],
                              tags: ['source'],
                              filePath: file.path,
                              content: file.content
                            });
                          }
                        }}
                      >
                        <FileText size={14} className="file-icon" />
                        <span className="file-name">{file.name}</span>
                        {matchedNode && <ChevronRight size={13} className="file-arrow" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Node Summary List */}
          <div className="panel-heading" style={{ marginTop: '20px' }}>
            <Layers size={16} />
            <span>Knowledge Nodes ({knowledgeTree.nodes.length} nodes)</span>
          </div>

          <div className="nodes-pills-list">
            {knowledgeTree.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  className={`node-card-pill ${isSelected ? 'node-pill-active' : ''}`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="node-pill-top">
                    <span className="node-pill-category">{node.category}</span>
                    <span className="node-pill-tag">[[{node.title}]]</span>
                  </div>
                  <p className="node-pill-summary">{node.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Node Note Content & Wikilinks */}
        <div className="tree-right-panel">
          {selectedNode ? (
            <div className="note-preview-wrapper">
              <div className="note-preview-header">
                <div className="note-header-info">
                  <span className="note-file-path">{selectedNode.filePath}</span>
                  <h3 className="note-title">{selectedNode.title}</h3>
                </div>

                <div className="note-header-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleCopyNodeContent}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                  </button>
                </div>
              </div>

              {/* Tags & Wikilinks preview strip */}
              <div className="note-meta-strip">
                <div className="meta-group">
                  <span className="meta-label">Tags:</span>
                  <div className="tags-row">
                    {selectedNode.tags.map(t => (
                      <span key={t} className="obsidian-tag">
                        <Hash size={12} />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {selectedNode.links.length > 0 && (
                  <div className="meta-group">
                    <span className="meta-label">Wikilinks:</span>
                    <div className="links-row">
                      {selectedNode.links.map(l => (
                        <span key={l} className="wikilink-badge">
                          [[{l}]]
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Markdown Content Raw Preview */}
              <div className="note-content-preview">
                <pre className="markdown-raw-code">
                  {selectedNode.content || 'Note content initializing...'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="no-node-selected">
              <FileText size={32} />
              <span>Select a knowledge node on the left to inspect its Obsidian note.</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tree-viewer-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tree-top-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%);
          border: 1px solid var(--obsidian-purple-border);
          border-radius: var(--radius-lg);
          gap: 20px;
        }

        .banner-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 680px;
        }

        .banner-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #c084fc;
          background-color: var(--obsidian-purple-subtle);
          padding: 3px 10px;
          border-radius: 20px;
          width: fit-content;
        }

        .banner-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .banner-desc {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .banner-desc code {
          font-family: var(--font-mono);
          font-size: 13px;
          color: #e9d5ff;
          background-color: rgba(168, 85, 247, 0.2);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .tree-split-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: flex-start;
        }

        .tree-left-panel {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panel-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .vault-file-tree {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vault-folder-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vault-folder-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 4px 6px;
        }

        .folder-icon {
          color: #fbbf24;
        }

        .folder-badge {
          font-size: 11px;
          font-family: var(--font-mono);
          background-color: var(--bg-surface-subtle);
          color: var(--text-muted);
          padding: 1px 6px;
          border-radius: 10px;
          margin-left: auto;
        }

        .vault-folder-files {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-left: 16px;
          border-left: 1px dashed var(--border-medium);
          margin-left: 10px;
        }

        .vault-file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .vault-file-item:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .vault-file-active {
          background-color: var(--accent-subtle);
          color: #ffffff;
          font-weight: 600;
          border: 1px solid var(--accent-border);
        }

        .file-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-arrow {
          color: var(--text-muted);
        }

        .nodes-pills-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 380px;
          overflow-y: auto;
        }

        .node-card-pill {
          padding: 12px;
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: all var(--transition-fast);
        }

        .node-card-pill:hover {
          border-color: var(--border-strong);
          background-color: var(--bg-surface-hover);
        }

        .node-pill-active {
          border-color: var(--obsidian-purple);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
        }

        .node-pill-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .node-pill-category {
          font-size: 11.5px;
          font-weight: 600;
          color: #c084fc;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .node-pill-tag {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .node-pill-summary {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Right note preview panel */
        .tree-right-panel {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          min-height: 600px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .note-preview-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .note-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface-subtle);
          gap: 16px;
        }

        .note-header-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .note-file-path {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--text-muted);
        }

        .note-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .note-meta-strip {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-input);
        }

        .meta-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .meta-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .tags-row, .links-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .obsidian-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          font-weight: 600;
          color: #a855f7;
          background-color: rgba(168, 85, 247, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .wikilink-badge {
          font-family: var(--font-mono);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent);
          background-color: var(--accent-subtle);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--accent-border);
        }

        .note-content-preview {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .markdown-raw-code {
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1.7;
          color: #e2e8f0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .no-node-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 450px;
          color: var(--text-muted);
          font-size: 15px;
        }

        @media (max-width: 960px) {
          .tree-split-grid {
            grid-template-columns: 1fr;
          }
          .tree-top-banner {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};
