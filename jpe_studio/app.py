from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import traceback
from datetime import datetime, timezone
from pathlib import Path
from tkinter import BooleanVar, StringVar, Tk, Toplevel, filedialog, messagebox, ttk
from tkinter.scrolledtext import ScrolledText

from jpe_sims4.project import Project
from jpe_sims4.glossary import glossary_entry_id, glossary_hits
from jpe_sims4.glossary.io import export_glossary_csv, import_glossary_csv
from jpe_sims4.reporting import filter_diagnostics, summarize_diagnostics
from jpe_sims4.storage import load_project, save_project
from jpe_sims4.workflow import estimate_project_segments, extract_project, scan_project
from jpe_sims4.workspace import compute_progress, filter_segments, next_untranslated_id, sort_segments, update_segment_editor_fields
from jpe_sims4.build import build_to_folder, build_to_zip
from jpe_sims4.tm import Suggestion, build_tm_from_segments, suggest
from jpe_sims4.validate import extract_placeholders, validate_project_segments, validate_segment
from jpe_sims4.plugins import plugins

from jpe_studio.theme import THEME, apply_theme


def _startup_log_path() -> Path:
    return (Path.cwd() / ".tmp" / "studio_startup.log").expanduser()


def _write_startup_log(text: str) -> None:
    try:
        p = _startup_log_path()
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
    except Exception:
        return


