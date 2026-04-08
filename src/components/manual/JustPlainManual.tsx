"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useManualStore } from '../../stores/useManualStore';
import manualDataRaw from '../../data/jpm-content.json';
import { JPEPlayground } from './JPEPlayground';
import './JustPlainManual.css';

interface ManualItem {
  id: string;
  title: string;
  content: string;
  playground?: string;
  context?: string;
}

interface ManualSection {
  id: string;
  title: string;
  content: string;
  items: ManualItem[];
}

const manualData = manualDataRaw as { version: string; lastUpdated: string; sections: ManualSection[] };

// JPEPlayground is now imported from JPEPlayground.tsx

export const JustPlainManual: React.FC = () => {
  const {
    activeSectionId: _activeSectionId,
    activeItemId,
    searchQuery,
    contextAnchor,
    setActiveSection,
    setActiveItem,
    setSearchQuery
  } = useManualStore();

  const contentRef = useRef<HTMLDivElement>(null);
  const [_isSearching, setIsSearching] = useState(false);

  // Filter content based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery) return manualData.sections;
    
    setIsSearching(true);
    return manualData.sections.map((section: ManualSection) => ({
      ...section,
      items: section.items.filter((item: ManualItem) => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter((section: ManualSection) => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      section.items.length > 0
    );
  }, [searchQuery]);

  // Handle Context-Aware Anchoring
  useEffect(() => {
    if (contextAnchor) {
      const section = manualData.sections.find(s => 
        s.items.some(i => i.context === contextAnchor)
      );
      if (section) {
        setActiveSection(section.id);
        const item = section.items.find(i => i.context === contextAnchor);
        if (item) setActiveItem(item.id);
      }
    }
  }, [contextAnchor, setActiveSection, setActiveItem]);

  // Scroll to active item
  useEffect(() => {
    if (activeItemId && contentRef.current) {
      const element = document.getElementById(`jpm-item-${activeItemId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeItemId]);

  return (
    <div className="jpm-container">
      {/* Sidebar Navigation */}
      <aside className="jpm-sidebar">
        <div className="jpm-search-container">
          <input 
            type="text" 
            className="jpm-search-input" 
            placeholder="Search the Manual..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <nav className="jpm-nav">
          {filteredSections.map((section: ManualSection) => (
            <div key={section.id} className="jpm-nav-section">
              <h3 className="jpm-nav-title">{section.title}</h3>
              {section.items.map((item: ManualItem) => (
                <div 
                  key={item.id} 
                  className={`jpm-nav-item ${activeItemId === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(section.id);
                    setActiveItem(item.id);
                  }}
                >
                  {item.title}
                </div>
              ))}
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
              No help articles found.
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="jpm-content" ref={contentRef}>
        <article className="jpm-article">
          {filteredSections.map((section: ManualSection) => (
            <div key={section.id} className="jpm-section-block">
              <header className="jpm-header">
                <span className="jpm-badge">{section.title}</span>
                <h1 className="jpm-h1">{section.title}</h1>
                <p className="jpm-p">{section.content}</p>
              </header>

              {section.items.map((item: ManualItem) => (
                <div 
                  key={item.id} 
                  id={`jpm-item-${item.id}`}
                  className="jpm-item-container"
                >
                  <h2 className="jpm-h2">{item.title}</h2>
                  <div 
                    className="jpm-p" 
                    dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} 
                  />
                  
                  {item.playground && (
                    <JPEPlayground initialCode={item.playground} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </article>
      </main>
    </div>
  );
};
