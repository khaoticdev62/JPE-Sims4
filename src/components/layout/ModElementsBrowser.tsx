"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronRight, Layers, Zap, Heart, Star, HelpCircle, AlertCircle } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { discoverElements, groupByCategory, ModElement, ElementCategory } from '@/utils/discoverElements';

// Icons for each category
const CATEGORY_ICONS: Record<ElementCategory, React.ReactNode> = {
  Interactions: <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
  Buffs: <Heart className="w-3.5 h-3.5 text-green-400 shrink-0" />,
  Traits: <Star className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
  Other: <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
};

const CATEGORY_ORDER: ElementCategory[] = ['Interactions', 'Buffs', 'Traits', 'Other'];

interface CategorySectionProps {
  category: ElementCategory;
  elements: ModElement[];
  searchQuery: string;
  onElementClick: (element: ModElement) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  elements,
  searchQuery,
  onElementClick,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const filtered = useMemo(() => {
    if (!searchQuery) return elements;
    const lowerQuery = searchQuery.toLowerCase();
    return elements.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }, [elements, searchQuery]);

  // Don't render category if there are no results after filtering
  if (filtered.length === 0) return null;

  return (
    <div className="mb-1">
      {/* Category Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-background-tertiary/40 transition-all duration-fast ease-premium rounded select-none"
      >
        {isOpen ? (
          <ChevronDown className="w-3 h-3 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0" />
        )}
        {CATEGORY_ICONS[category]}
        <span className="flex-1 text-left">{category}</span>
        <span className="text-xs font-normal text-text-secondary bg-background-tertiary px-1.5 py-0.5 rounded-full">
          {filtered.length}
        </span>
      </button>

      {/* Element List */}
      {isOpen && (
        <div className="mt-0.5">
          {filtered.map((element) => (
            <button
              key={element.id}
              onClick={() => onElementClick(element)}
              title={element.path}
              className="w-full flex items-center gap-2 px-4 py-1 text-sm text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary transition-all duration-fast ease-premium text-left truncate rounded"
            >
              {CATEGORY_ICONS[category]}
              <span className="truncate">{element.name}</span>
              <span className="ml-auto shrink-0 text-xs text-text-secondary opacity-50 font-mono">
                {element.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ModElementsBrowser: React.FC = () => {
  const { currentProject, loadContent } = useProjectStore();
  const { openTab } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const files = currentProject?.files || [];

  // Memoize element discovery to prevent recursive traversal OR expensive mapping on every keystroke
  const allElements = useMemo(() => discoverElements(files), [files]);
  const grouped = useMemo(() => groupByCategory(allElements), [allElements]);

  const handleElementClick = async (element: ModElement) => {
    try {
      setError(null);
      // Load content via official store for centralized persistence
      await loadContent(element.id);
      
      // Open tab following official Sidebar pattern
      openTab({
        id: `tab-${element.id}`,
        fileId: element.id,
        name: element.name,
        isDirty: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Cannot open ${element.name}`;
      console.error('[ModElementsBrowser] Failed to open element:', msg);
      setError(msg);
    }
  };

  const hasAnyResults = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return CATEGORY_ORDER.some((cat) => {
      const items = grouped[cat];
      return searchQuery
        ? items.some((e) => e.name.toLowerCase().includes(lowerQuery))
        : items.length > 0;
    });
  }, [grouped, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="px-2 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
          <input
            id="elements-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery(''); }}
            placeholder="Search elements…"
            className="w-full bg-background-tertiary text-text-primary text-xs pl-7 pr-7 py-1.5 rounded border border-border-subtle focus:outline-none focus:border-accent-primary placeholder-text-secondary/50 transition-all duration-fast ease-premium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="mx-2 mb-2 flex items-center gap-1.5 text-xs text-red-400 bg-red-900/10 border border-red-900/30 rounded px-2 py-1 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Element Categories */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
        {!currentProject ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 text-text-secondary italic">
            <Layers className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">Open a project to browse mod elements.</p>
          </div>
        ) : !hasAnyResults ? (
          <div className="flex items-center justify-center h-20 text-text-secondary italic text-xs">
            No elements match &quot;{searchQuery}&quot;
          </div>
        ) : (
          CATEGORY_ORDER.map((category) => (
            <CategorySection
              key={category}
              category={category}
              elements={grouped[category]}
              searchQuery={searchQuery}
              onElementClick={handleElementClick}
            />
          ))
        )}
      </div>
    </div>
  );
};
