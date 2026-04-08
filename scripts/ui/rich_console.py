"""
Rich Console Output System for JPE Sims 4 Mod Translator.

This module enhances console output with rich formatting, colors, and advanced
visualization capabilities using the Rich library.
"""

import sys
from datetime import datetime
from typing import Any, Optional
from rich.console import Console
from rich.text import Text
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
from rich.tree import Tree
from rich.syntax import Syntax
from rich.prompt import Prompt
from rich.rule import Rule
from rich.columns import Columns
from rich.markdown import Markdown
from rich.logging import RichHandler
import logging
import io
from contextlib import redirect_stdout, redirect_stderr


class RichConsoleManager:
    """Manages Rich-enhanced console output for the application."""
    
    def __init__(self):
        self.console = Console()
        self.is_interactive = True  # Whether to use rich formatting
        
        # Store original output streams
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
        
        # Setup rich handler for logging
        self._setup_logging()
    
    def _setup_logging(self):
        """Setup Rich-enhanced logging."""
        # Remove default handlers
        logging.getLogger().handlers.clear()
        
        # Create rich handler
        rich_handler = RichHandler(
            console=self.console,
            show_time=True,
            show_path=True,
            markup=True,
            rich_tracebacks=True
        )
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format="%(message)s",
            handlers=[rich_handler]
        )
        
        # Set up our own logger
        self.logger = logging.getLogger(__name__)
    
    def print_success(self, message: str, title: Optional[str] = None):
        """Print a success message with rich formatting."""
        if title:
            panel = Panel(
                f"[bold green]✓[/bold green] {message}",
                title=f"[bold green]{title}[/bold green]",
                border_style="green",
                expand=False
            )
            self.console.print(panel)
        else:
            self.console.print(f"[bold green]✓[/bold green] {message}")
    
    def print_error(self, message: str, title: Optional[str] = None):
        """Print an error message with rich formatting."""
        if title:
            panel = Panel(
                f"[bold red]✗[/bold red] {message}",
                title=f"[bold red]{title}[/bold red]",
                border_style="red",
                expand=False
            )
            self.console.print(panel)
        else:
            self.console.print(f"[bold red]✗[/bold red] {message}")
    
    def print_warning(self, message: str, title: Optional[str] = None):
        """Print a warning message with rich formatting."""
        if title:
            panel = Panel(
                f"[bold yellow]⚠[/bold yellow] {message}",
                title=f"[bold yellow]{title}[/bold yellow]",
                border_style="yellow",
                expand=False
            )
            self.console.print(panel)
        else:
            self.console.print(f"[bold yellow]⚠[/bold yellow] {message}")
    
    def print_info(self, message: str, title: Optional[str] = None):
        """Print an info message with rich formatting."""
        if title:
            panel = Panel(
                f"[bold blue]ℹ[/bold blue] {message}",
                title=f"[bold blue]{title}[/bold blue]",
                border_style="blue",
                expand=False
            )
            self.console.print(panel)
        else:
            self.console.print(f"[bold blue]ℹ[/bold blue] {message}")
    
    def print_rule(self, title: str = "", style: str = "rule.line", align: str = "center"):
        """Print a decorative rule with optional title."""
        self.console.print(Rule(title=title, style=style, align=align))
    
    def print_code(self, code: str, language: str = "python", title: Optional[str] = None):
        """Print code with syntax highlighting."""
        syntax = Syntax(code, language, theme="monokai", line_numbers=True)
        if title:
            self.console.print(Panel(syntax, title=title, border_style="cyan"))
        else:
            self.console.print(syntax)
    
    def print_table(self, data: list, headers: list = None, title: Optional[str] = None):
        """Print data as a rich table."""
        table = Table(show_header=bool(headers), title=title, border_style="blue")
        
        if headers:
            for header in headers:
                table.add_column(header, style="bold magenta")
        
        for row in data:
            table.add_row(*[str(item) for item in row])
        
        self.console.print(table)
    
    def print_tree(self, tree_dict: dict, title: Optional[str] = None):
        """Print a tree structure (file system-like representation)."""
        def build_tree(parent_key: str, parent_value: Any, tree: Tree):
            if isinstance(parent_value, dict):
                for key, value in parent_value.items():
                    if isinstance(value, (dict, list)):
                        branch = tree.add(f"[bold cyan]{key}[/bold cyan]")
                        build_tree(key, value, branch)
                    else:
                        tree.add(f"[green]{key}[/green]: {value}")
            elif isinstance(parent_value, list):
                for i, item in enumerate(parent_value):
                    if isinstance(item, (dict, list)):
                        branch = tree.add(f"[bold cyan]Item {i}[/bold cyan]")
                        build_tree(f"Item {i}", item, branch)
                    else:
                        tree.add(f"[green]Item {i}[/green]: {item}")
        
        tree = Tree(f"[bold]{title}[/bold]" if title else "[bold]Tree View[/bold]")
        for key, value in tree_dict.items():
            if isinstance(value, (dict, list)):
                branch = tree.add(f"[bold cyan]{key}[/bold cyan]")
                build_tree(key, value, branch)
            else:
                tree.add(f"[green]{key}[/green]: {value}")
        
        self.console.print(tree)
    
    def create_progress_context(self, description: str = "Processing...") -> Progress:
        """Create a progress context for rich progress bars."""
        return Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            console=self.console
        )
    
    def print_build_report(self, report_data: dict):
        """Print a formatted build report."""
        # Create a panel for the build report
        report_panel = Panel(
            title="[bold]Build Report[/bold]",
            border_style="green"
        )
        
        # Add summary information
        summary_table = Table.grid(padding=(0, 2))
        summary_table.add_column(style="bold")
        summary_table.add_column()
        
        summary_table.add_row("Status:", f"[bold green]{report_data.get('status', 'Unknown')}[/bold green]")
        summary_table.add_row("Duration:", report_data.get('duration', 'N/A'))
        summary_table.add_row("Files Processed:", str(report_data.get('files_processed', 0)))
        summary_table.add_row("Errors:", f"[bold red]{report_data.get('errors', 0)}[/bold red]")
        summary_table.add_row("Warnings:", f"[bold yellow]{report_data.get('warnings', 0)}[/bold yellow]")
        
        self.console.print(summary_table)
        
        # Print details if available
        if 'details' in report_data:
            self.console.print("\n[bold]Details:[/bold]")
            for detail in report_data['details']:
                self.console.print(f"  • {detail}")
    
    def capture_output(self) -> io.StringIO:
        """Capture output to a buffer for later processing."""
        return io.StringIO()
    
    def print_log_section(self, title: str, content: str, style: str = "white"):
        """Print a section of log content with proper formatting."""
        self.console.print(f"\n[bold]{title}[/bold]")
        self.console.print(Rule(characters="-", style="dim"))
        
        # Split content into lines for better formatting if it's long
        lines = content.split('\n')
        for line in lines[:20]:  # Limit to first 20 lines
            if line.strip():
                self.console.print(Text(line, style=style))
        
        if len(lines) > 20:
            self.console.print(f"... ({len(lines) - 20} more lines)")
    
    def clear_screen(self):
        """Clear the console screen."""
        self.console.clear()
    
    def print_markdown(self, markdown_text: str):
        """Print markdown-formatted text."""
        md = Markdown(markdown_text)
        self.console.print(md)
    
    def prompt_user(self, prompt: str, default: str = "", password: bool = False) -> str:
        """Prompt the user for input with rich formatting."""
        return Prompt.ask(
            f"[bold blue]{prompt}[/bold blue]",
            default=default,
            password=password
        )
    
    def print_columns(self, items: list, title: Optional[str] = None):
        """Print items in columns."""
        columns = Columns(items, equal=True, expand=True)
        if title:
            self.console.print(Panel(columns, title=title, border_style="blue"))
        else:
            self.console.print(columns)
    
    def print_status(self, status_text: str, spinner: str = "dots", speed: float = 1.0):
        """Print a temporary status with a spinner."""
        from rich.status import Status
        status = Status(
            f"[bold blue]{status_text}[/bold blue]",
            spinner=spinner,
            spinner_style="status.spinner",
            speed=speed,
            refresh_per_second=12.5
        )
        return status


