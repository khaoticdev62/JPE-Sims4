import React from 'react';

interface PreviewPanelProps {
  content: string;
  isLoading?: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, isLoading = false }) => {
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h4>XML Preview</h4>
        <div className="preview-controls">
          <button className="btn btn-small">Copy</button>
          <button className="btn btn-small">Export</button>
        </div>
      </div>
      <div className="preview-content">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Transforming JPE to XML...</p>
          </div>
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;