class StudioApp:
    """
    Tkinter-based Studio UI.

    Note: This module is intentionally lightweight and keeps the core translator engine
    (jpe_sims4/*) free of UI dependencies.
    """

    def __init__(self, root: Tk) -> None:
        self.root = root
        self.root.title("JPE Studio")
        apply_theme(self.root)
        try:
            self.root.geometry("1180x760")
            self.root.minsize(980, 640)
        except Exception:
            pass

        try:
            self._debug_theme_name = ttk.Style(master=self.root).theme_use()
        except Exception:
            self._debug_theme_name = "(unknown)"
        self._debug_app_path = str(Path(__file__).resolve())

        self.project: Project | None = None
        self.project_file_path: Path | None = None

        self.autosave_enabled = True
        self._recent_project_paths: list[str] = self._load_recent_projects()

        self.segment_search = StringVar(value="")
        self.segment_status_filter = StringVar(value="All")
        self.segment_file_filter: str | None = None
        self.segment_status_value = StringVar(value="new")
        self._current_segment_id: str | None = None
        self._visible_segments: list[dict[str, object]] = []

        self.diag_severity_filter = StringVar(value="All")
        self.diag_category_filter = StringVar(value="All")
        self.diag_search_value = StringVar(value="")
        self.diag_only_segment_linked = BooleanVar(value=False)
        self._diag_rows: list[dict[str, object]] = []

        self._last_build_output_path: str | None = None
        self._segment_loaded_target_empty = True
        self._tm_suggestions: list[Suggestion] = []
        self._target_change_after_id: str | None = None

        self.notebook = ttk.Notebook(root)
        self.notebook.pack(fill="both", expand=True)

        self.home_tab = ttk.Frame(self.notebook)
        self.project_tab = ttk.Frame(self.notebook)
        self.workspace_tab = ttk.Frame(self.notebook)
        self.qa_tab = ttk.Frame(self.notebook)
        self.build_tab = ttk.Frame(self.notebook)
        self.glossary_tab = ttk.Frame(self.notebook)
        self.plugins_tab = ttk.Frame(self.notebook)
        self.settings_tab = ttk.Frame(self.notebook)
        self.ts4rebels_tab = ttk.Frame(self.notebook)

        self.notebook.add(self.home_tab, text="Home")
        self.notebook.add(self.project_tab, text="Project")
        self.notebook.add(self.ts4rebels_tab, text="TS4Rebels")
        self.notebook.add(self.workspace_tab, text="Workspace")
        self.notebook.add(self.qa_tab, text="QA")
        self.notebook.add(self.build_tab, text="Build/Export")
        self.notebook.add(self.glossary_tab, text="Glossary")
        self.notebook.add(self.plugins_tab, text="Plugins")
        self.notebook.add(self.settings_tab, text="Settings")

        self._build_home_tab()
        self._build_project_tab()
        self._build_ts4rebels_tab()
        self._build_workspace_tab()
        self._build_qa_tab()
        self._build_build_tab()
        self._build_glossary_tab()
        self._build_plugins_tab()
        self._build_settings_tab()
        self._build_status_bar()
        self._render_empty_state()
        self._bind_shortcuts()
        self.root.after(60, self._init_layout_sashes)

    def _set_status(self, text: str) -> None:
        try:
            self.status_label.config(text=text)
        except Exception:
            pass

    def _style_text_widget(self, widget: ScrolledText, *, readonly: bool) -> None:
        try:
            widget.configure(
                background=THEME.surface,
                foreground=THEME.text,
                insertbackground=THEME.text,
                selectbackground=THEME.primary,
                selectforeground="#ffffff",
                highlightthickness=1,
                highlightbackground=THEME.border,
                highlightcolor=THEME.primary,
                relief="flat",
                padx=10,
                pady=8,
            )
            if readonly:
                widget.configure(background=THEME.surface_2, foreground=THEME.text)
        except Exception:
            return

    def _run_task(self, *, title: str, fn, on_success) -> None:
        self._set_status(title)

        def worker() -> None:
            err: Exception | None = None
            out: object | None = None
            try:
                out = fn()
            except Exception as e:  # pragma: no cover
                err = e

            def done() -> None:
                if err is not None:
                    self._set_status("Error.")
                    messagebox.showerror("JPE Studio", f"{title}\n\n{err}")
                    return
                self._set_status("Ready.")
                on_success(out)

            self.root.after(0, done)

        threading.Thread(target=worker, daemon=True).start()

    def _set_diag_severity(self, sev: str) -> None:
        self.diag_severity_filter.set(sev)
        self._render_diagnostics()

    def _recents_file_path(self) -> Path:
        return (Path.cwd() / ".tmp" / "studio_recents.json").expanduser()

    def _load_recent_projects(self) -> list[str]:
        path = self._recents_file_path()
        try:
            if not path.exists():
                return []
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, list):
                out = [str(x) for x in data if str(x).strip()]
                return out[:50]
        except Exception:
            return []
        return []

    def _save_recent_projects(self) -> None:
        path = self._recents_file_path()
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(self._recent_project_paths[:50], indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        except Exception:
            return

    def _push_recent_project(self, project_json: Path) -> None:
        try:
            p = str(project_json.expanduser().resolve())
        except Exception:
            p = str(project_json)
        if not p.strip():
            return
        self._recent_project_paths = [x for x in self._recent_project_paths if str(x) != p]
        self._recent_project_paths.insert(0, p)
        self._recent_project_paths = self._recent_project_paths[:50]
        self._save_recent_projects()
        self._render_recents()

    def _build_status_bar(self) -> None:
        bar = ttk.Frame(self.root, style="JPE.TFrame")
        bar.pack(fill="x", side="bottom")
        self.status_label = ttk.Label(bar, text="Ready.", anchor="w", style="JPE.Muted.TLabel")
        self.status_label.pack(fill="x", padx=8, pady=4)

    def _init_layout_sashes(self) -> None:
        # Ensure new side panels are visible by default (Panedwindow can start collapsed on some setups).
        panes = getattr(self, "workspace_panes", None)
        if panes is None:
            return
        try:
            self.root.update_idletasks()
        except Exception:
            return
        try:
            total = int(panes.winfo_width() or self.root.winfo_width() or 1180)
        except Exception:
            total = 1180

        left_w = 380
        right_w = 380
        mid_w = max(total - left_w - right_w, 520)
        try:
            panes.sashpos(0, left_w)
            panes.sashpos(1, left_w + mid_w)
        except Exception:
            pass

    def _build_home_tab(self) -> None:
        container = ttk.Frame(self.home_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)

        top = ttk.Frame(container, style="JPE.TFrame")
        top.pack(fill="x")
        brand = ttk.Frame(top, style="JPE.TFrame")
        brand.pack(side="left", fill="x", expand=True)
        ttk.Label(brand, text="JPE Suite", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(brand, text="SIMS 4 TRANSLATION", style="JPE.Caption.TLabel").pack(anchor="w", pady=(2, 0))
        ttk.Button(top, text="New", style="JPE.Primary.TButton", command=self._open_import_wizard).pack(side="right")

        ttk.Label(container, text="Hello.", style="JPE.H1.TLabel").pack(anchor="w", pady=(16, 2))
        ttk.Label(container, text="Ready to localize some mods today?", style="JPE.Muted.TLabel").pack(anchor="w", pady=(0, 12))
        ttk.Label(container, text="Tip: Use Ctrl+J for Next Untranslated in Workspace.", style="JPE.Caption.TLabel").pack(
            anchor="w", pady=(0, 12)
        )

        search_row = ttk.Frame(container, style="JPE.TFrame")
        search_row.pack(fill="x", pady=(0, 14))
        self.home_search = StringVar(value="")
        ttk.Entry(search_row, textvariable=self.home_search, style="JPE.TEntry").pack(fill="x", expand=True)

        ttk.Label(container, text="Quick actions", style="JPE.Caption.TLabel").pack(anchor="w", pady=(0, 8))
        actions = ttk.Frame(container, style="JPE.TFrame")
        actions.pack(fill="x")
        ttk.Button(actions, text="Open Folder", style="JPE.Secondary.TButton", command=self._open_folder).pack(side="left")
        ttk.Button(actions, text="Open Zip", style="JPE.Secondary.TButton", command=self._open_zip).pack(side="left", padx=(10, 0))
        ttk.Button(actions, text="Open Project", style="JPE.Secondary.TButton", command=self._open_project_json).pack(
            side="left", padx=(10, 0)
        )
        ttk.Button(actions, text="Extract", style="JPE.Secondary.TButton", command=self._extract_segments).pack(side="left", padx=(16, 0))
        ttk.Button(actions, text="Save", style="JPE.Secondary.TButton", command=self._save_project).pack(side="left", padx=(10, 0))

        ttk.Label(container, text="Current project", style="JPE.Caption.TLabel").pack(anchor="w", pady=(18, 6))
        card = ttk.Frame(container, style="JPE.Card.TFrame")
        card.pack(fill="x")
        self.project_summary = ttk.Label(card, text="", justify="left", style="JPE.TLabel")
        self.project_summary.pack(fill="x", padx=12, pady=12)

        ttk.Label(container, text="Recent projects", style="JPE.Caption.TLabel").pack(anchor="w", pady=(18, 6))
        recents_card = ttk.Frame(container, style="JPE.Card.TFrame")
        recents_card.pack(fill="both", expand=True)
        self.recents_list = ttk.Treeview(recents_card, columns=("path",), show="headings", height=8, style="JPE.Treeview")
        self.recents_list.heading("path", text="Project JSON")
        self.recents_list.column("path", width=860, anchor="w")
        self.recents_list.pack(fill="both", expand=True, padx=12, pady=(12, 6))
        self.recents_list.bind("<Double-1>", lambda _e: self._open_selected_recent())

        recents_actions = ttk.Frame(recents_card, style="JPE.Card.TFrame")
        recents_actions.pack(fill="x", padx=12, pady=(0, 12))
        ttk.Button(recents_actions, text="Open Selected", style="JPE.Primary.TButton", command=self._open_selected_recent).pack(side="left")
        ttk.Button(recents_actions, text="Remove Selected", style="JPE.Secondary.TButton", command=self._remove_selected_recent).pack(
            side="left", padx=(10, 0)
        )
        ttk.Button(recents_actions, text="Clear All", style="JPE.Secondary.TButton", command=self._clear_all_recents).pack(
            side="left", padx=(10, 0)
        )

        self._render_recents()

        # Debug footer: if you see white/default UI, confirm this path + theme match the repo build.
        ttk.Label(
            container,
            text=f"Theme: {self._debug_theme_name}  |  app: {self._debug_app_path}",
            style="JPE.Caption.TLabel",
            justify="left",
        ).pack(anchor="w", pady=(12, 0))

    def _build_project_tab(self) -> None:
        container = ttk.Frame(self.project_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        ttk.Label(container, text="Project", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(container, text="Overview and key settings for the current project.", style="JPE.Muted.TLabel").pack(
            anchor="w", pady=(2, 12)
        )
        card = ttk.Frame(container, style="JPE.Card.TFrame")
        card.pack(fill="x")
        self.project_details = ttk.Label(card, text="", justify="left", style="JPE.TLabel")
        self.project_details.pack(fill="x", padx=12, pady=12)

    def _build_ts4rebels_tab(self) -> None:
        container = ttk.Frame(self.ts4rebels_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        ttk.Label(container, text="TS4Rebels", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(container, text="Offline vault + optional gated download (per-project).", style="JPE.Muted.TLabel").pack(
            anchor="w", pady=(2, 12)
        )
        card = ttk.Frame(container, style="JPE.Card.TFrame")
        card.pack(fill="x")
        ttk.Label(
            card,
            text="This screen is still a stub in this build.\nNext: add vault import, allowlist settings, and sync status.",
            justify="left",
            style="JPE.TLabel",
        ).pack(anchor="w", padx=12, pady=12)

    def _build_workspace_tab(self) -> None:
        container = ttk.Frame(self.workspace_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)

        header = ttk.Frame(container, style="JPE.TFrame")
        header.pack(fill="x", pady=(0, 12))
        ttk.Label(header, text="Workspace", style="JPE.H2.TLabel").pack(side="left")
        ttk.Label(header, text="Segments • Search • Edit • Review", style="JPE.Muted.TLabel").pack(side="left", padx=(10, 0))
        ttk.Button(header, text="Save Project", style="JPE.Secondary.TButton", command=self._save_project).pack(side="right")

        panes = ttk.Panedwindow(container, orient="horizontal")
        panes.pack(fill="both", expand=True)
        self.workspace_panes = panes

        left = ttk.Frame(panes, style="JPE.Surface.TFrame")
        mid = ttk.Frame(panes, style="JPE.TFrame")
        right = ttk.Frame(panes, style="JPE.Surface.TFrame")

        panes.add(left, weight=1)
        panes.add(mid, weight=3)
        panes.add(right, weight=1)
        try:
            panes.paneconfigure(left, minsize=360)
            panes.paneconfigure(mid, minsize=640)
            panes.paneconfigure(right, minsize=360)
        except Exception:
            pass

        ttk.Label(left, text="Search", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.segment_search_entry = ttk.Entry(left, textvariable=self.segment_search, width=34, style="JPE.TEntry")
        self.segment_search_entry.pack(fill="x", padx=12)
        self.segment_search_entry.bind("<KeyRelease>", lambda _e: self._render_segments())

        row = ttk.Frame(left, style="JPE.Surface.TFrame")
        row.pack(fill="x", pady=(10, 0), padx=12)
        ttk.Label(row, text="Status", style="JPE.Caption.TLabel").pack(side="left")
        status = ttk.Combobox(
            row,
            textvariable=self.segment_status_filter,
            values=["All", "new", "in_progress", "reviewed"],
            width=12,
            style="JPE.TCombobox",
        )
        status.pack(side="left", padx=(8, 0))
        status.bind("<<ComboboxSelected>>", lambda _e: self._render_segments())
        ttk.Button(row, text="Clear File Filter", style="JPE.Chip.TButton", command=self._clear_segment_file_filter).pack(
            side="left", padx=(10, 0)
        )

        self.segment_progress = ttk.Label(left, text="", justify="left", style="JPE.Muted.TLabel")
        self.segment_progress.pack(fill="x", padx=12, pady=(12, 6))

        self.segment_list = ttk.Treeview(left, columns=("status", "segment"), show="headings", height=22, style="JPE.Treeview")
        self.segment_list.heading("status", text="Status")
        self.segment_list.heading("segment", text="Segment")
        self.segment_list.column("status", width=90, anchor="w")
        self.segment_list.column("segment", width=320, anchor="w")
        self.segment_list.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        self.segment_list.bind("<<TreeviewSelect>>", lambda _e: self._on_segment_select())

        toolbar = ttk.Frame(mid, style="JPE.TFrame")
        toolbar.pack(fill="x")
        ttk.Button(toolbar, text="Save Segment", style="JPE.Primary.TButton", command=self._save_segment_target).pack(side="left")
        ttk.Label(toolbar, text="Status", style="JPE.Caption.TLabel").pack(side="left", padx=(14, 0))
        self.segment_status_combo = ttk.Combobox(
            toolbar,
            textvariable=self.segment_status_value,
            values=["new", "in_progress", "reviewed"],
            width=12,
            style="JPE.TCombobox",
        )
        self.segment_status_combo.pack(side="left", padx=(8, 0))
        self.segment_status_combo.bind("<<ComboboxSelected>>", lambda _e: self._apply_selected_status())
        ttk.Button(toolbar, text="Prev", style="JPE.Secondary.TButton", command=lambda: self._select_adjacent_segment(-1)).pack(
            side="left", padx=(14, 0)
        )
        ttk.Button(toolbar, text="Next", style="JPE.Secondary.TButton", command=lambda: self._select_adjacent_segment(1)).pack(
            side="left", padx=(10, 0)
        )
        ttk.Button(toolbar, text="Next Untranslated", style="JPE.Secondary.TButton", command=self._select_next_untranslated).pack(
            side="left", padx=(14, 0)
        )

        ttk.Label(mid, text="Source", style="JPE.Caption.TLabel").pack(anchor="w", pady=(14, 4))
        self.source_text = ScrolledText(mid, height=10, wrap="word")
        self.source_text.pack(fill="x", expand=False)
        self.source_text.configure(state="disabled")
        self._style_text_widget(self.source_text, readonly=True)

        ttk.Label(mid, text="Target", style="JPE.Caption.TLabel").pack(anchor="w", pady=(14, 4))
        self.target_text = ScrolledText(mid, height=10, wrap="word")
        self.target_text.pack(fill="x", expand=False)
        self._style_text_widget(self.target_text, readonly=False)
        self.target_text.bind("<KeyRelease>", lambda _e: self._on_target_edited())

        ttk.Label(mid, text="Note", style="JPE.Caption.TLabel").pack(anchor="w", pady=(14, 4))
        self.note_text = ScrolledText(mid, height=4, wrap="word")
        self.note_text.pack(fill="x", expand=False)
        self._style_text_widget(self.note_text, readonly=False)

        self.workspace_side_tabs = ttk.Notebook(right)
        self.workspace_side_tabs.pack(fill="both", expand=True, padx=10, pady=10)

        ctx_tab = ttk.Frame(self.workspace_side_tabs, style="JPE.Surface.TFrame")
        tm_tab = ttk.Frame(self.workspace_side_tabs, style="JPE.Surface.TFrame")
        gl_tab = ttk.Frame(self.workspace_side_tabs, style="JPE.Surface.TFrame")
        val_tab = ttk.Frame(self.workspace_side_tabs, style="JPE.Surface.TFrame")
        self.workspace_side_tabs.add(ctx_tab, text="Context")
        self.workspace_side_tabs.add(tm_tab, text="TM")
        self.workspace_side_tabs.add(gl_tab, text="Glossary")
        self.workspace_side_tabs.add(val_tab, text="Validate")

        ttk.Label(ctx_tab, text="Segment", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.segment_context = ttk.Label(ctx_tab, text="", justify="left", style="JPE.Muted.TLabel")
        self.segment_context.pack(fill="x", padx=12)
        ctx_actions = ttk.Frame(ctx_tab, style="JPE.Surface.TFrame")
        ctx_actions.pack(fill="x", padx=12, pady=(10, 12))
        ttk.Button(ctx_actions, text="Filter to File", style="JPE.Secondary.TButton", command=self._filter_to_selected_file).pack(
            side="left"
        )
        ttk.Button(ctx_actions, text="Clear Filter", style="JPE.Secondary.TButton", command=self._clear_segment_file_filter).pack(
            side="left", padx=(10, 0)
        )

        ttk.Label(tm_tab, text="Suggestions", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.tm_list = ttk.Treeview(tm_tab, columns=("score", "target"), show="headings", height=12, style="JPE.Treeview")
        self.tm_list.heading("score", text="Score")
        self.tm_list.heading("target", text="Target")
        self.tm_list.column("score", width=60, anchor="w")
        self.tm_list.column("target", width=320, anchor="w")
        self.tm_list.pack(fill="both", expand=True, padx=12)
        self.tm_list.bind("<Double-1>", lambda _e: self._apply_selected_tm_suggestion())

        tm_actions = ttk.Frame(tm_tab, style="JPE.Surface.TFrame")
        tm_actions.pack(fill="x", padx=12, pady=(10, 12))
        ttk.Button(tm_actions, text="Apply", style="JPE.Primary.TButton", command=self._apply_selected_tm_suggestion).pack(
            side="left"
        )
        ttk.Button(tm_actions, text="Next Untranslated", style="JPE.Secondary.TButton", command=self._select_next_untranslated).pack(
            side="left", padx=(10, 0)
        )

        ttk.Label(gl_tab, text="Hits in Source", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.glossary_hits_list = ttk.Treeview(gl_tab, columns=("count", "source", "target"), show="headings", height=12, style="JPE.Treeview")
        self.glossary_hits_list.heading("count", text="#")
        self.glossary_hits_list.heading("source", text="Source")
        self.glossary_hits_list.heading("target", text="Preferred Target")
        self.glossary_hits_list.column("count", width=40, anchor="w")
        self.glossary_hits_list.column("source", width=140, anchor="w")
        self.glossary_hits_list.column("target", width=180, anchor="w")
        self.glossary_hits_list.pack(fill="both", expand=True, padx=12)
        gl_actions = ttk.Frame(gl_tab, style="JPE.Surface.TFrame")
        gl_actions.pack(fill="x", padx=12, pady=(10, 12))
        ttk.Button(gl_actions, text="Insert Preferred", style="JPE.Secondary.TButton", command=self._insert_selected_glossary_target).pack(
            side="left"
        )
        ttk.Button(gl_actions, text="Copy Preferred", style="JPE.Secondary.TButton", command=self._copy_selected_glossary_target).pack(
            side="left", padx=(10, 0)
        )

        ttk.Label(val_tab, text="Placeholders", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.placeholder_summary = ttk.Label(val_tab, text="", justify="left", style="JPE.Muted.TLabel")
        self.placeholder_summary.pack(fill="x", padx=12, pady=(0, 8))
        ttk.Label(val_tab, text="Issues", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(8, 4))
        self.validation_list = ttk.Treeview(
            val_tab,
            columns=("severity", "code", "message"),
            show="headings",
            height=12,
            style="JPE.Treeview",
        )
        for col, title, w in (("severity", "Severity", 80), ("code", "Code", 170), ("message", "Message", 300)):
            self.validation_list.heading(col, text=title)
            self.validation_list.column(col, width=w, anchor="w")
        self.validation_list.pack(fill="both", expand=True, padx=12, pady=(0, 12))

    def _build_qa_tab(self) -> None:
        container = ttk.Frame(self.qa_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)

        header = ttk.Frame(container, style="JPE.TFrame")
        header.pack(fill="x", pady=(0, 10))
        ttk.Label(header, text="QA / Diagnostics", style="JPE.H2.TLabel").pack(side="left")
        ttk.Label(header, text="Filter issues and jump to segments.", style="JPE.Muted.TLabel").pack(side="left", padx=(10, 0))

        chips = ttk.Frame(container, style="JPE.TFrame")
        chips.pack(fill="x", pady=(0, 10))
        self.qa_chip_all = ttk.Button(chips, text="All", style="JPE.Chip.TButton", command=lambda: self._set_diag_severity("All"))
        self.qa_chip_err = ttk.Button(chips, text="Errors", style="JPE.Chip.TButton", command=lambda: self._set_diag_severity("ERROR"))
        self.qa_chip_warn = ttk.Button(chips, text="Warnings", style="JPE.Chip.TButton", command=lambda: self._set_diag_severity("WARNING"))
        self.qa_chip_info = ttk.Button(chips, text="Info", style="JPE.Chip.TButton", command=lambda: self._set_diag_severity("INFO"))
        for b in (self.qa_chip_all, self.qa_chip_err, self.qa_chip_warn, self.qa_chip_info):
            b.pack(side="left", padx=(0, 10))

        bar = ttk.Frame(container, style="JPE.TFrame")
        bar.pack(fill="x", pady=(0, 8))

        ttk.Label(bar, text="Severity", style="JPE.Caption.TLabel").pack(side="left")
        sev = ttk.Combobox(
            bar,
            textvariable=self.diag_severity_filter,
            values=["All", "FATAL", "ERROR", "WARNING", "INFO"],
            width=10,
            style="JPE.TCombobox",
        )
        sev.pack(side="left", padx=(6, 12))
        sev.bind("<<ComboboxSelected>>", lambda _e: self._render_diagnostics())

        ttk.Label(bar, text="Category", style="JPE.Caption.TLabel").pack(side="left")
        self.diag_category_combo = ttk.Combobox(
            bar, textvariable=self.diag_category_filter, values=["All"], width=14, style="JPE.TCombobox"
        )
        self.diag_category_combo.pack(side="left", padx=(6, 12))
        self.diag_category_combo.bind("<<ComboboxSelected>>", lambda _e: self._render_diagnostics())

        ttk.Checkbutton(
            bar,
            text="Segment-linked only",
            variable=self.diag_only_segment_linked,
            command=self._render_diagnostics,
            style="JPE.TCheckbutton",
        ).pack(side="left", padx=(0, 12))

        ttk.Label(bar, text="Search", style="JPE.Caption.TLabel").pack(side="left")
        q = ttk.Entry(bar, textvariable=self.diag_search_value, width=30, style="JPE.TEntry")
        q.pack(side="left", padx=(6, 12))
        q.bind("<KeyRelease>", lambda _e: self._render_diagnostics())

        ttk.Button(bar, text="Go To Segment", style="JPE.Primary.TButton", command=self._open_selected_diagnostic).pack(side="right")

        self.diag_summary = ttk.Label(container, text="", justify="left", style="JPE.Muted.TLabel")
        self.diag_summary.pack(fill="x", pady=(0, 8))

        self.diag_list = ttk.Treeview(
            container,
            columns=("severity", "category", "code", "file", "location", "message"),
            show="headings",
            style="JPE.Treeview",
        )
        for col, title, w in (
            ("severity", "Severity", 90),
            ("category", "Category", 120),
            ("code", "Code", 140),
            ("file", "File", 260),
            ("location", "Location", 180),
            ("message", "Message", 520),
        ):
            self.diag_list.heading(col, text=title)
            self.diag_list.column(col, width=w, anchor="w")
        self.diag_list.pack(fill="both", expand=True)
        self.diag_list.bind("<Double-1>", lambda _e: self._open_selected_diagnostic())

    def _build_build_tab(self) -> None:
        self.build_output_kind = StringVar(value="folder")
        self.build_output_path_value = StringVar(value="")
        self.build_zip_path_value = StringVar(value="")

        container = ttk.Frame(self.build_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        ttk.Label(container, text="Build/Export", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(container, text="Build writes to a new output path and never overwrites the source.", style="JPE.Muted.TLabel").pack(
            anchor="w", pady=(2, 12)
        )

        opts = ttk.LabelFrame(container, text="Output")
        opts.pack(fill="x")
        row = ttk.Frame(opts)
        row.pack(fill="x", padx=10, pady=(10, 6))
        ttk.Radiobutton(row, text="Folder", variable=self.build_output_kind, value="folder", style="JPE.TRadiobutton").pack(side="left")
        ttk.Radiobutton(row, text="Zip", variable=self.build_output_kind, value="zip", style="JPE.TRadiobutton").pack(
            side="left", padx=(12, 0)
        )

        row2 = ttk.Frame(opts)
        row2.pack(fill="x", padx=10, pady=(0, 10))
        ttk.Label(row2, text="Folder", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row2, textvariable=self.build_output_path_value, width=70, style="JPE.TEntry").pack(side="left", padx=(8, 8))
        ttk.Button(row2, text="Browse...", style="JPE.Secondary.TButton", command=self._browse_build_folder).pack(side="left")

        row3 = ttk.Frame(opts)
        row3.pack(fill="x", padx=10, pady=(0, 10))
        ttk.Label(row3, text="Zip", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row3, textvariable=self.build_zip_path_value, width=70, style="JPE.TEntry").pack(side="left", padx=(28, 8))
        ttk.Button(row3, text="Browse...", style="JPE.Secondary.TButton", command=self._browse_build_zip).pack(side="left")

        actions = ttk.Frame(container, style="JPE.TFrame")
        actions.pack(fill="x", pady=(12, 0))
        ttk.Button(actions, text="Build Now", style="JPE.Primary.TButton", command=self._build_from_build_tab).pack(side="left")
        ttk.Button(actions, text="Copy Last Output", style="JPE.Secondary.TButton", command=self._copy_last_output).pack(
            side="left", padx=(10, 0)
        )

        card = ttk.Frame(container, style="JPE.Card.TFrame")
        card.pack(fill="x", pady=(14, 0))
        self.build_summary = ttk.Label(card, text="", justify="left", style="JPE.TLabel")
        self.build_summary.pack(fill="x", padx=12, pady=12)

        ttk.Label(container, text="Build history", style="JPE.Caption.TLabel").pack(anchor="w", pady=(18, 6))
        hist_card = ttk.Frame(container, style="JPE.Card.TFrame")
        hist_card.pack(fill="both", expand=True)
        self.build_history_list = ttk.Treeview(
            hist_card,
            columns=("when", "output", "files", "segments", "diagnostics"),
            show="headings",
            height=10,
            style="JPE.Treeview",
        )
        for col, title, w in (
            ("when", "When", 160),
            ("output", "Output", 420),
            ("files", "Files", 80),
            ("segments", "Segments", 90),
            ("diagnostics", "Diags", 70),
        ):
            self.build_history_list.heading(col, text=title)
            self.build_history_list.column(col, width=w, anchor="w")
        self.build_history_list.pack(fill="both", expand=True, padx=12, pady=(12, 12))

    def _build_glossary_tab(self) -> None:
        container = ttk.Frame(self.glossary_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        header = ttk.Frame(container, style="JPE.TFrame")
        header.pack(fill="x", pady=(0, 10))
        ttk.Label(header, text="Glossary", style="JPE.H2.TLabel").pack(side="left")
        ttk.Label(header, text="Preferred and forbidden terms used during QA.", style="JPE.Muted.TLabel").pack(side="left", padx=(10, 0))

        bar = ttk.Frame(container, style="JPE.TFrame")
        bar.pack(fill="x", pady=(0, 8))

        ttk.Button(bar, text="Add", style="JPE.Primary.TButton", command=self._add_glossary_entry).pack(side="left")
        ttk.Button(bar, text="Edit", style="JPE.Secondary.TButton", command=self._edit_glossary_entry).pack(side="left", padx=(10, 0))
        ttk.Button(bar, text="Delete", style="JPE.Secondary.TButton", command=self._delete_glossary_entry).pack(side="left", padx=(10, 0))
        ttk.Button(bar, text="Import CSV...", style="JPE.Secondary.TButton", command=self._import_glossary).pack(side="left", padx=(18, 0))
        ttk.Button(bar, text="Export CSV...", style="JPE.Secondary.TButton", command=self._export_glossary).pack(side="left", padx=(10, 0))

        self.glossary_summary = ttk.Label(container, text="", justify="left", style="JPE.Muted.TLabel")
        self.glossary_summary.pack(fill="x", pady=(0, 8))

        self.glossary_list = ttk.Treeview(
            container,
            columns=("source", "target", "enabled", "mode", "note"),
            show="headings",
            style="JPE.Treeview",
        )
        for col, title, w in (
            ("source", "Source", 260),
            ("target", "Target", 260),
            ("enabled", "Enabled", 80),
            ("mode", "Mode", 90),
            ("note", "Note", 520),
        ):
            self.glossary_list.heading(col, text=title)
            self.glossary_list.column(col, width=w, anchor="w")
        self.glossary_list.pack(fill="both", expand=True)
        self.glossary_list.bind("<Double-1>", lambda _e: self._edit_glossary_entry())

    def _build_plugins_tab(self) -> None:
        container = ttk.Frame(self.plugins_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        header = ttk.Frame(container, style="JPE.TFrame")
        header.pack(fill="x", pady=(0, 10))
        ttk.Label(header, text="Plugins", style="JPE.H2.TLabel").pack(side="left")
        ttk.Label(
            header,
            text="Loaded extractors/validators + per-project paths and disable list.",
            style="JPE.Muted.TLabel",
        ).pack(side="left", padx=(10, 0))

        paths_card = ttk.Frame(container, style="JPE.Card.TFrame")
        paths_card.pack(fill="x")
        ttk.Label(paths_card, text="Plugin paths", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))

        self.plugin_paths_list = ttk.Treeview(paths_card, columns=("path",), show="headings", height=4, style="JPE.Treeview")
        self.plugin_paths_list.heading("path", text="Path")
        self.plugin_paths_list.column("path", width=860, anchor="w")
        self.plugin_paths_list.pack(fill="x", padx=12)

        paths_actions = ttk.Frame(paths_card, style="JPE.TFrame")
        paths_actions.pack(fill="x", padx=12, pady=(10, 12))
        ttk.Button(paths_actions, text="Add Path...", style="JPE.Primary.TButton", command=self._add_plugin_path).pack(side="left")
        ttk.Button(paths_actions, text="Remove", style="JPE.Secondary.TButton", command=self._remove_selected_plugin_path).pack(
            side="left", padx=(10, 0)
        )
        ttk.Button(paths_actions, text="Reload", style="JPE.Secondary.TButton", command=self._reload_plugins).pack(
            side="left", padx=(18, 0)
        )

        ttk.Label(container, text="Loaded plugins", style="JPE.Caption.TLabel").pack(anchor="w", pady=(14, 6))
        loaded_card = ttk.Frame(container, style="JPE.Card.TFrame")
        loaded_card.pack(fill="both", expand=True)

        self.loaded_plugins_list = ttk.Treeview(
            loaded_card,
            columns=("name", "path", "state"),
            show="headings",
            height=8,
            style="JPE.Treeview",
        )
        for col, title, w in (("name", "Name", 260), ("path", "Path", 520), ("state", "State", 90)):
            self.loaded_plugins_list.heading(col, text=title)
            self.loaded_plugins_list.column(col, width=w, anchor="w")
        self.loaded_plugins_list.pack(fill="both", expand=True, padx=12, pady=(12, 8))

        loaded_actions = ttk.Frame(loaded_card, style="JPE.TFrame")
        loaded_actions.pack(fill="x", padx=12, pady=(0, 12))
        ttk.Button(
            loaded_actions, text="Toggle Disable", style="JPE.Secondary.TButton", command=self._toggle_disable_selected_plugin
        ).pack(side="left")
        ttk.Button(loaded_actions, text="Copy Path", style="JPE.Secondary.TButton", command=self._copy_selected_plugin_path).pack(
            side="left", padx=(10, 0)
        )

        ttk.Label(container, text="Plugin diagnostics", style="JPE.Caption.TLabel").pack(anchor="w", pady=(14, 6))
        diag_card = ttk.Frame(container, style="JPE.Card.TFrame")
        diag_card.pack(fill="both", expand=True)
        self.plugin_diag_list = ttk.Treeview(
            diag_card,
            columns=("severity", "code", "file", "message"),
            show="headings",
            height=6,
            style="JPE.Treeview",
        )
        for col, title, w in (("severity", "Severity", 90), ("code", "Code", 160), ("file", "File", 280), ("message", "Message", 520)):
            self.plugin_diag_list.heading(col, text=title)
            self.plugin_diag_list.column(col, width=w, anchor="w")
        self.plugin_diag_list.pack(fill="both", expand=True, padx=12, pady=12)

    def _build_settings_tab(self) -> None:
        container = ttk.Frame(self.settings_tab, style="JPE.TFrame")
        container.pack(fill="both", expand=True, padx=16, pady=16)
        header = ttk.Frame(container, style="JPE.TFrame")
        header.pack(fill="x", pady=(0, 10))
        ttk.Label(header, text="Settings", style="JPE.H2.TLabel").pack(side="left")
        ttk.Label(
            header,
            text="Language pair + validation rules (stored in project JSON).",
            style="JPE.Muted.TLabel",
        ).pack(side="left", padx=(10, 0))

        grid = ttk.Frame(container, style="JPE.TFrame")
        grid.pack(fill="both", expand=True)

        left = ttk.Frame(grid, style="JPE.TFrame")
        left.pack(side="left", fill="both", expand=True)
        right = ttk.Frame(grid, style="JPE.TFrame")
        right.pack(side="left", fill="both", expand=True, padx=(14, 0))

        lang_card = ttk.Frame(left, style="JPE.Card.TFrame")
        lang_card.pack(fill="x")
        ttk.Label(lang_card, text="Language Pair", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.settings_source_locale = StringVar(value="en_US")
        self.settings_target_locale = StringVar(value="en_US")
        row = ttk.Frame(lang_card, style="JPE.TFrame")
        row.pack(fill="x", padx=12, pady=(0, 12))
        ttk.Label(row, text="Source", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row, textvariable=self.settings_source_locale, width=16, style="JPE.TEntry").pack(side="left", padx=(8, 14))
        ttk.Label(row, text="Target", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row, textvariable=self.settings_target_locale, width=16, style="JPE.TEntry").pack(side="left", padx=(8, 0))

        rules_card = ttk.Frame(left, style="JPE.Card.TFrame")
        rules_card.pack(fill="both", expand=True, pady=(14, 0))
        ttk.Label(rules_card, text="Validation Rules", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        ttk.Label(
            rules_card,
            text="Leave Enabled Rules empty to use defaults. One rule id per line (e.g., placeholder_parity).",
            style="JPE.Muted.TLabel",
            wraplength=520,
            justify="left",
        ).pack(anchor="w", padx=12, pady=(0, 10))

        ttk.Label(rules_card, text="Enabled Rules", style="JPE.Caption.TLabel").pack(anchor="w", padx=12)
        self.settings_enabled_rules = ScrolledText(rules_card, height=5, wrap="none")
        self.settings_enabled_rules.pack(fill="x", padx=12, pady=(4, 10))
        self._style_text_widget(self.settings_enabled_rules, readonly=False)

        ttk.Label(rules_card, text="Token Regexes (one per line)", style="JPE.Caption.TLabel").pack(anchor="w", padx=12)
        self.settings_token_regexes = ScrolledText(rules_card, height=5, wrap="none")
        self.settings_token_regexes.pack(fill="x", padx=12, pady=(4, 12))
        self._style_text_widget(self.settings_token_regexes, readonly=False)

        numeric_card = ttk.Frame(right, style="JPE.Card.TFrame")
        numeric_card.pack(fill="x")
        ttk.Label(numeric_card, text="Limits / Forbidden", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.settings_preserve_whitespace = BooleanVar(value=True)
        ttk.Checkbutton(
            numeric_card,
            text="Preserve leading/trailing whitespace (warn on change)",
            variable=self.settings_preserve_whitespace,
            style="JPE.Surface.TCheckbutton",
        ).pack(anchor="w", padx=12, pady=(0, 10))

        self.settings_max_target_len = StringVar(value="")
        self.settings_max_expansion_ratio = StringVar(value="")
        self.settings_forbidden_chars = StringVar(value="")

        row = ttk.Frame(numeric_card, style="JPE.TFrame")
        row.pack(fill="x", padx=12, pady=(0, 10))
        ttk.Label(row, text="Max target len", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row, textvariable=self.settings_max_target_len, width=10, style="JPE.TEntry").pack(side="left", padx=(10, 0))
        ttk.Label(row, text="Max expansion", style="JPE.Caption.TLabel").pack(side="left", padx=(14, 0))
        ttk.Entry(row, textvariable=self.settings_max_expansion_ratio, width=10, style="JPE.TEntry").pack(side="left", padx=(10, 0))

        row2 = ttk.Frame(numeric_card, style="JPE.TFrame")
        row2.pack(fill="x", padx=12, pady=(0, 12))
        ttk.Label(row2, text="Forbidden chars", style="JPE.Caption.TLabel").pack(side="left")
        ttk.Entry(row2, textvariable=self.settings_forbidden_chars, width=28, style="JPE.TEntry").pack(side="left", padx=(10, 0))

        rex_card = ttk.Frame(right, style="JPE.Card.TFrame")
        rex_card.pack(fill="both", expand=True, pady=(14, 0))
        ttk.Label(rex_card, text="Forbidden Regexes (one per line)", style="JPE.Caption.TLabel").pack(anchor="w", padx=12, pady=(12, 4))
        self.settings_forbidden_regexes = ScrolledText(rex_card, height=8, wrap="none")
        self.settings_forbidden_regexes.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        self._style_text_widget(self.settings_forbidden_regexes, readonly=False)

        actions = ttk.Frame(container, style="JPE.TFrame")
        actions.pack(fill="x", pady=(12, 0))
        ttk.Button(actions, text="Apply to Project", style="JPE.Primary.TButton", command=self._apply_settings_to_project).pack(
            side="left"
        )
        ttk.Button(actions, text="Re-Validate", style="JPE.Secondary.TButton", command=self._revalidate_project).pack(
            side="left", padx=(10, 0)
        )

    def _render_empty_state(self) -> None:
        self.project_summary.config(text="No project loaded.")
        self.project_details.config(text="No project loaded.")

    def _render_project(self) -> None:
        if not self.project:
            self._render_empty_state()
            return
        p = self.project
        self._configure_plugins_for_project()
        self.project_summary.config(
            text=(
                f"Source: {p.source_path}\n"
                f"Files: {len(p.files)}  Segments: {len(p.segments)}  Diagnostics: {len(p.diagnostics)}\n"
                f"Project File: {self.project_file_path or '(not saved)'}"
            )
        )
        self.project_details.config(
            text=(
                f"Source: {p.source_path}\n"
                f"Version: {p.version}\n"
                f"UID: {p.project_uid}"
            )
        )
        self._render_settings_from_project()
        self._render_plugins_from_project()
        self._refresh_workspace()
        self._render_diagnostics()
        self._render_glossary()
        self._render_build_history()

    def _open_project_json_from_path(self, path: Path) -> None:
        self.project_file_path = Path(path).expanduser().resolve()
        self.project = load_project(self.project_file_path)
        self._push_recent_project(self.project_file_path)
        self._render_project()
        self.notebook.select(self.project_tab)

    def _configure_plugins_for_project(self) -> None:
        if not self.project:
            return
        extra_dirs: list[Path] = []
        for raw in list(self.project.plugin_paths or []):
            s = str(raw or "").strip()
            if not s:
                continue
            try:
                extra_dirs.append(Path(s).expanduser().resolve())
            except Exception:
                extra_dirs.append(Path(s))
        plugins().configure(extra_dirs=extra_dirs, disabled_paths=list(self.project.disabled_plugins or []))

    def _render_plugins_from_project(self) -> None:
        if not hasattr(self, "plugin_paths_list") or not hasattr(self, "loaded_plugins_list") or not hasattr(self, "plugin_diag_list"):
            return
        for item in self.plugin_paths_list.get_children():
            self.plugin_paths_list.delete(item)
        for item in self.loaded_plugins_list.get_children():
            self.loaded_plugins_list.delete(item)
        for item in self.plugin_diag_list.get_children():
            self.plugin_diag_list.delete(item)

        if not self.project:
            return
        for i, p in enumerate(list(self.project.plugin_paths or [])):
            self.plugin_paths_list.insert("", "end", iid=str(i), values=(str(p),))

        reg = plugins().load()
        disabled: set[str] = set()
        for raw in list(self.project.disabled_plugins or []):
            try:
                disabled.add(str(Path(str(raw)).expanduser().resolve()))
            except Exception:
                disabled.add(str(raw))
        for i, pl in enumerate(list(reg.loaded or [])):
            state = "disabled" if pl.path in disabled else "enabled"
            self.loaded_plugins_list.insert("", "end", iid=str(i), values=(pl.name, pl.path, state))
        for i, d in enumerate(list(reg.diagnostics or [])[:200]):
            self.plugin_diag_list.insert("", "end", iid=str(i), values=(d.severity, d.code, d.file_path or "", d.message))

    def _render_settings_from_project(self) -> None:
        if not self.project:
            return
        if hasattr(self, "settings_source_locale"):
            self.settings_source_locale.set(str(self.project.source_locale or "en_US"))
        if hasattr(self, "settings_target_locale"):
            self.settings_target_locale.set(str(self.project.target_locale or "en_US"))
        rules = dict(self.project.validation or {})
        enabled = rules.get("enabled_rules")
        if hasattr(self, "settings_enabled_rules"):
            try:
                self.settings_enabled_rules.delete("1.0", "end")
                if enabled:
                    if isinstance(enabled, list):
                        self.settings_enabled_rules.insert("1.0", "\n".join(str(x) for x in enabled if str(x).strip()))
                    else:
                        self.settings_enabled_rules.insert("1.0", str(enabled))
            except Exception:
                pass
        if hasattr(self, "settings_token_regexes"):
            try:
                self.settings_token_regexes.delete("1.0", "end")
                token_rx = rules.get("token_regexes")
                if token_rx:
                    if isinstance(token_rx, list):
                        self.settings_token_regexes.insert("1.0", "\n".join(str(x) for x in token_rx if str(x).strip()))
                    else:
                        self.settings_token_regexes.insert("1.0", str(token_rx))
            except Exception:
                pass
        if hasattr(self, "settings_preserve_whitespace"):
            self.settings_preserve_whitespace.set(bool(rules.get("preserve_whitespace")) if "preserve_whitespace" in rules else True)
        if hasattr(self, "settings_max_target_len"):
            self.settings_max_target_len.set("" if rules.get("max_target_len") in (None, "") else str(rules.get("max_target_len")))
        if hasattr(self, "settings_max_expansion_ratio"):
            self.settings_max_expansion_ratio.set(
                "" if rules.get("max_expansion_ratio") in (None, "") else str(rules.get("max_expansion_ratio"))
            )
        if hasattr(self, "settings_forbidden_chars"):
            self.settings_forbidden_chars.set("" if rules.get("forbidden_chars") in (None, "") else str(rules.get("forbidden_chars")))
        if hasattr(self, "settings_forbidden_regexes"):
            try:
                self.settings_forbidden_regexes.delete("1.0", "end")
                fr = rules.get("forbidden_regexes")
                if fr:
                    if isinstance(fr, list):
                        self.settings_forbidden_regexes.insert("1.0", "\n".join(str(x) for x in fr if str(x).strip()))
                    else:
                        self.settings_forbidden_regexes.insert("1.0", str(fr))
            except Exception:
                pass

    def _add_plugin_path(self) -> None:
        if not self.project:
            messagebox.showinfo("JPE Studio", "Load a project first.")
            return
        p = filedialog.askdirectory(title="Add Plugin Folder")
        if not p:
            return
        raw = str(Path(p).expanduser().resolve())
        current = [str(x) for x in (self.project.plugin_paths or []) if str(x).strip()]
        if raw not in current:
            current.append(raw)
            self.project.plugin_paths = current
        self._reload_plugins()

    def _remove_selected_plugin_path(self) -> None:
        if not self.project or not hasattr(self, "plugin_paths_list"):
            return
        sel = self.plugin_paths_list.selection()
        if not sel:
            return
        vals = self.plugin_paths_list.item(sel[0], "values") or ()
        if not vals:
            return
        path = str(vals[0])
        self.project.plugin_paths = [p for p in list(self.project.plugin_paths or []) if str(p) != path]
        self._reload_plugins()

    def _reload_plugins(self) -> None:
        if not self.project:
            return
        self._configure_plugins_for_project()
        plugins().reset()
        self._configure_plugins_for_project()
        plugins().load()
        self._render_plugins_from_project()
        self._render_side_panels(self._current_segment())

    def _selected_loaded_plugin_path(self) -> str | None:
        if not hasattr(self, "loaded_plugins_list"):
            return None
        sel = self.loaded_plugins_list.selection()
        if not sel:
            return None
        vals = self.loaded_plugins_list.item(sel[0], "values") or ()
        if len(vals) < 2:
            return None
        return str(vals[1] or "").strip() or None

    def _toggle_disable_selected_plugin(self) -> None:
        if not self.project:
            return
        p = self._selected_loaded_plugin_path()
        if not p:
            return
        try:
            p_norm = str(Path(p).expanduser().resolve())
        except Exception:
            p_norm = p
        disabled = set(str(x) for x in list(self.project.disabled_plugins or []) if str(x).strip())
        if p_norm in disabled:
            disabled.remove(p_norm)
        else:
            disabled.add(p_norm)
        self.project.disabled_plugins = sorted(disabled)
        self._reload_plugins()

    def _copy_selected_plugin_path(self) -> None:
        p = self._selected_loaded_plugin_path()
        if not p:
            return
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(p)
        except Exception:
            pass

    def _apply_settings_to_project(self) -> None:
        if not self.project:
            messagebox.showinfo("JPE Studio", "Load a project first.")
            return

        self.project.source_locale = str(self.settings_source_locale.get() or "").strip() or None
        self.project.target_locale = str(self.settings_target_locale.get() or "").strip() or None

        rules: dict[str, object] = {}
        enabled = []
        try:
            enabled = [ln.strip() for ln in self.settings_enabled_rules.get("1.0", "end").splitlines() if ln.strip()]
        except Exception:
            enabled = []
        if enabled:
            rules["enabled_rules"] = enabled
        try:
            token_rx = [ln.strip() for ln in self.settings_token_regexes.get("1.0", "end").splitlines() if ln.strip()]
        except Exception:
            token_rx = []
        if token_rx:
            rules["token_regexes"] = token_rx

        rules["preserve_whitespace"] = bool(self.settings_preserve_whitespace.get())

        max_len = str(self.settings_max_target_len.get() or "").strip()
        if max_len:
            rules["max_target_len"] = max_len
        max_ratio = str(self.settings_max_expansion_ratio.get() or "").strip()
        if max_ratio:
            rules["max_expansion_ratio"] = max_ratio
        forb_chars = str(self.settings_forbidden_chars.get() or "").strip()
        if forb_chars:
            rules["forbidden_chars"] = forb_chars
        try:
            forb_rx = [ln.strip() for ln in self.settings_forbidden_regexes.get("1.0", "end").splitlines() if ln.strip()]
        except Exception:
            forb_rx = []
        if forb_rx:
            rules["forbidden_regexes"] = forb_rx

        self.project.validation = rules
        self._revalidate_project()
        if self.autosave_enabled and self.project_file_path:
            try:
                save_project(self.project, self.project_file_path)
            except Exception:
                pass

    def _revalidate_project(self) -> None:
        if not self.project:
            return
        new_diags = validate_project_segments(self.project.segments, glossary_entries=self.project.glossary, rules=self.project.validation)
        preserved: list[dict[str, object]] = []
        for d in list(self.project.diagnostics or []):
            cat = str(d.get("category") or "").strip().upper()
            if cat in {"VALIDATION", "GLOSSARY", "PLUGIN"}:
                continue
            preserved.append(d)
        preserved.extend([d.to_dict() for d in new_diags])
        self.project.diagnostics = preserved
        self._render_diagnostics()
        self._render_side_panels(self._current_segment())

    def _open_project_json(self) -> None:
        path = filedialog.askopenfilename(
            title="Open Project JSON",
            filetypes=[("JPE Project JSON", "*.json"), ("All files", "*.*")],
        )
        if not path:
            return
        self._open_project_json_from_path(Path(path))

    def _render_recents(self) -> None:
        if not hasattr(self, "recents_list"):
            return
        for item in self.recents_list.get_children():
            self.recents_list.delete(item)
        for p in self._recent_project_paths[:50]:
            self.recents_list.insert("", "end", values=(p,))

    def _selected_recent_path(self) -> Path | None:
        if not hasattr(self, "recents_list"):
            return None
        sel = self.recents_list.selection()
        if not sel:
            return None
        vals = self.recents_list.item(sel[0], "values")
        if not vals:
            return None
        try:
            return Path(str(vals[0]))
        except Exception:
            return None

    def _open_selected_recent(self) -> None:
        p = self._selected_recent_path()
        if not p:
            return
        if not p.exists():
            messagebox.showwarning("JPE Studio", "Project file no longer exists.")
            return
        self._open_project_json_from_path(p)

    def _remove_selected_recent(self) -> None:
        p = self._selected_recent_path()
        if not p:
            return
        try:
            raw = str(p.expanduser().resolve())
        except Exception:
            raw = str(p)
        self._recent_project_paths = [x for x in self._recent_project_paths if str(x) != raw]
        self._save_recent_projects()
        self._render_recents()

    def _clear_all_recents(self) -> None:
        self._recent_project_paths = []
        self._save_recent_projects()
        self._render_recents()

    def _open_folder(self) -> None:
        folder = filedialog.askdirectory(title="Open Mod Folder")
        if not folder:
            return
        self.load_project_from_path(Path(folder))

    def _open_zip(self) -> None:
        path = filedialog.askopenfilename(
            title="Open Mod Zip",
            filetypes=[("Zip archives", "*.zip"), ("All files", "*.*")],
        )
        if not path:
            return
        self.load_project_from_path(Path(path))

    def load_project_from_path(self, source_path: Path) -> None:
        source_path = source_path.expanduser()

        def work() -> object:
            return scan_project(source_path, merge_from_project_json=None)

        def done(out: object) -> None:
            project = getattr(out, "project", None)
            if not isinstance(project, Project):
                raise RuntimeError("Scan failed.")
            self.project = project
            self.project_file_path = None
            self._render_project()
            self.notebook.select(self.project_tab)

        self._run_task(title="Indexing/Scanning...", fn=work, on_success=done)

    def _open_import_wizard(self) -> None:
        win = Toplevel(self.root)
        win.title("Import Project")
        win.geometry("880x620")
        win.transient(self.root)
        try:
            win.configure(background=THEME.background)
        except Exception:
            pass

        step = {"n": 1}
        source_path_var = StringVar(value="")
        exclude_var = StringVar(value="*.png; *.jpg; *.jpeg; *.webp; *.package; *.ts4script")
        project_name_var = StringVar(value="")
        source_locale_var = StringVar(value="en_US")
        target_locale_var = StringVar(value="en_US")
        project_json_var = StringVar(value="")
        segment_estimate_var = StringVar(value="(not estimated yet)")
        scan_summary_var = StringVar(value="No scan yet.")
        diag_summary_var = StringVar(value="")
        plugin_paths: list[str] = []
        scan_result: dict[str, object] = {"project": None, "diagnostics": None}

        header = ttk.Frame(win, style="JPE.TFrame")
        header.pack(fill="x", padx=12, pady=(12, 6))
        title = ttk.Label(header, text="Project Import Wizard", style="JPE.H2.TLabel")
        title.pack(side="left")
        step_label = ttk.Label(header, text="Step 1 of 3", style="JPE.Muted.TLabel")
        step_label.pack(side="right")

        body = ttk.Frame(win, style="JPE.TFrame")
        body.pack(fill="both", expand=True, padx=12, pady=8)

        nav = ttk.Frame(win, style="JPE.TFrame")
        nav.pack(fill="x", padx=12, pady=(0, 12))
        back_btn = ttk.Button(nav, text="Back", style="JPE.Secondary.TButton")
        next_btn = ttk.Button(nav, text="Next", style="JPE.Primary.TButton")
        cancel_btn = ttk.Button(nav, text="Cancel", style="JPE.Secondary.TButton", command=win.destroy)
        cancel_btn.pack(side="right")
        next_btn.pack(side="right", padx=(8, 0))
        back_btn.pack(side="right", padx=(8, 0))

        step1 = ttk.Frame(body, style="JPE.TFrame")
        step2 = ttk.Frame(body, style="JPE.TFrame")
        step3 = ttk.Frame(body, style="JPE.TFrame")
        for f in (step1, step2, step3):
            f.pack_forget()

        # ---- Step 1
        ttk.Label(step1, text="Choose a mod folder or a .zip archive.", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(step1, text="Safety checks run during scan preview (Step 2).", style="JPE.Muted.TLabel").pack(anchor="w", pady=(2, 12))

        pick = ttk.Frame(step1)
        pick.pack(fill="x")
        ttk.Button(pick, text="Choose Folder…", style="JPE.Primary.TButton", command=lambda: _choose_source("folder")).pack(side="left")
        ttk.Button(pick, text="Choose Zip…", style="JPE.Secondary.TButton", command=lambda: _choose_source("zip")).pack(side="left", padx=(10, 0))

        ttk.Label(step1, text="Selected source", style="JPE.Caption.TLabel").pack(anchor="w", pady=(12, 4))
        src_entry = ttk.Entry(step1, textvariable=source_path_var, style="JPE.TEntry")
        src_entry.pack(fill="x")

        ttk.Label(step1, text="Notes").pack(anchor="w", pady=(14, 4))
        notes = ScrolledText(step1, height=10, wrap="word")
        notes.pack(fill="both", expand=True)
        notes.insert("1.0", "Scan preview will flag:\n- Zip path traversal (.., absolute paths)\n- Oversized archives/entries\n- Unknown file types\n")
        notes.configure(state="disabled")

        # ---- Step 2
        ttk.Label(step2, text="Scan preview (safe).", style="JPE.H2.TLabel").pack(anchor="w")
        ttk.Label(step2, text="Exclude patterns are glob-style and match POSIX paths inside the mod.", style="JPE.Muted.TLabel").pack(
            anchor="w", pady=(2, 10)
        )

        ex = ttk.Frame(step2)
        ex.pack(fill="x")
        ttk.Label(ex, text="Exclude patterns", style="JPE.Caption.TLabel").pack(side="left")
        ex_entry = ttk.Entry(ex, textvariable=exclude_var, style="JPE.TEntry")
        ex_entry.pack(side="left", fill="x", expand=True, padx=(8, 0))
        ttk.Button(ex, text="Run Scan Preview", style="JPE.Primary.TButton", command=lambda: _run_scan_preview()).pack(side="left", padx=(10, 0))

        preview = ttk.Frame(step2)
        preview.pack(fill="both", expand=True, pady=(10, 0))
        left = ttk.Frame(preview)
        left.pack(side="left", fill="both", expand=True)
        right = ttk.Frame(preview)
        right.pack(side="left", fill="both", expand=True, padx=(12, 0))

        ttk.Label(left, text="Summary", style="JPE.Caption.TLabel").pack(anchor="w")
        ttk.Label(left, textvariable=scan_summary_var, justify="left", style="JPE.TLabel").pack(anchor="w", pady=(2, 8))
        ttk.Label(left, text="Estimated segments", style="JPE.Caption.TLabel").pack(anchor="w")
        ttk.Label(left, textvariable=segment_estimate_var, justify="left", style="JPE.TLabel").pack(anchor="w", pady=(2, 0))

        ttk.Label(right, text="Warnings & diagnostics", style="JPE.Caption.TLabel").pack(anchor="w")
        ttk.Label(right, textvariable=diag_summary_var, justify="left", style="JPE.TLabel").pack(anchor="w", pady=(2, 6))
        diag_list = ttk.Treeview(right, columns=("sev", "code", "msg"), show="headings", height=12, style="JPE.Treeview")
        diag_list.heading("sev", text="Sev")
        diag_list.heading("code", text="Code")
        diag_list.heading("msg", text="Message")
        diag_list.column("sev", width=70, anchor="w")
        diag_list.column("code", width=170, anchor="w")
        diag_list.column("msg", width=520, anchor="w")
        diag_list.pack(fill="both", expand=True)

        # ---- Step 3
        ttk.Label(step3, text="Create project and extract segments.", style="JPE.H2.TLabel").pack(anchor="w")
        form = ttk.Frame(step3, style="JPE.TFrame")
        form.pack(fill="x", pady=(10, 0))

        def _row(label: str, var: StringVar) -> ttk.Entry:
            r = ttk.Frame(form, style="JPE.TFrame")
            r.pack(fill="x", pady=(0, 8))
            ttk.Label(r, text=label, width=18, style="JPE.Caption.TLabel").pack(side="left")
            e = ttk.Entry(r, textvariable=var, style="JPE.TEntry")
            e.pack(side="left", fill="x", expand=True)
            return e

        _row("Project name", project_name_var)
        _row("Source locale", source_locale_var)
        _row("Target locale", target_locale_var)

        plugins_box = ttk.LabelFrame(step3, text="Plugin paths (optional)")
        plugins_box.pack(fill="both", expand=True, pady=(10, 0))
        plugins_list = ttk.Treeview(plugins_box, columns=("path",), show="headings", height=6, style="JPE.Treeview")
        plugins_list.heading("path", text="Folder")
        plugins_list.column("path", width=760, anchor="w")
        plugins_list.pack(fill="both", expand=True, padx=8, pady=8)

        pb = ttk.Frame(plugins_box)
        pb.pack(fill="x", padx=8, pady=(0, 8))
        ttk.Button(pb, text="Add Folder...", style="JPE.Secondary.TButton", command=lambda: _add_plugin_path()).pack(side="left")
        ttk.Button(pb, text="Remove Selected", style="JPE.Secondary.TButton", command=lambda: _remove_plugin_path()).pack(
            side="left", padx=(10, 0)
        )

        out_row = ttk.Frame(step3, style="JPE.TFrame")
        out_row.pack(fill="x", pady=(12, 0))
        ttk.Label(out_row, text="Project JSON", width=18, style="JPE.Caption.TLabel").pack(side="left")
        out_entry = ttk.Entry(out_row, textvariable=project_json_var, style="JPE.TEntry")
        out_entry.pack(side="left", fill="x", expand=True)
        ttk.Button(out_row, text="Save As...", style="JPE.Primary.TButton", command=lambda: _choose_project_json()).pack(side="left", padx=(10, 0))

        start_btn = ttk.Button(step3, text="Start Extract", style="JPE.Primary.TButton", command=lambda: _start_extract())
        start_btn.pack(anchor="e", pady=(14, 0))

        def _parse_excludes() -> list[str]:
            raw = str(exclude_var.get() or "")
            parts: list[str] = []
            for chunk in raw.replace("\n", ";").split(";"):
                s = chunk.strip()
                if s:
                    parts.append(s)
            return parts

        def _choose_source(kind: str) -> None:
            if kind == "folder":
                folder = filedialog.askdirectory(title="Choose Mod Folder", parent=win)
                if not folder:
                    return
                p = Path(folder)
            else:
                z = filedialog.askopenfilename(
                    title="Choose Mod Zip",
                    parent=win,
                    filetypes=[("Zip archives", "*.zip"), ("All files", "*.*")],
                )
                if not z:
                    return
                p = Path(z)

            source_path_var.set(str(p))
            if not project_name_var.get().strip():
                project_name_var.set(p.stem)
            segment_estimate_var.set("(not estimated yet)")
            scan_summary_var.set("No scan yet.")
            diag_summary_var.set("")
            for item in diag_list.get_children():
                diag_list.delete(item)

        def _render_plugin_paths() -> None:
            for item in plugins_list.get_children():
                plugins_list.delete(item)
            for p in plugin_paths:
                plugins_list.insert("", "end", values=(p,))

        def _add_plugin_path() -> None:
            folder = filedialog.askdirectory(title="Add Plugin Folder", parent=win)
            if not folder:
                return
            p = str(Path(folder).expanduser())
            if p not in plugin_paths:
                plugin_paths.append(p)
            _render_plugin_paths()

        def _remove_plugin_path() -> None:
            sel = plugins_list.selection()
            if not sel:
                return
            for iid in sel:
                vals = plugins_list.item(iid, "values")
                if vals:
                    try:
                        plugin_paths.remove(str(vals[0]))
                    except ValueError:
                        pass
            _render_plugin_paths()

        def _choose_project_json() -> None:
            out = filedialog.asksaveasfilename(
                title="Save Project JSON As",
                parent=win,
                defaultextension=".json",
                filetypes=[("JPE Project JSON", "*.json"), ("All files", "*.*")],
            )
            if not out:
                return
            project_json_var.set(out)

        def _run_scan_preview() -> None:
            src = str(source_path_var.get() or "").strip()
            if not src:
                messagebox.showinfo("JPE Studio", "Choose a folder/zip first (Step 1).", parent=win)
                return
            source_path = Path(src)
            excludes = _parse_excludes()

            def work() -> object:
                return scan_project(source_path, exclude_globs=excludes)

            def done(out: object) -> None:
                project = getattr(out, "project", None)
                diagnostics = getattr(out, "diagnostics", None)
                if not isinstance(project, Project):
                    raise RuntimeError("Scan failed.")
                scan_result["project"] = project
                scan_result["diagnostics"] = list(diagnostics or [])

                kind_counts: dict[str, int] = {}
                for f in project.files:
                    kind = str(f.get("kind") or "")
                    kind_counts[kind] = kind_counts.get(kind, 0) + 1
                kinds = ", ".join(f"{k}:{kind_counts[k]}" for k in sorted(kind_counts.keys())[:10])
                total = len(project.files)
                translatable = sum(1 for f in project.files if str(f.get("kind") or "") in {"xml", "jpe-xml", "jpe", "json", "ini", "cfg"})
                scan_summary_var.set(f"Files: {total}\nTranslatable files (MVP kinds): {translatable}\nKinds (top): {kinds}")

                sev_counts: dict[str, int] = {}
                for d in scan_result["diagnostics"] or []:
                    sev = str(getattr(d, "severity", "") or "")
                    sev_counts[sev] = sev_counts.get(sev, 0) + 1
                diag_summary_var.set(
                    "  ".join(f"{k}:{sev_counts[k]}" for k in ["FATAL", "ERROR", "WARNING", "INFO"] if sev_counts.get(k))
                )
                for item in diag_list.get_children():
                    diag_list.delete(item)
                for d in (scan_result["diagnostics"] or [])[:200]:
                    diag_list.insert("", "end", values=(d.severity, d.code, d.message))  # type: ignore[attr-defined]

                def est_work() -> object:
                    count, _diags = estimate_project_segments(source_path, exclude_globs=excludes)
                    return count

                def est_done(val: object) -> None:
                    try:
                        segment_estimate_var.set(str(int(val)))
                    except Exception:
                        segment_estimate_var.set("(estimate failed)")

                self._run_task(title="Estimating segments...", fn=est_work, on_success=est_done)

            self._run_task(title="Scanning preview...", fn=work, on_success=done)

        def _start_extract() -> None:
            src = str(source_path_var.get() or "").strip()
            if not src:
                messagebox.showinfo("JPE Studio", "Choose a folder/zip first.", parent=win)
                return
            out_json = str(project_json_var.get() or "").strip()
            if not out_json:
                messagebox.showinfo("JPE Studio", "Choose where to save the project JSON.", parent=win)
                return
            source_path = Path(src)
            excludes = _parse_excludes()

            def work() -> object:
                return extract_project(
                    source_path,
                    merge_from_project_json=None,
                    exclude_globs=excludes,
                    plugin_paths=list(plugin_paths),
                    disabled_plugins=[],
                )

            def done(out: object) -> None:
                project = getattr(out, "project", None)
                if not isinstance(project, Project):
                    raise RuntimeError("Extract failed.")
                project.name = project_name_var.get().strip() or project.name
                project.source_locale = source_locale_var.get().strip() or project.source_locale
                project.target_locale = target_locale_var.get().strip() or project.target_locale
                project.exclude_globs = list(excludes)
                project.plugin_paths = list(plugin_paths)
                save_project(project, Path(out_json))
                self.project = project
                self.project_file_path = Path(out_json)
                self._render_project()
                win.destroy()
                messagebox.showinfo("JPE Studio", f"Created project with {len(project.segments)} segments.")
                self.notebook.select(self.workspace_tab)

            self._run_task(title="Extracting segments...", fn=work, on_success=done)

        def _show_step(n: int) -> None:
            step["n"] = n
            step_label.config(text=f"Step {n} of 3")
            back_btn.config(state=("disabled" if n == 1 else "normal"))
            next_btn.config(text=("Next" if n < 3 else "Close"))

            for f in (step1, step2, step3):
                f.pack_forget()
            if n == 1:
                step1.pack(fill="both", expand=True)
                next_btn.config(state=("normal" if source_path_var.get().strip() else "disabled"))
            elif n == 2:
                step2.pack(fill="both", expand=True)
                next_btn.config(state="normal")
                if source_path_var.get().strip() and scan_result["project"] is None:
                    _run_scan_preview()
            else:
                step3.pack(fill="both", expand=True)
                next_btn.config(state="normal")

        def _back() -> None:
            _show_step(max(1, step["n"] - 1))

        def _next() -> None:
            if step["n"] == 1:
                if not source_path_var.get().strip():
                    return
                _show_step(2)
                return
            if step["n"] == 2:
                _show_step(3)
                _render_plugin_paths()
                return
            win.destroy()

        back_btn.config(command=_back)
        next_btn.config(command=_next)

        def _watch_source(*_a: object) -> None:
            if step["n"] == 1:
                next_btn.config(state=("normal" if source_path_var.get().strip() else "disabled"))

        source_path_var.trace_add("write", _watch_source)

        _show_step(1)

    def _extract_segments(self) -> None:
        if not self.project:
            messagebox.showinfo("JPE Studio", "No project loaded.")
            return
        merge_from = self.project_file_path if (self.project_file_path and self.project_file_path.exists()) else None
        source_path = self.project.source_path

        def work() -> object:
            return extract_project(
                source_path,
                merge_from_project_json=merge_from,
                exclude_globs=list(getattr(self.project, "exclude_globs", None) or []),
                plugin_paths=list(getattr(self.project, "plugin_paths", None) or []),
                disabled_plugins=list(getattr(self.project, "disabled_plugins", None) or []),
            )

        def done(out: object) -> None:
            project = getattr(out, "project", None)
            if not isinstance(project, Project):
                raise RuntimeError("Extract failed.")
            # Preserve project-scoped fields that extraction doesn't own.
            if self.project:
                project.validation = dict(self.project.validation or {})
                project.glossary = list(self.project.glossary or project.glossary or [])
                project.build_history = list(self.project.build_history or [])
                project.remote_sources = list(self.project.remote_sources or [])
                project.plugin_paths = list(getattr(self.project, "plugin_paths", None) or [])
                project.disabled_plugins = list(getattr(self.project, "disabled_plugins", None) or [])
            self.project = project
            self._render_project()
            messagebox.showinfo("JPE Studio", f"Extracted segments: {len(self.project.segments)}")
            self.notebook.select(self.workspace_tab)

        self._run_task(title="Extracting segments...", fn=work, on_success=done)

    def _save_project(self) -> None:
        if not self.project:
            messagebox.showinfo("JPE Studio", "No project loaded.")
            return
        if not self.project_file_path:
            self._save_project_as()
            return
        save_project(self.project, self.project_file_path)
        messagebox.showinfo("JPE Studio", f"Saved:\n{self.project_file_path}")

    def _save_project_as(self) -> None:
        if not self.project:
            return
        out = filedialog.asksaveasfilename(
            title="Save Project JSON As",
            defaultextension=".json",
            filetypes=[("JPE Project JSON", "*.json"), ("All files", "*.*")],
        )
        if not out:
            return
        self.project_file_path = Path(out)
        self._save_project()

    # ----------------------------
    # Workspace helpers
    # ----------------------------

    def _filtered_segments(self) -> list[dict[str, object]]:
        if not self.project:
            return []
        return filter_segments(
            self.project.segments,
            query=str(self.segment_search.get() or ""),
            status=str(self.segment_status_filter.get() or "All"),
            file_path=self.segment_file_filter,
        )

    def _refresh_workspace(self) -> None:
        if not hasattr(self, "segment_list"):
            return
        self._render_segments()
        if not self.project:
            return
        if self._current_segment_id and any(str(s.get("id") or "") == self._current_segment_id for s in self.project.segments):
            try:
                self.segment_list.selection_set(self._current_segment_id)
            except Exception:
                pass
            self._on_segment_select()
        else:
            self._current_segment_id = None
            try:
                self.source_text.configure(state="normal")
                self.source_text.delete("1.0", "end")
                self.source_text.configure(state="disabled")
                self.target_text.delete("1.0", "end")
                self.note_text.delete("1.0", "end")
            except Exception:
                pass
            self._render_side_panels(None)

    def _render_segments(self) -> None:
        if not self.project or not hasattr(self, "segment_list"):
            return
        segs = sort_segments(self._filtered_segments())
        self._visible_segments = segs

        prog_all = compute_progress(self.project.segments)
        prog_vis = compute_progress(segs)
        file_hint = f"\nFile filter: {self.segment_file_filter}" if self.segment_file_filter else ""
        self.segment_progress.config(
            text=(
                f"Project: {prog_all.translated}/{prog_all.total} translated  {prog_all.reviewed}/{prog_all.total} reviewed\n"
                f"Visible: {prog_vis.translated}/{prog_vis.total} translated{file_hint}"
            )
        )

        for item in self.segment_list.get_children():
            self.segment_list.delete(item)

        for s in segs[:5000]:
            sid = str(s.get("id") or "")
            st = str(s.get("status") or "new")
            src = str(s.get("source") or "").replace("\n", " ").strip()
            fp = str(s.get("file_path") or "")
            display = f"{fp}: {src[:80]}"
            if sid:
                self.segment_list.insert("", "end", iid=sid, values=(st, display))

    def _current_segment(self) -> dict[str, object] | None:
        if not self.project or not self._current_segment_id:
            return None
        for s in self.project.segments:
            if str(s.get("id") or "") == self._current_segment_id:
                return s
        return None

    def _on_segment_select(self) -> None:
        sel = self.segment_list.selection() if hasattr(self, "segment_list") else ()
        if not sel:
            return
        self._current_segment_id = sel[0]
        seg = self._current_segment()
        if not seg:
            return

        self.segment_status_value.set(str(seg.get("status") or "new"))
        self._segment_loaded_target_empty = not bool(str(seg.get("target") or "").strip())

        self.source_text.configure(state="normal")
        self.source_text.delete("1.0", "end")
        self.source_text.insert("1.0", str(seg.get("source") or ""))
        self.source_text.configure(state="disabled")

        self.target_text.delete("1.0", "end")
        self.target_text.insert("1.0", str(seg.get("target") or ""))
        self.note_text.delete("1.0", "end")
        self.note_text.insert("1.0", str(seg.get("note") or ""))
        self._render_segment_context(seg)
        self._render_side_panels(seg)

    def _render_segment_context(self, seg: dict[str, object]) -> None:
        if not hasattr(self, "segment_context"):
            return
        fp = str(seg.get("file_path") or "")
        loc = str(seg.get("location") or "")
        sid = str(seg.get("id") or "")
        st = str(seg.get("status") or "new")
        self.segment_context.config(
            text=(
                f"ID: {sid}\n"
                f"Status: {st}\n"
                f"File: {fp}\n"
                f"Location: {loc}\n"
                f"File filter: {self.segment_file_filter or '(none)'}"
            )
        )

    def _filter_to_selected_file(self) -> None:
        seg = self._current_segment()
        if not seg:
            return
        fp = str(seg.get("file_path") or "").strip()
        if not fp:
            return
        self.segment_file_filter = fp
        self._render_segments()
        self._render_segment_context(seg)

    def _apply_selected_status(self) -> None:
        seg = self._current_segment()
        if not seg:
            return
        update_segment_editor_fields(
            seg,
            target=str(seg.get("target") or ""),
            note=str(seg.get("note") or ""),
            status=str(self.segment_status_value.get() or "new"),
        )
        self._render_segments()

    def _save_segment_target(self) -> None:
        if not self.project:
            return
        seg = self._current_segment()
        if not seg:
            return
        target = self.target_text.get("1.0", "end").rstrip("\n")
        note = self.note_text.get("1.0", "end").rstrip("\n")
        status = str(self.segment_status_value.get() or "new")
        update_segment_editor_fields(seg, target=target, note=note, status=status)
        self._render_segments()
        self._render_side_panels(seg)
        if self.autosave_enabled and self.project_file_path:
            try:
                save_project(self.project, self.project_file_path)
            except Exception:
                pass

    def _select_adjacent_segment(self, delta: int) -> None:
        if not self._visible_segments:
            return
        ids = [str(s.get("id") or "") for s in self._visible_segments if str(s.get("id") or "")]
        if not ids:
            return
        if not self._current_segment_id or self._current_segment_id not in ids:
            target = ids[0]
        else:
            idx = ids.index(self._current_segment_id)
            target = ids[(idx + delta) % len(ids)]
        try:
            self.segment_list.selection_set(target)
            self.segment_list.see(target)
        except Exception:
            return
        self._on_segment_select()

    def _select_next_untranslated(self) -> None:
        nid = next_untranslated_id(self._visible_segments, current_id=self._current_segment_id)
        if not nid:
            messagebox.showinfo("JPE Studio", "No untranslated segment in the current view.")
            return
        try:
            self.segment_list.selection_set(nid)
            self.segment_list.see(nid)
        except Exception:
            return
        self._on_segment_select()

    def _clear_segment_file_filter(self) -> None:
        self.segment_file_filter = None
        self._render_segments()
        seg = self._current_segment()
        if seg:
            self._render_segment_context(seg)
            self._render_side_panels(seg)

    def _render_side_panels(self, seg: dict[str, object] | None) -> None:
        self._render_tm_suggestions(seg)
        self._render_glossary_hits(seg)
        self._render_validation_panel(seg)

    def _on_target_edited(self) -> None:
        seg = self._current_segment()
        if not seg:
            return

        # UX: when the user first starts translating, flip status to in_progress.
        if self._segment_loaded_target_empty and str(self.segment_status_value.get() or "new") == "new":
            target = self.target_text.get("1.0", "end").rstrip("\n")
            if target.strip():
                self.segment_status_value.set("in_progress")
                self._segment_loaded_target_empty = False

        if self._target_change_after_id:
            try:
                self.root.after_cancel(self._target_change_after_id)
            except Exception:
                pass
        self._target_change_after_id = self.root.after(180, lambda: self._render_validation_panel(seg))

    def _render_tm_suggestions(self, seg: dict[str, object] | None) -> None:
        if not hasattr(self, "tm_list"):
            return
        for item in self.tm_list.get_children():
            self.tm_list.delete(item)
        self._tm_suggestions = []
        if not self.project or not seg:
            return

        src = str(seg.get("source") or "").strip()
        if not src:
            return
        tm_entries = build_tm_from_segments(self.project.segments)
        hits = suggest(tm_entries, src, limit=8, min_score=70)
        self._tm_suggestions = list(hits)
        for i, h in enumerate(hits):
            preview = h.target.replace("\n", " ").strip()
            self.tm_list.insert("", "end", iid=str(i), values=(str(h.score), preview[:120]))

    def _selected_tm_suggestion(self) -> Suggestion | None:
        if not hasattr(self, "tm_list"):
            return None
        sel = self.tm_list.selection()
        if not sel:
            return None
        try:
            idx = int(sel[0])
        except Exception:
            return None
        if idx < 0 or idx >= len(self._tm_suggestions):
            return None
        return self._tm_suggestions[idx]

    def _apply_selected_tm_suggestion(self) -> None:
        seg = self._current_segment()
        if not seg:
            return
        hit = self._selected_tm_suggestion()
        if hit is None:
            return
        self.target_text.delete("1.0", "end")
        self.target_text.insert("1.0", hit.target)
        if str(self.segment_status_value.get() or "new") == "new" and hit.target.strip():
            self.segment_status_value.set("in_progress")
            self._segment_loaded_target_empty = False
        self._render_validation_panel(seg)

    def _render_glossary_hits(self, seg: dict[str, object] | None) -> None:
        if not hasattr(self, "glossary_hits_list"):
            return
        for item in self.glossary_hits_list.get_children():
            self.glossary_hits_list.delete(item)
        if not self.project or not seg:
            return
        src = str(seg.get("source") or "")
        hits = glossary_hits(self.project.glossary or [], src, limit=50)
        for i, h in enumerate(hits):
            self.glossary_hits_list.insert("", "end", iid=str(i), values=(str(h.count), h.source, h.target))

    def _selected_glossary_hit_target(self) -> str | None:
        if not hasattr(self, "glossary_hits_list"):
            return None
        sel = self.glossary_hits_list.selection()
        if not sel:
            return None
        vals = self.glossary_hits_list.item(sel[0], "values") or ()
        if len(vals) < 3:
            return None
        tgt = str(vals[2] or "").strip()
        return tgt or None

    def _insert_selected_glossary_target(self) -> None:
        tgt = self._selected_glossary_hit_target()
        if not tgt:
            return
        try:
            self.target_text.insert("insert", tgt)
        except Exception:
            return
        self._on_target_edited()

    def _copy_selected_glossary_target(self) -> None:
        tgt = self._selected_glossary_hit_target()
        if not tgt:
            return
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(tgt)
        except Exception:
            pass

    def _render_validation_panel(self, seg: dict[str, object] | None) -> None:
        if not hasattr(self, "validation_list") or not hasattr(self, "placeholder_summary"):
            return
        for item in self.validation_list.get_children():
            self.validation_list.delete(item)
        self.placeholder_summary.config(text="")
        if not self.project or not seg:
            return

        source = str(seg.get("source") or "")
        target_live = ""
        try:
            target_live = self.target_text.get("1.0", "end").rstrip("\n")
        except Exception:
            target_live = str(seg.get("target") or "")

        src_ph = extract_placeholders(source)
        tgt_ph = extract_placeholders(target_live)
        missing = [p for p in src_ph if p not in tgt_ph]
        extra = [p for p in tgt_ph if p not in src_ph]
        missing_s = ", ".join(missing[:12]) + (" …" if len(missing) > 12 else "")
        extra_s = ", ".join(extra[:12]) + (" …" if len(extra) > 12 else "")
        self.placeholder_summary.config(
            text=(
                f"Source: {len(src_ph)}  Target: {len(tgt_ph)}\n"
                f"Missing: {missing_s or '(none)'}\n"
                f"Extra: {extra_s or '(none)'}"
            )
        )

        # Validate against the live editor text, but do not persist changes.
        shadow = dict(seg)
        shadow["target"] = target_live
        rules = dict(self.project.validation or {})
        diags = validate_segment(segment=shadow, glossary_entries=list(self.project.glossary or []), rules=rules)
        for i, d in enumerate(diags[:200]):
            self.validation_list.insert("", "end", iid=str(i), values=(d.severity, d.code, d.message))

    def _bind_shortcuts(self) -> None:
        # Keep bindings resilient in test/import contexts.
        try:
            self.root.bind_all("<Control-s>", lambda _e: self._save_segment_target())
            self.root.bind_all("<Control-Shift-S>", lambda _e: self._save_project())
            self.root.bind_all("<Control-Return>", lambda _e: (self._save_segment_target(), self._select_adjacent_segment(1)))
            self.root.bind_all("<Alt-Up>", lambda _e: self._select_adjacent_segment(-1))
            self.root.bind_all("<Alt-Down>", lambda _e: self._select_adjacent_segment(1))
            self.root.bind_all("<Control-j>", lambda _e: self._select_next_untranslated())
            self.root.bind_all("<Control-r>", lambda _e: self._mark_reviewed_and_next())
            self.root.bind_all("<Control-1>", lambda _e: self._apply_tm_index(0))
            self.root.bind_all("<Control-2>", lambda _e: self._apply_tm_index(1))
            self.root.bind_all("<Control-3>", lambda _e: self._apply_tm_index(2))
            self.root.bind_all("<Control-f>", lambda _e: self._focus_segment_search())
        except Exception:
            return

    def _focus_segment_search(self) -> None:
        try:
            self.notebook.select(self.workspace_tab)
        except Exception:
            pass

    def _mark_reviewed_and_next(self) -> None:
        seg = self._current_segment()
        if not seg:
            return
        self.segment_status_value.set("reviewed")
        self._save_segment_target()
        self._select_adjacent_segment(1)

    def _apply_tm_index(self, index: int) -> None:
        if index < 0 or index >= len(self._tm_suggestions):
            return
        try:
            self.workspace_side_tabs.select(1)
        except Exception:
            pass
        try:
            self.tm_list.selection_set(str(index))
            self.tm_list.see(str(index))
        except Exception:
            pass
        self._apply_selected_tm_suggestion()
        try:
            if hasattr(self, "segment_search_entry"):
                self.segment_search_entry.focus_set()
                return
        except Exception:
            pass

    # ----------------------------
    # QA / Diagnostics
    # ----------------------------

    def _render_diagnostics(self) -> None:
        if not self.project or not hasattr(self, "diag_list"):
            return
        for item in self.diag_list.get_children():
            self.diag_list.delete(item)

        diags = list(self.project.diagnostics or [])
        sev = str(self.diag_severity_filter.get() or "All").strip().upper()
        severities = None if sev == "ALL" else {sev}
        q = str(self.diag_search_value.get() or "")
        filtered = filter_diagnostics(diags, severities=severities, text=q)

        categories = sorted({str(d.get("category") or "UNCATEGORIZED") for d in diags})
        try:
            self.diag_category_combo.configure(values=["All"] + categories)
        except Exception:
            pass
        cat = str(self.diag_category_filter.get() or "All").strip()
        if cat != "All":
            filtered = [d for d in filtered if str(d.get("category") or "UNCATEGORIZED") == cat]
        if bool(self.diag_only_segment_linked.get()):
            filtered = [d for d in filtered if str(d.get("segment_id") or "").strip()]

        self._diag_rows = filtered
        summary = summarize_diagnostics(filtered)
        self.diag_summary.config(text=f"Diagnostics: {summary.get('total', 0)}  By severity: {summary.get('by_severity', {})}")

        if hasattr(self, "qa_chip_all"):
            all_diags = list(self.project.diagnostics or [])
            counts: dict[str, int] = {}
            for d in all_diags:
                sev_raw = str(d.get("severity") or "").upper()
                counts[sev_raw] = counts.get(sev_raw, 0) + 1
            try:
                self.qa_chip_all.config(text=f"All ({len(all_diags)})")
                self.qa_chip_err.config(text=f"Errors ({counts.get('ERROR', 0)})")
                self.qa_chip_warn.config(text=f"Warnings ({counts.get('WARNING', 0)})")
                self.qa_chip_info.config(text=f"Info ({counts.get('INFO', 0)})")
            except Exception:
                pass

        for i, d in enumerate(filtered[:2000]):
            self.diag_list.insert(
                "",
                "end",
                iid=str(i),
                values=(
                    d.get("severity") or "",
                    d.get("category") or "",
                    d.get("code") or "",
                    d.get("file_path") or "",
                    d.get("location") or "",
                    d.get("message") or "",
                ),
            )

    def _open_selected_diagnostic(self) -> None:
        if not self._diag_rows or not hasattr(self, "diag_list"):
            return
        sel = self.diag_list.selection()
        if not sel:
            return
        try:
            idx = int(sel[0])
        except Exception:
            return
        if idx < 0 or idx >= len(self._diag_rows):
            return
        sid = str(self._diag_rows[idx].get("segment_id") or "").strip()
        if not sid:
            messagebox.showinfo("JPE Studio", "Selected diagnostic is not tied to a segment.")
            return
        self.notebook.select(self.workspace_tab)
        try:
            self.segment_list.selection_set(sid)
            self.segment_list.see(sid)
        except Exception:
            pass
        self._on_segment_select()

    # ----------------------------
    # Build/Export
    # ----------------------------

    def _browse_build_folder(self) -> None:
        out_dir = filedialog.askdirectory(title="Select Output Folder")
        if out_dir:
            self.build_output_path_value.set(str(out_dir))

    def _browse_build_zip(self) -> None:
        out_zip = filedialog.asksaveasfilename(
            title="Build Zip As",
            defaultextension=".zip",
            filetypes=[("Zip archives", "*.zip"), ("All files", "*.*")],
        )
        if out_zip:
            self.build_zip_path_value.set(str(out_zip))

    def _ensure_segments_extracted(self) -> bool:
        if not self.project:
            messagebox.showinfo("JPE Studio", "No project loaded.")
            return False
        if not self.project.segments:
            messagebox.showinfo("JPE Studio", "No segments extracted yet. Use Home > Extract Segments first.")
            return False
        return True

    def _build_from_build_tab(self) -> None:
        if not self.project or not self._ensure_segments_extracted():
            return
        kind = str(self.build_output_kind.get() or "folder")
        out_dir = str(self.build_output_path_value.get() or "").strip()
        out_zip = str(self.build_zip_path_value.get() or "").strip()

        if kind == "folder":
            if not out_dir:
                self._browse_build_folder()
                out_dir = str(self.build_output_path_value.get() or "").strip()
            if not out_dir:
                return

            def work() -> object:
                return build_to_folder(project=self.project, output_dir=Path(out_dir))

            self._run_task(title="Building folder...", fn=work, on_success=self._apply_build_result)
        else:
            if not out_zip:
                self._browse_build_zip()
                out_zip = str(self.build_zip_path_value.get() or "").strip()
            if not out_zip:
                return

            def work() -> object:
                return build_to_zip(project=self.project, output_zip=Path(out_zip))

            self._run_task(title="Building zip...", fn=work, on_success=self._apply_build_result)

    def _apply_build_result(self, res: object) -> None:
        output_path = getattr(res, "output_path", None)
        self._last_build_output_path = str(output_path) if output_path is not None else None
        files_written = int(getattr(res, "files_written", 0) or 0)
        segments_applied = int(getattr(res, "segments_applied", 0) or 0)
        diagnostics = list(getattr(res, "diagnostics", []) or [])
        diag_total = len(diagnostics)

        self.build_summary.config(
            text=(
                f"Output: {output_path}\n"
                f"Files written: {files_written}  Segments applied: {segments_applied}\n"
                f"Diagnostics: {diag_total}"
            )
        )

        # Surface build diagnostics in QA.
        if self.project and diagnostics:
            self.project.diagnostics.extend([getattr(d, "to_dict")() for d in diagnostics if hasattr(d, "to_dict")])
            self._render_diagnostics()
        self._render_build_history()

        if self.autosave_enabled and self.project and self.project_file_path:
            try:
                save_project(self.project, self.project_file_path)
            except Exception:
                pass

        messagebox.showinfo("JPE Studio", f"Build complete:\n{output_path}")

    def _render_build_history(self) -> None:
        if not hasattr(self, "build_history_list"):
            return
        for item in self.build_history_list.get_children():
            self.build_history_list.delete(item)
        if not self.project:
            return
        history = list(self.project.build_history or [])
        history.sort(key=lambda x: str(x.get("built_at") or x.get("timestamp") or ""), reverse=True)
        for i, h in enumerate(history[:200]):
            when = str(h.get("built_at") or h.get("timestamp") or "")
            out = str(h.get("output") or h.get("output_path") or "")
            files = str(h.get("files_written") or "")
            segs = str(h.get("segments_applied") or "")
            diags = str(len(list(h.get("diagnostics") or [])))
            self.build_history_list.insert("", "end", iid=str(i), values=(when, out, files, segs, diags))

    def _copy_last_output(self) -> None:
        if not self._last_build_output_path:
            messagebox.showinfo("JPE Studio", "No build output yet.")
            return
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(self._last_build_output_path)
        except Exception:
            pass

    # ----------------------------
    # Glossary
    # ----------------------------

    def _render_glossary(self) -> None:
        if not hasattr(self, "glossary_list"):
            return
        for item in self.glossary_list.get_children():
            self.glossary_list.delete(item)
        if not self.project:
            self.glossary_summary.config(text="No project loaded.")
            return
        entries = list(self.project.glossary or [])
        entries.sort(key=lambda e: (str(e.get("source") or "").lower(), str(e.get("target") or "").lower()))
        enabled = sum(1 for e in entries if e.get("enabled") is not False)
        self.glossary_summary.config(text=f"Entries: {len(entries)}  Enabled: {enabled}")
        for i, e in enumerate(entries):
            gid = str(e.get("id") or str(i))
            self.glossary_list.insert(
                "",
                "end",
                iid=gid,
                values=(
                    e.get("source") or "",
                    e.get("target") or "",
                    "yes" if e.get("enabled") is not False else "no",
                    e.get("mode") or "preferred",
                    e.get("note") or "",
                ),
            )

    def _glossary_entry_dialog(self, title: str, initial: dict[str, object] | None = None) -> dict[str, object] | None:
        dlg = Toplevel(self.root)
        dlg.title(title)
        dlg.transient(self.root)
        dlg.grab_set()
        dlg.geometry("620x260")
        try:
            dlg.configure(background=THEME.background)
        except Exception:
            pass

        source = StringVar(value=str((initial or {}).get("source") or ""))
        target = StringVar(value=str((initial or {}).get("target") or ""))
        note = StringVar(value=str((initial or {}).get("note") or ""))
        enabled = BooleanVar(value=bool((initial or {}).get("enabled") is not False))
        mode = StringVar(value=str((initial or {}).get("mode") or "preferred"))

        form = ttk.Frame(dlg, style="JPE.TFrame")
        form.pack(fill="both", expand=True, padx=12, pady=12)
        ttk.Label(form, text=title, style="JPE.H2.TLabel").pack(anchor="w", pady=(0, 10))

        def row(label: str, var: StringVar) -> None:
            r = ttk.Frame(form, style="JPE.TFrame")
            r.pack(fill="x", pady=(0, 8))
            ttk.Label(r, text=label, width=14, style="JPE.Caption.TLabel").pack(side="left")
            ttk.Entry(r, textvariable=var, width=60, style="JPE.TEntry").pack(side="left", fill="x", expand=True)

        row("Source", source)
        row("Target", target)
        row("Note", note)

        opts = ttk.Frame(form, style="JPE.TFrame")
        opts.pack(fill="x", pady=(4, 0))
        ttk.Checkbutton(opts, text="Enabled", variable=enabled).pack(side="left")
        ttk.Label(opts, text="Mode", style="JPE.Caption.TLabel").pack(side="left", padx=(12, 6))
        ttk.Combobox(opts, textvariable=mode, values=["preferred", "forbidden"], width=12, style="JPE.TCombobox").pack(side="left")

        out: dict[str, object] | None = None

        def ok() -> None:
            nonlocal out
            src = str(source.get() or "").strip()
            if not src:
                messagebox.showinfo("JPE Studio", "Source term is required.")
                return
            out = {
                "source": src,
                "target": str(target.get() or "").strip(),
                "note": str(note.get() or "").strip(),
                "enabled": bool(enabled.get()),
                "mode": str(mode.get() or "preferred").strip().lower(),
            }
            try:
                dlg.grab_release()
            except Exception:
                pass
            dlg.destroy()

        def cancel() -> None:
            try:
                dlg.grab_release()
            except Exception:
                pass
            dlg.destroy()

        btns = ttk.Frame(dlg, style="JPE.TFrame")
        btns.pack(fill="x", padx=12, pady=(0, 12))
        ttk.Button(btns, text="Cancel", style="JPE.Secondary.TButton", command=cancel).pack(side="right")
        ttk.Button(btns, text="OK", style="JPE.Primary.TButton", command=ok).pack(side="right", padx=(0, 10))

        dlg.wait_window()
        return out

    def _add_glossary_entry(self) -> None:
        if not self.project:
            return
        data = self._glossary_entry_dialog("Add Glossary Entry")
        if not data:
            return
        data["id"] = glossary_entry_id(source=str(data.get("source") or ""), target=str(data.get("target") or ""))
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.project.glossary.append(data)
        self._render_glossary()

    def _edit_glossary_entry(self) -> None:
        if not self.project or not hasattr(self, "glossary_list"):
            return
        sel = self.glossary_list.selection()
        if not sel:
            return
        gid = sel[0]
        entry = next((e for e in self.project.glossary if str(e.get("id") or "") == gid), None)
        if not entry:
            return
        data = self._glossary_entry_dialog("Edit Glossary Entry", entry)
        if not data:
            return
        entry.update(data)
        entry["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._render_glossary()

    def _delete_glossary_entry(self) -> None:
        if not self.project or not hasattr(self, "glossary_list"):
            return
        sel = self.glossary_list.selection()
        if not sel:
            return
        gid = sel[0]
        self.project.glossary = [e for e in self.project.glossary if str(e.get("id") or "") != gid]
        self._render_glossary()

    def _import_glossary(self) -> None:
        if not self.project:
            return
        path = filedialog.askopenfilename(
            title="Import Glossary CSV",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
        )
        if not path:
            return
        res = import_glossary_csv(self.project, Path(path), overwrite=True)
        self._render_glossary()
        messagebox.showinfo("JPE Studio", f"Imported glossary:\nAdded: {res.added}\nUpdated: {res.updated}\nSkipped: {res.skipped}")

    def _export_glossary(self) -> None:
        if not self.project:
            return
        out = filedialog.asksaveasfilename(
            title="Export Glossary CSV",
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
        )
        if not out:
            return
        export_glossary_csv(self.project, Path(out))
        messagebox.showinfo("JPE Studio", f"Exported:\n{out}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="jpe-studio")
    parser.add_argument("--open", dest="open_path", help="Open a folder/zip/project json on startup.")
    args = parser.parse_args(argv)

    log_lines: list[str] = []
    log_lines.append(f"when: {datetime.now(timezone.utc).isoformat()}")
    log_lines.append(f"python: {sys.executable}")
    log_lines.append(f"cwd: {Path.cwd()}")
    log_lines.append(f"app_file: {Path(__file__).resolve()}")
    try:
        log_lines.append(f"sys.path[0]: {sys.path[0]}")
    except Exception:
        pass

    root: Tk | None = None
    try:
        root = Tk()
        app = StudioApp(root)
        try:
            log_lines.append(f"ttk_theme: {ttk.Style(master=root).theme_use()}")
        except Exception:
            pass
        try:
            log_lines.append(f"root_bg: {root.cget('background')}")
        except Exception:
            pass

        _write_startup_log("\n".join(log_lines) + "\n")

        if args.open_path:
            p = Path(args.open_path)
            if p.suffix.lower() == ".json":
                app._open_project_json_from_path(p)  # type: ignore[attr-defined]
            else:
                app.load_project_from_path(p)
        root.mainloop()
        return 0
    except Exception:
        log_lines.append("exception:")
        log_lines.append(traceback.format_exc())
        _write_startup_log("\n".join(log_lines) + "\n")
        try:
            if root is not None:
                messagebox.showerror("JPE Studio", f"Startup failed.\n\nLog: {_startup_log_path()}")
        except Exception:
            pass
        raise


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
