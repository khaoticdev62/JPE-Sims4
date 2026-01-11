import React from 'react';

interface SidebarProps {
  activeFile: string | null;
  onFileOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFile, onFileOpen }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>JPE Studio</h3>
      </div>
      <div className="file-actions">
        <button onClick={onFileOpen} className="btn btn-primary">
          Open File
        </button>
        <button className="btn btn-secondary">
          New Project
        </button>
      </div>
      <div className="file-explorer">
        <h4>Project Files</h4>
        <ul className="file-list">
          <li className={`file-item ${activeFile === 'example.jpe' ? 'active' : ''}`}>
            <span className="file-icon">📄</span>
            <span>example.jpe</span>
          </li>
          <li className="file-item">
            <span className="file-icon">📁</span>
            <span>interactions</span>
          </li>
          <li className="file-item">
            <span className="file-icon">📁</span>
            <span>buffs</span>
          </li>
          <li className="file-item">
            <span className="file-icon">📁</span>
            <span>traits</span>
          </li>
        </ul>
      </div>
      <div className="mod-elements">
        <h4>Mod Elements</h4>
        <ul className="element-list">
          <li className="element-item">
            <span className="element-icon">🎭</span>
            <span>Interactions (12)</span>
          </li>
          <li className="element-item">
            <span className="element-icon">💫</span>
            <span>Buffers (8)</span>
          </li>
          <li className="element-item">
            <span className="element-icon">🧬</span>
            <span>Traits (5)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;