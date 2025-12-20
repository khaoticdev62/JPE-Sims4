"""
Sorting and Filtering logic for CC Manager Plugin.
"""

from __future__ import annotations

from typing import List, Dict, Optional, Any
from .file_indexer import CCRecord


class CCFilters:
    """
    Handles sorting and filtering of CC records.
    """

    def __init__(self) -> None:
        self.category_filter: str = "All"
        self.file_type_filter: str = "All"
        self.creator_filter: str = ""
        self.search_text: str = ""
        self.sort_by: str = "name"
        self.sort_ascending: bool = True

    def apply(self, records: Dict[str, CCRecord]) -> List[CCRecord]:
        """Apply all filters and sorting."""
        filtered = []
        
        for name, record in records.items():
            # 1. Category Filter
            if self.category_filter != "All" and record.category != self.category_filter:
                continue
                
            # 2. Creator Filter
            if self.creator_filter and self.creator_filter.lower() not in (record.creator or "").lower():
                continue
                
            # 3. Search Filter
            if self.search_text:
                search_lower = self.search_text.lower()
                if search_lower not in name.lower() and \
                   search_lower not in (record.creator or "").lower() and \
                   not any(search_lower in tag.lower() for tag in record.tags):
                    continue
                    
            filtered.append(record)
            
        # Sorting
        return self._sort_records(filtered)

    def _sort_records(self, records: List[CCRecord]) -> List[CCRecord]:
        """Sort records based on criteria."""
        if self.sort_by == "name":
            records.sort(key=lambda r: r.name.lower(), reverse=not self.sort_ascending)
        elif self.sort_by == "creator":
            records.sort(key=lambda r: (r.creator or "").lower(), reverse=not self.sort_ascending)
        elif self.sort_by == "size":
            records.sort(key=lambda r: r.total_size, reverse=not self.sort_ascending)
        elif self.sort_by == "category":
            records.sort(key=lambda r: r.category.lower(), reverse=not self.sort_ascending)
        elif self.sort_by == "date":
            records.sort(key=lambda r: r.last_modified, reverse=not self.sort_ascending)
            
        return records