# Global rich console manager instance
rich_console_manager = RichConsoleManager()


class RichBuildReporter:
    """Specialized class for rich build reports."""
    
    def __init__(self, console_manager: RichConsoleManager = None):
        self.console_manager = console_manager or rich_console_manager
    
    def print_simple_report(self, success: bool, message: str):
        """Print a simple build success/failure report."""
        if success:
            self.console_manager.print_success(message, "Build Success")
        else:
            self.console_manager.print_error(message, "Build Failure")
    
    def print_detailed_report(self, 
                             project_name: str, 
                             status: str, 
                             duration: str, 
                             files_processed: int, 
                             errors: int, 
                             warnings: int,
                             details: list = None):
        """Print a detailed build report."""
        # Overall status panel
        if status.upper() == "SUCCESS":
            status_style = "green"
        elif status.upper() == "FAILED":
            status_style = "red"
        else:
            status_style = "yellow"
        
        overview_panel = Panel(
            f"[bold {status_style}]{status}[/bold {status_style}]",
            title=f"[bold]Build Report: {project_name}[/bold]",
            border_style=status_style
        )
        self.console_manager.console.print(overview_panel)
        
        # Stats table
        stats_table = Table.grid(padding=(1, 2))
        stats_table.add_column(style="bold")  # Labels
        stats_table.add_column()  # Values
        
        stats_table.add_row("Duration:", duration)
        stats_table.add_row("Files Processed:", str(files_processed))
        stats_table.add_row("Errors:", f"[bold red]{errors}[/bold red]" if errors > 0 else f"[green]{errors}[/green]")
        stats_table.add_row("Warnings:", f"[bold yellow]{warnings}[/bold yellow]" if warnings > 0 else f"[green]{warnings}[/green]")
        
        self.console_manager.console.print(stats_table)
        
        # Details section
        if details:
            self.console_manager.console.print("\n[bold]Build Details:[/bold]")
            for detail in details:
                if "error" in detail.lower():
                    self.console_manager.console.print(f"  [red]✗[/red] {detail}")
                elif "warning" in detail.lower():
                    self.console_manager.console.print(f"  [yellow]⚠[/yellow] {detail}")
                else:
                    self.console_manager.console.print(f"  [green]✓[/green] {detail}")
    
    def print_progress_report(self, current_step: int, total_steps: int, step_description: str):
        """Print a progress report for multi-step builds."""
        progress = (current_step / total_steps) * 100
        
        # Create a progress bar
        progress_bar = Progress(
            TextColumn("[bold blue]{task.description}"),
            BarColumn(bar_width=40),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            console=self.console_manager.console
        )
        
        task_id = progress_bar.add_task(
            description=f"[cyan]Step {current_step}/{total_steps}:[/cyan] {step_description}",
            total=100
        )
        progress_bar.update(task_id, completed=progress)
        
        # Print the progress bar
        with progress_bar:
            progress_bar.update(task_id, completed=progress)


# Global rich build reporter instance
rich_build_reporter = RichBuildReporter()